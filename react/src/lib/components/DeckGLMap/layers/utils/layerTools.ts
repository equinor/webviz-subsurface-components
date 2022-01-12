import Layer, { LayerProps } from "@deck.gl/core/lib/layer";
import { PickInfo } from "@deck.gl/core/lib/deck";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { Matrix4 } from "math.gl";
import { cloneDeep } from "lodash";
import { layersDefaultProps } from "../layersDefaultProps";

export interface ExtendedLayerProps<D> extends CompositeLayerProps<D> {
    name: string;
}

export interface PropertyDataType {
    name: string;
    value: string | number;
    color?: RGBAColor;
}

// Layer pick info can have multiple properties
export interface LayerPickInfo extends PickInfo<unknown> {
    properties?: PropertyDataType[];
}

// Creates property object which will be used to display layer property
// in the info card.
export function createPropertyData(
    name: string,
    value: string | number,
    color?: RGBAColor
): PropertyDataType {
    return {
        name: name,
        value: value,
        color: color,
    };
}

// Generate a patch from a layer and it's new props and call setSpecPatch with it,
// to update the map parent from the layers.
// Usually this would be called from a layer,
// e.g.: patchLayerProps(this, {...this.props, updatedProp: newValue});
export function patchLayerProps<
    D,
    P extends LayerProps<D> = LayerProps<D>,
    L extends Layer<D, P> = Layer<D, P>
>(layer: L, newProps: P): void {
    // userData is undocumented and it doesn't appear in the
    // deckProps type, but it is used by the layersManager
    // and forwarded though the context to all the layers.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TS2339
    layer.context.userData.setEditedData(newProps);
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
                const prop_type = typeof value;
                if (
                    ["string", "boolean", "number", "array"].includes(prop_type)
                ) {
                    if (layer[prop] === undefined) layer[prop] = value;
                }
            });
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
