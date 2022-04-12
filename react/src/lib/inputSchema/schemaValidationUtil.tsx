import { validateSchema } from "./validator";
import { Layer } from "deck.gl";
import WellsLayer from "../components/DeckGLMap/layers/wells/wellsLayer";

export function validateLayers(layers: Layer<unknown>[]): string {
    const errors: string[] = [];
    layers.forEach((layer) => {
        if (layer.isLoaded) {
            const error = validateLayer(layer);
            if (error) errors.push(error);
        }
    });
    return errors.join("\n");
}

export function validateLayer(layer: Layer<unknown>): string {
    switch (layer.id) {
        case "wells-layer":
            return validateWellsLayer(layer as WellsLayer);
        case "pie-layer":
            return validateSchema(layer.props.data, "PieChart");
        default:
            return "";
    }
}

function validateWellsLayer(wellsLayer: WellsLayer): string {
    const errors: string[] = [];

    const wells_data = wellsLayer.props.data;
    let error_text = validateSchema(wells_data, "Wells");
    if (error_text) errors.push(error_text);

    const logs_data = getLogData(wellsLayer);
    error_text = validateSchema(logs_data, "WellLogs");
    if (error_text) errors.push(error_text);

    return errors.join("\n");
}

function getLogData(wellsLayer: WellsLayer) {
    const sub_layers = wellsLayer.internalState.subLayers as Layer<unknown>[];
    const log_layer = sub_layers.find(
        (layer) => layer.id === "wells-layer-log_curve"
    );
    return log_layer?.props.data;
}
