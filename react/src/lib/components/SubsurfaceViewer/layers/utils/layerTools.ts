import { PickingInfo } from "@deck.gl/core/typed";
import { Color } from "@deck.gl/core/typed";
import {
    Layer,
    LayersList,
    LayerManager,
    CompositeLayerProps,
} from "@deck.gl/core/typed";
import { Matrix4 } from "math.gl";
import {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import DrawingLayer from "../drawing/drawingLayer";

export type Position3D = [number, number, number];

// Return a color given a number in the [0,1] range.
export type colorMapFunctionType = (x: number) => [number, number, number];

export interface ExtendedLayerProps<D> extends CompositeLayerProps<D> {
    "@@type"?: string;
    name: string;
}

export interface ExtendedLayer<D> extends Layer<D> {
    getLegendData?: () => DiscreteLegendDataType | ContinuousLegendDataType;
}

export interface PropertyDataType {
    name: string;
    value: string | number;
    color?: Color;
}

// Layer pick info can have multiple properties
export interface LayerPickInfo extends PickingInfo {
    propertyValue?: number; // for single property
    properties?: PropertyDataType[]; // for multiple properties
}

// Creates property object which will be used to display layer property
// in the info card.
export function createPropertyData(
    name: string,
    value: string | number,
    color?: Color
): PropertyDataType {
    return {
        name: name,
        value: value,
        color: color,
    };
}

// Return a model matrix representing a rotation of "deg" degrees around the point x, y
export function getModelMatrix(deg: number, x: number, y: number): Matrix4 {
    const rad = deg * 0.017453;
    const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    const m1 = new Matrix4(IDENTITY).translate([-x, -y, 0, 1]); // translate to origin
    const mRot = new Matrix4(IDENTITY).rotateZ(rad); // rotate
    const m2 = new Matrix4(IDENTITY).translate([x, y, 0, 1]); // translate back

    // Make  m2*mRot*m1
    mRot.multiplyRight(m1);
    const m2mRotm1 = m2.multiplyRight(mRot);

    return m2mRotm1;
}

// Return a model matrix representing a rotation of "deg" degrees around the point x, y
export function getModelMatrixScale(scaleZ: number): Matrix4 {
    const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const mScaleZ = new Matrix4(IDENTITY).scale([1, 1, scaleZ]);
    return mScaleZ;
}

export function getLayersInViewport(
    layers: Record<string, unknown>[] | LayersList,
    layerIds: string[] | undefined
): Record<string, unknown>[] | LayersList {
    if (layerIds && layerIds.length > 0 && layers) {
        const layers_in_view = (layers as never[]).filter((layer) =>
            layerIds.includes(layer["id"] as string)
        );
        return layers_in_view;
    } else {
        return layers;
    }
}

export function getLayersByType(layers: LayersList, type: string): LayersList {
    if (!layers) return [];
    return layers.filter((l) => l?.constructor.name === type);
}

export type NewLayersList = LayersList & {
    id: string;
    props: prop;
};

type prop = {
    data: wellData;
    visible: boolean;
};

type wellData = {
    features: feature[];
    type: string;
    unit?: string;
};

type feature = {
    properties: {
        name: string;
    };
};

export function getWellLayerByTypeAndSelectedWells(
    layers: LayersList,
    type: string,
    selectedWell: string
): LayersList {
    if (!layers) return [];
    return layers.filter((l) => {
        return (
            l?.constructor.name === type &&
            (l as NewLayersList).props.data.features.find(
                (item) => item.properties.name === selectedWell
            )
        );
    });
}

export function getLayersById(layers: LayersList, id: string): LayersList {
    if (!layers) return [];
    return layers.filter((l) => (l as Layer).id === id);
}

export function isDrawingEnabled(layer_manager: LayerManager): boolean {
    const drawing_layer = layer_manager.getLayers({
        layerIds: ["drawing-layer"],
    })?.[0] as DrawingLayer;
    return (
        drawing_layer &&
        drawing_layer.props.visible &&
        drawing_layer.props.mode != "view"
    );
}

export function invertZCoordinate(dataArray: Float32Array): void {
    for (let i = 2; i < dataArray.length; i += 3) {
        dataArray[i] *= -1;
    }
}

export function defineBoundingBox(
    dataArray: Float32Array
): [number, number, number, number, number, number] {
    const length = dataArray.length;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < length; i += 3) {
        const x = dataArray[i];
        const y = dataArray[i + 1];
        const z = dataArray[i + 2];
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        minZ = z < minZ ? z : minZ;

        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
        maxZ = z > maxZ ? z : maxZ;
    }
    return [minX, minY, minZ, maxX, maxY, maxZ];
}
