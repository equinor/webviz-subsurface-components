import type { LayerManager } from "@deck.gl/core";

import type DrawingLayer from "../drawing/drawingLayer";

export function isDrawingEnabled(layer_manager: LayerManager): boolean {
    const drawing_layer = layer_manager.getLayers({
        layerIds: ["drawing-layer"],
    })?.[0] as DrawingLayer;
    return drawing_layer?.props.visible && drawing_layer?.props.mode != "view";
}
