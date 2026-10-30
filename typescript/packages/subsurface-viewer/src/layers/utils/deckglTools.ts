import type { ColorTableArray } from "@emerson-eps/color-tables";
import { Matrix4, type Matrix4Like } from "math.gl";

import type {
    Accessor,
    AccessorContext,
    ChangeFlags,
    Color,
    CompositeLayerProps,
    Layer,
    LayerContext,
    LayersList,
    PickingInfo,
} from "@deck.gl/core";

import type { BoundingBox3D } from "../../utils/BoundingBox3D";

export interface TypeAndNameLayerProps {
    "@@type"?: string;
    name: string;
}

export interface ExtendedLayerProps
    extends CompositeLayerProps,
        TypeAndNameLayerProps {}

export interface DeckGLLayerContext extends LayerContext {
    userData: {
        setEditedData: (data: Record<string, unknown>) => void;
        colorTables: ColorTableArray;
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
 * Returns an array of property data objects. possibly initialized with the depth information.
 * @param infoDepth - The depth value to initialize the property data with.
 * @param ZIncreasingDownwards - Whether the Z axis increases downwards.
 * @param modelMatrix - Optional model matrix to account for scaling.
 * @returns An array of property data objects, either empty or including the depth if available.
 */
export function initPropertyData(
    infoDepth: number | undefined,
    ZIncreasingDownwards: boolean,
    modelMatrix?: Matrix4Like | null
): PropertyDataType[] {
    if (infoDepth !== undefined) {
        const zScale = modelMatrix?.[10] ?? 1;

        const depth =
            (ZIncreasingDownwards ? -infoDepth : infoDepth) /
            Math.max(0.001, zScale);
        return [createPropertyData("Depth", depth)];
    }
    return [];
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

export function getLayersById(layers: LayersList, id: string): LayersList {
    if (!layers) return [];
    return layers.filter((l) => (l as Layer).id === id);
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

/**
 * Checks if a specified updateTrigger is flagged as changed
 * @param changeFlags The deck.gl change-flag object
 * @param updateTriggerName The name of the trigger to check
 * @returns true if the update trigger has changed
 */
export function hasUpdateTriggerChanged(
    changeFlags: ChangeFlags,
    updateTriggerName: string
): boolean {
    if (!changeFlags.updateTriggersChanged) return false;
    return !!changeFlags.updateTriggersChanged[updateTriggerName];
}
