import * as jsonpatch from "fast-json-patch";

// TODO: templated function, T = layer, U = layer.props
export function patchLayerProps(layer, newProps): void {
    const layerPath = "/layers/[" + layer.id + "]";
    const patch = jsonpatch.compare(layer.props, newProps);

    // Make the patch relative to the spec instead of the layer.
    patch.forEach((op) => {
        op.path = layerPath + op.path;
    });

    layer.context.deck.props.patchSpec(patch);
}
