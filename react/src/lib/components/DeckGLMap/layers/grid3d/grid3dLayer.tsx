import { CompositeLayer, LayersList, PickingInfo } from "@deck.gl/core/typed";
import { PolygonLayer } from "@deck.gl/layers/typed";
import {
    createPropertyData,
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { load, JSONLoader } from "@loaders.gl/core";
import { layersDefaultProps } from "../layersDefaultProps";

type POLYDATA = {
    polys: number[];
    points: number[];
    scalar?: number[];
    length: number;
};

type ITERATION_TYPE = {
    index: number;
    data: POLYDATA;
};

let CUR_IDX = 0;
const getPolygon = (index: number, data: POLYDATA) => {
    if (index == 0) CUR_IDX = 0;

    const n = data.polys[CUR_IDX];
    const ni = CUR_IDX + n + 1;
    const polys = data.polys.slice(CUR_IDX + 1, ni);
    CUR_IDX = ni;

    const positions: number[][] = [];
    polys.forEach((p) => {
        const position = data.points.slice(p * 3, p * 3 + 3) as number[];
        positions.push(position);
    });
    const sorted_positions = sortPositions(positions);
    sorted_positions.push(sorted_positions[0]);

    return sorted_positions;
};

const sortPositions = (points: number[][]): number[][] => {
    // Get the center (mean value) using reduce
    const center = points.reduce(
        (acc, [x, y, z]) => {
            acc.x += x / points.length;
            acc.y += y / points.length;
            acc.z += z / points.length;
            return acc;
        },
        { x: 0, y: 0, z: 0 }
    );

    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map((point) => {
        return {
            point: point,
            angle:
                (Math.atan2(
                    // point[2] - center.z,
                    point[1] - center.y,
                    point[0] - center.x
                ) *
                    180) /
                Math.PI,
        };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
    const sortedPoints = pointsSorted.map((point) => point.point);
    return sortedPoints;
};

const getFillColor = (index: number, scalar: number[]) => {
    const x = scalar[index];
    if (x < 0.1) return [248, 243, 141, 255];
    if (x >= 0.1 && x < 0.2) return [255, 180, 128, 255];
    else return [255, 105, 97, 255];
};

const getCellCountFromPolygon = (data: number[]): number => {
    let count = 1;
    let cur_pos = 0;
    let cur_val = data[cur_pos];
    let next_pos = 0;

    while (cur_pos + cur_val < data.length - 1) {
        next_pos = cur_pos + cur_val + 1;
        const next_val = data[next_pos];
        cur_pos = next_pos;
        cur_val = next_val;
        count += 1;
    }

    return count;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getData = (data: any) => {
    const points = data.points;
    const polys = data.polys;
    const scalar = data.scalar;

    return {
        points: points,
        polys: polys,
        scalar: scalar,
        length: getCellCountFromPolygon(polys),
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAsyncData = async (data: any) => {
    const points =
        typeof data.points === "string"
            ? await load(data.points, JSONLoader)
            : data.points;
    const polys =
        typeof data.polys === "string"
            ? await load(data.polys, JSONLoader)
            : data.polys;
    const scalar =
        typeof data.scalar === "string"
            ? await load(data.scalar, JSONLoader)
            : data.scalar;

    return {
        points: points,
        polys: polys,
        scalar: scalar,
        length: getCellCountFromPolygon(polys),
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDataFromURL = (data: any) => {
    const is_points_url = typeof data.points === "string";
    const is_polys_url = typeof data.polys === "string";
    const is_scalar_url = data?.scalar && typeof data?.scalar === "string";

    return is_points_url || is_polys_url || is_scalar_url;
};

export interface Grid3DLayerProps<D> extends ExtendedLayerProps<D> {
    filled: boolean;
    material: boolean;
}
export default class Grid3DLayer extends CompositeLayer<
    Grid3DLayerProps<POLYDATA>
> {
    renderLayers(): LayersList {
        const grid3d = new PolygonLayer(
            this.getSubLayerProps({
                id: "PolygonLayer",
                data: isDataFromURL(this.props.data)
                    ? getAsyncData(this.props.data)
                    : getData(this.props.data),

                elevationScale: 0,
                extruded: true,
                filled: this.props.filled,

                getPolygon: (_: unknown, { index, data }: ITERATION_TYPE) =>
                    getPolygon(index, data),

                getFillColor: (_: unknown, { index, data }: ITERATION_TYPE) =>
                    data.scalar
                        ? getFillColor(index, data.scalar)
                        : [0, 0, 0, 0],

                getLineColor: [0, 0, 0, 255],

                material: this.props.material,
                stroked: true,
                wireframe: true, // it works only if extruded = true

                autoHighlight: true,
                highlightColor: [0, 0, 128, 128],
                pickable: true,
            })
        );

        return [grid3d];
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        const layer_properties: PropertyDataType[] = [];

        const depth_value = (info.sourceLayer?.props.data as POLYDATA).points[
            (info.index + 1) * 3 - 1
        ];
        if (depth_value) {
            layer_properties.push(createPropertyData("Depth", depth_value));
        }

        const property_value = (info.sourceLayer?.props.data as POLYDATA)
            .scalar?.[info.index];
        if (property_value) {
            layer_properties.push(
                createPropertyData("Property", property_value)
            );
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

Grid3DLayer.layerName = "Grid3DLayer";
Grid3DLayer.defaultProps = {
    ...(layersDefaultProps["Grid3DLayer"] as Grid3DLayerProps<POLYDATA>),
};
