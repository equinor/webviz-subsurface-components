import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { Position } from "@deck.gl/core/utils/positions";
import { SolidPolygonLayer } from "@deck.gl/layers";

type PieProperties = [{ color: RGBAColor; label: string }];

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
        color: RGBAColor;
        name: string;
    };
}

export type PieChartLayerProps<D> = CompositeLayerProps<D>;

const defaultProps = {
    pickable: true,
};
export default class PieChartLayer extends CompositeLayer<
    PiesData,
    PieChartLayerProps<PiesData>
> {
    renderLayers(): SolidPolygonLayer<PolygonData>[] {
        const pieData = this.props.data as PiesData;
        if (!pieData?.pies) {
            // this.props.data is a sum type, and since TS doesn't have
            // pattern matching, we must check it this way.
            return [];
        }

        const layer = new SolidPolygonLayer<PolygonData>(
            this.getSubLayerProps<PolygonData, SolidPolygonLayer<PolygonData>>({
                data: makePies(pieData),
                getFillColor: (d: PolygonData) => d.properties.color,
            })
        );
        return [layer];
    }
}

PieChartLayer.layerName = "PieChartLayer";
PieChartLayer.defaultProps = defaultProps;

//================= Local help functions. ==================

function makePies(data: PiesData): PolygonData[] {
    let polygons: PolygonData[] = [];
    for (const pie of data.pies) {
        polygons = polygons.concat(makePie(pie, data.properties));
    }
    return polygons;
}

// return array of one pie's polygon's
function makePie(pie: PieData, properties: PieProperties): PolygonData[] {
    const dA = 10; // delta angle

    const x = pie.x;
    const y = pie.y;
    const R = pie.R;

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
            },
        });
        start_a = end_a;
    }
    return pie_polygons;
}
