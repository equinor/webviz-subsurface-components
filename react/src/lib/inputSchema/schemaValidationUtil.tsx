import { validateSchema } from "./validator";
import { FeatureCollection } from "geojson";
import { WellsLayerProps } from "../components/DeckGLMap/layers/wells/wellsLayer";
import { Layer } from "deck.gl";

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
            return validateWellsLayer(
                layer.props as WellsLayerProps<FeatureCollection>
            );
        case "pie-layer":
            return validateSchema(layer.props.data, "PieChart");
        default:
            return "";
    }
}

function validateWellsLayer(
    layer_props: WellsLayerProps<FeatureCollection>
): string {
    const wells_data = layer_props.data;
    const logs_data = layer_props.logData;

    const errors: string[] = [];
    let error_text = validateSchema(wells_data, "Wells");
    if (error_text) errors.push(error_text);

    error_text = validateSchema(logs_data, "WellLogs");
    if (error_text) errors.push(error_text);

    return errors.join("\n");
}
