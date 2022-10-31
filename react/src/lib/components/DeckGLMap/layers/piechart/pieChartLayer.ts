import {
    CompositeLayer,
    Color,
    Position,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core/typed";
import { ExtendedLayerProps, isDrawingEnabled } from "../utils/layerTools";
import { SolidPolygonLayer } from "@deck.gl/layers/typed";
import { layersDefaultProps } from "../layersDefaultProps";
import { DeckGLLayerContext } from "../../components/Map";
import { Vector3 } from "@math.gl/core";

type PieProperties = [{ color: Color; label: string }];

type PieData = {
    x: number;
    y: number;
    R: number;
    fractions: [{ value: number; idx: number }];
};

// These are the data PieChartLayer expects.
interface PiesData {
    pies: PieData[];
    properties: PieProperties;
}

// These are the data SolidPolygonLayer expects.
interface PolygonData {
    polygon: Position[];
    properties: {
        color: Color;
        name: string;
        pieIndex: number;
    };
}

export interface PieChartLayerProps<D> extends ExtendedLayerProps<D> {
    selectedPie: D;
}

export default class PieChartLayer extends CompositeLayer<
    PieChartLayerProps<PiesData>
> {
    onClick(info: PickingInfo): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            const pie_idx = (info.object as PolygonData)?.properties.pieIndex;
            (this.context as DeckGLLayerContext).userData.setEditedData({
                selectedPie: (this.props.data as unknown as PiesData)?.pies[
                    pie_idx
                ],
            });
            return true;
        }
    }

    shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean {
        return changeFlags.viewportChanged;
    }

    renderLayers(): SolidPolygonLayer<PolygonData>[] {
        const is_orthographic =
            this.context.viewport.constructor.name === "OrthographicViewport";

        const npixels = 100;
        const p1 = is_orthographic ? [0, 0, 0] : [0, 0];
        const p2 = is_orthographic ? [npixels, 0, 0] : [npixels, 0];

        const v1 = new Vector3(this.context.viewport.unproject(p1));
        const v2 = new Vector3(this.context.viewport.unproject(p2));
        const d = v1.distance(v2);

        // Factor to convert a length in pixels to a length in world space.
        const pixels2world = d / npixels;

        const pieData = this.props.data as unknown as PiesData;
        if (!pieData?.pies) {
            // this.props.data is a sum type, and since TS doesn't have
            // pattern matching, we must check it this way.
            return [];
        }

        const layer = new SolidPolygonLayer<PolygonData>(
            this.getSubLayerProps({
                data: makePies(pieData, pixels2world),
                getFillColor: (d: PolygonData) => d.properties.color,
            })
        );
        return [layer];
    }
}

PieChartLayer.layerName = "PieChartLayer";
PieChartLayer.defaultProps = layersDefaultProps[
    "PieChartLayer"
] as PieChartLayerProps<PiesData>;

//================= Local help functions. ==================

function makePies(data: PiesData, pixels2world: number): PolygonData[] {
    let polygons: PolygonData[] = [];
    let pie_index = 0;
    for (const pie of data.pies) {
        polygons = polygons.concat(
            makePie(pie, data.properties, pie_index++, pixels2world)
        );
    }
    return polygons;
}

// return array of one pie's polygon's
function makePie(
    pie: PieData,
    properties: PieProperties,
    pieIndex: number,
    pixels2world: number
): PolygonData[] {
    const dA = 10; // delta angle

    const x = pie.x;
    const y = pie.y;
    const R = pie.R * pixels2world; // R: Radius in world coordinates.

    // Normalize
    let sum = 0;
    for (const frac of pie.fractions) {
        sum += frac.value;
    }

    const pie_polygons: PolygonData[] = [];
    let start_a = -90.0;
    for (let i = 0; i < pie.fractions.length; i++) {
        const frac = pie.fractions[i].value / sum;
        const end_a = start_a + frac * 360.0;
        const coordinates: Position[] = [];
        coordinates.push([x, y]);
        for (let a = start_a; a < end_a; a += dA) {
            const rad = (a * (2.0 * Math.PI)) / 360.0;
            const xx = R * Math.cos(rad) + x;
            const yy = R * Math.sin(rad) + y;
            coordinates.push([xx, yy]);
        }
        const rad = (end_a * (2.0 * Math.PI)) / 360.0;
        const xx = R * Math.cos(rad) + x;
        const yy = R * Math.sin(rad) + y;
        coordinates.push([xx, yy]);
        coordinates.push([x, y]);

        const prop = properties[pie.fractions[i].idx];
        const col = prop?.color ?? [255, 0, 255]; // magenta
        const label = prop?.label ?? "no label";

        pie_polygons.push({
            polygon: coordinates,
            properties: {
                color: col,
                name: label + ": " + (frac * 100).toFixed(1) + "%",
                pieIndex: pieIndex,
            },
        });
        start_a = end_a;
    }
    return pie_polygons;
}
