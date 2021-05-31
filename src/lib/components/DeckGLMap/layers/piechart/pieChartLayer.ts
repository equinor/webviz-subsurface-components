import { SolidPolygonLayer, SolidPolygonLayerProps } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";

const defaultProps = {
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getFillColor: (d) => d.properties.color,
    getPolygon: (d) => d.polygon,
};

export type PieChartLayerProps<D> = SolidPolygonLayerProps<D>;
export default class PieChartLayer extends SolidPolygonLayer<
    unknown,
    PieChartLayerProps<unknown>
> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    shouldUpdateState({ changeFlags }) {
        return changeFlags.viewportChanged;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    updateState({ props, oldProps, context, changeFlags }) {
        super.updateState({ props, oldProps, context, changeFlags });

        const zoom = context?.viewport?.zoom ?? 1;

        if (props.data?.pies !== undefined) {
            // Data is read and it is in proprietary format
            // We need to store this data. Zoom is realtive to it.
            // Store in new prop 'data_orig'
            let new_props = Object.assign(
                { ...props },
                { data_orig: props.data }
            );

            const new_data = makePies(props.data, zoom);
            new_props = Object.assign({ ...new_props }, { data: new_data });
            props.setLayerProps(props.id, new_props);
            return;
        }

        if (props.data_orig !== undefined) {
            const zoomed_data = makePies(props.data_orig, zoom);

            const new_props = Object.assign(
                { ...props },
                { data: zoomed_data }
            );
            props.setLayerProps(props.id, new_props);
        }
    }
}

PieChartLayer.layerName = "PieChartLayer";
PieChartLayer.defaultProps = defaultProps;

//================= Local help functions. ==================

// INPUT format:
// {
//     "pies": [ {"x": 433600, "y": 6477600, "R": 20, "props": [{"frac": 21, "color": [255, 0, 0], "label":"oil"}, {"frac": 7, "color": [0, 0, 255], "label":"water"}, {"frac": 11, "color": [0, 255, 0], "label":"gas"}]},
//               {"x": 434556, "y": 6478951, "R": 40, "props": [{"frac": 21, "color": [255, 0, 0], "label":"oil"}, {"frac": 9, "color": [0, 0, 255], "label":"water"}, {"frac":  8, "color": [0, 255, 0], "label":"gas"}, {"frac": 8, "color": [255, 255, 0], "label":"sand"}]},
//               ...
//             ]
// }
function makePies(data, zoom) {
    if (data.pies === undefined) {
        return;
    }

    const polygons: unknown[] = [];
    for (const pie of data.pies) {
        const pie_polygons = makePie(pie, zoom);
        for (const polygon of pie_polygons) {
            polygons.push(polygon);
        }
    }
    return polygons;
}

// return array of one pie's polygon's
function makePie(pie, zoom) {
    const dA = 10; // delta angle

    const x = pie.x;
    const y = pie.y;
    const R = pie.R;
    const R_zoom = R / Math.pow(2, zoom);

    const pie_props = pie.properties;

    // Normalize
    let sum = 0;
    for (const prop of pie_props) {
        sum += prop.frac;
    }

    const pie_polygons: unknown[] = [];
    let start_a = -90.0;
    for (let i = 0; i < pie_props.length; i++) {
        const frac = pie_props[i].frac / sum;
        const end_a = start_a + frac * 360.0;
        const coordinates: number[][] = [];
        coordinates.push([x, y]);
        for (let a = start_a; a < end_a; a += dA) {
            const rad = (a * (2.0 * Math.PI)) / 360.0;
            const xx = R_zoom * Math.cos(rad) + x;
            const yy = R_zoom * Math.sin(rad) + y;
            coordinates.push([xx, yy]);
        }
        const rad = (end_a * (2.0 * Math.PI)) / 360.0;
        const xx = R_zoom * Math.cos(rad) + x;
        const yy = R_zoom * Math.sin(rad) + y;
        coordinates.push([xx, yy]);
        coordinates.push([x, y]);

        const col = pie_props[i].color;
        const label = pie_props[i].label;
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
