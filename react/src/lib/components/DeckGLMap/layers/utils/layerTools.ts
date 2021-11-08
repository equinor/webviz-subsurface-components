import Layer, { LayerProps } from "@deck.gl/core/lib/layer";
import * as jsonpatch from "fast-json-patch";
import { PickInfo } from "@deck.gl/core/lib/deck";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";

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
    const layerPath = "/layers/[" + layer.id + "]";
    const patch = jsonpatch.compare(layer.props, newProps);

    // Make the patch relative to the spec instead of the layer.
    patch.forEach((op) => {
        op.path = layerPath + op.path;
    });

    // userData is undocumented and it doesn't appear in the
    // deckProps type, but it is used by the layersManager
    // and forwarded though the context to all the layers.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TS2339
    layer.context.userData.setSpecPatch(patch);
}
