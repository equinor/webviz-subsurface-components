import { Matrix4 } from "math.gl";

import type { Accessor, AccessorContext, PickingInfo } from "@deck.gl/core";
import type { Color, LayerContext } from "@deck.gl/core";
import type {
    Layer,
    LayersList,
    LayerManager,
    CompositeLayerProps,
} from "@deck.gl/core";

import type { colorTablesArray } from "@emerson-eps/color-tables/";

import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import type DrawingLayer from "../drawing/drawingLayer";

import type { BoundingBox3D } from "../../utils";
import { computeBoundingBox as buidBoundingBox } from "../../utils/BoundingBox3D";

export interface TypeAndNameLayerProps {
    "@@type"?: string;
    name: string;
}

export interface ExtendedLayerProps
    extends CompositeLayerProps,
        TypeAndNameLayerProps {}

export interface ExtendedLegendLayer extends Layer {
    getLegendData?: () => DiscreteLegendDataType | ContinuousLegendDataType;
}

export interface DeckGLLayerContext extends LayerContext {
    userData: {
        setEditedData: (data: Record<string, unknown>) => void;
        colorTables: colorTablesArray;
    };
}

export interface PropertyDataType {
    name: string;
    value: string | number;
    color?: Color;
}

// Layer pick info can have multiple properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We use "any" to match picking-info default
export interface LayerPickInfo<T = any> extends PickingInfo<T> {
    propertyValue?: number; // for single property
    properties?: PropertyDataType[]; // for multiple properties
}

/**
 * Creates property object which will be displayed in the info card.
 *   createPropertyData("Property", value) is used to store the value,
 *      which is either a number of the category text (for categorical properties)
 *   createPropertyData("Value", categoryIndex) is used to store the category index in case of categorical property.
 *   createPropertyData("Depth", categoryIndex) is used to store depth coordinate (Z in 3d viewer, md in well log viewer)
 */
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
    if (!layers || !selectedWell) {
        return [];
    }
    return layers.filter((l) => {
        return (
            l?.constructor.name === type &&
            (l as NewLayersList).props.data?.features?.find(
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

/**
 * Calculates the axis-aligned bounding box for a set of 3D points.
 *
 * @param dataArray - A flat `Float32Array` containing 3D coordinates in the order [x0, y0, z0, x1, y1, z1, ...].
 * @param zIncreasingDownwards - Optional. If `true`, inverts the Z-axis direction to account for coordinate systems where Z increases downwards. Defaults to `false`.
 * @returns A tuple of six numbers: [minX, minY, minZ, maxX, maxY, maxZ], representing the minimum and maximum coordinates along each axis.
 */
export function computeBoundingBox(
    dataArray: Float32Array,
    zIncreasingDownwards: boolean = false
): BoundingBox3D {
    const bbox = buidBoundingBox(dataArray);
    if (zIncreasingDownwards) {
        // invert Z coordinates
        bbox[2] = -bbox[2];
        bbox[5] = -bbox[5];
    }
    return bbox;
}

export type ReportBoundingBoxAction = { layerBoundingBox: BoundingBox3D };

/**
 * Gets a value from a deck.gl accessor (aka, calls it if its a function, or returns the static value)
 * @param accessor A deck.gl Accessor
 * @param data The data object passed to the accessor
 * @param objectInfo Info about the data object. Passed to the accessor
 * @returns
 */
export function getFromAccessor<In, Out>(
    accessor: Accessor<In, Out>,
    data: In,
    objectInfo: AccessorContext<In>
): Out {
    if (typeof accessor !== "function") return accessor;

    // `Out` can *theoretically* still be a function, so Typescript won't narrow this to be an AccessorFunction. Deck.gl does however
    // ensure that Out is never a function, so we'll just expect the error here (the same approach is used internally in Deck.gl)
    // @ts-expect-error -- Out is always a function here
    return accessor(data, objectInfo);
}
