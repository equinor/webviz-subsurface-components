import { validateSchema } from "./validator";
import { Layer } from "deck.gl";
import WellsLayer from "../components/DeckGLMap/layers/wells/wellsLayer";
import { colorTablesArray } from "@emerson-eps/color-tables/";

export function validateColorTables(colorTables: colorTablesArray): void {
    validateSchema(colorTables, "ColorTables");
}

export function validateLayers(layers: Layer<unknown>[]): void {
    layers.forEach((layer) => {
        if (layer.isLoaded) {
            validateLayer(layer);
            try {
                layer.validateProps();
            } catch (e) {
                throw `${layer.id}- ${String(e)}`;
            }
        }
    });
}

export function validateLayer(layer: Layer<unknown>): void {
    switch (layer.id) {
        case "wells-layer":
            validateWellsLayer(layer as WellsLayer);
            break;
        case "pie-layer":
            validateSchema(layer.props.data, "PieChart");
            break;
        case "grid-layer":
            validateSchema(layer.props.data, "Grid");
            break;
        case "fault-polygons-layer":
            validateSchema(layer.props.data, "FaultPolygons");
            break;
        default:
            return;
    }
}

function validateWellsLayer(wellsLayer: WellsLayer): void {
    const wells_data = wellsLayer.props.data;
    validateSchema(wells_data, "Wells");

    const logs_data = getLogData(wellsLayer);
    validateSchema(logs_data, "WellLogs");
}

function getLogData(wellsLayer: WellsLayer) {
    const sub_layers = wellsLayer.internalState.subLayers as Layer<unknown>[];
    const log_layer = sub_layers.find(
        (layer) => layer.id === "wells-layer-log_curve"
    );
    return log_layer?.props.data;
}
