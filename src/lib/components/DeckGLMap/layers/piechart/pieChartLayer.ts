import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { SolidPolygonLayer, SolidPolygonLayerProps } from "@deck.gl/layers";
import { Position } from "@deck.gl/core/utils/positions";
import { RGBAColor } from "@deck.gl/core/utils/color";

// INPUT format (PieData):
// {
//     "pies": [ {"x": 433600, "y": 6477600, "R": 20, "fractions": [{"value":21, "idx":0}, {"value":13, "idx":1}, {"value":8, "idx":2}]},
//               {"x": 434556, "y": 6478951, "R": 40, "fractions": [{"value":12, "idx":0}, {"value":18, "idx":1}, {"value":7, "idx":2}]},
//               {"x": 437086, "y": 6477198, "R": 30, "fractions": [{"value":16, "idx":0}, {"value":20, "idx":1}, {"value":6, "idx":2}]}
//             ],

//     "properties": [{"color": [255, 0, 0], "label":"oil"}, {"color": [0, 0, 255], "label":"water"}, {"color": [0, 255, 0], "label":"gas"}, {"color": [0, 255, 255], "label":"sand"}]
// }

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

const defaultProps = {};
export default class PieChartLayer extends CompositeLayer<
    PiesData,
    PieChartLayerProps<PiesData>
> {
    renderLayers(): SolidPolygonLayer<PolygonData>[] {
        const layer = new SolidPolygonLayer<PolygonData>(
            this.getSubLayerProps({
                id: "pie-layer",
                data: makePies(this.props.data as PiesData),
                pickable: true,
                getFillColor: (d: {
                    properties: { color: RGBAColor; label: string };
                }) => d?.properties?.color ?? [0, 0, 0],
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
