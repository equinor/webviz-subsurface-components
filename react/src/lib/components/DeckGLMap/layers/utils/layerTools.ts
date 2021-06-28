import Layer, { LayerProps } from "@deck.gl/core/lib/layer";
import * as jsonpatch from "fast-json-patch";

export function patchLayerProps<
    L extends Layer<unknown, P>,
    P extends LayerProps<unknown>
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
    layer.context.userData.patchSpec(patch);
}
