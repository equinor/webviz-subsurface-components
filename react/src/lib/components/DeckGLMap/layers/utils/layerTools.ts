import { PickingInfo } from "@deck.gl/core/typed";
import { Color } from "@deck.gl/core/typed";
import {
    Layer,
    LayersList,
    LayerManager,
    CompositeLayerProps,
} from "@deck.gl/core/typed";
import { Matrix4 } from "math.gl";
import { cloneDeep } from "lodash";
import { layersDefaultProps } from "../layersDefaultProps";
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

// update layer object to include additional props
export function applyPropsOnLayers(
    layer_props: Record<string, unknown>[],
    layers: Record<string, unknown>[]
): Record<string, unknown>[] {
    const result = cloneDeep(layers);

    result?.forEach((layer) => {
        const props = layer_props.find((l) => {
            if (layer["id"]) return l["id"] === layer["id"];
            else return l["@@type"] === layer["@@type"];
        });
        if (props) {
            Object.entries(props).forEach(([prop, value]) => {
                if (layer[prop] == undefined) layer[prop] = value;
            });
        } else {
            // if it's a user defined layer and its name and visibility are not specified
            // set layer id as its default name
            if (layer["name"] == undefined) layer["name"] = layer["id"];
            if (layer["visible"] == undefined) layer["visible"] = true;
        }
    });
    return result;
}

export function getLayersWithDefaultProps(
    layers: Record<string, unknown>[]
): Record<string, unknown>[] {
    return applyPropsOnLayers(
        Object.values(layersDefaultProps) as Record<string, unknown>[],
        layers
    );
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
