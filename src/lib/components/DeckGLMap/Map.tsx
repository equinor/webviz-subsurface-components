import React from "react";
import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import JSON_CONVERTER_CONFIGURATION from "./configuration";
import { COORDINATE_SYSTEM } from "deck.gl";
import { EditableGeoJsonLayer, DrawLineStringMode } from "nebula.gl";
import { DrawingLayer } from "./layers";
import { Toolbox } from "@nebula.gl/editor";

export interface MapProps {
    id: string;
    jsonData: object;
}

const EMPTY_GEOJSON = {
    type: "FeatureCollection",
    features: [],
};

function layerFilter({ layer, viewport }) {
    // Do not draw the DrawingLayer in the minimap view.
    return !(viewport.id === "minimap" && layer.id === "drawing-layer");
}

export interface MapProps {
    id: string;
    jsonData: object;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });

        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);

    //== Drawing layer hooks ==
    const [features, setFeatures] = React.useState(EMPTY_GEOJSON);
    const [mode, setMode] = React.useState(() => DrawLineStringMode);
    const [modeConfig, setModeConfig] = React.useState({});
    const [selectedFeatureIndexes] = React.useState([]);

    let jsonProps_copy = { ...jsonProps };

    let UseDrawingLayerCtrls = false;
    if (jsonProps_copy?.layers) {
        const drawingLayer_from_json = jsonProps_copy.layers.find(
            e => e instanceof DrawingLayer
        );
        if (drawingLayer_from_json) {
            UseDrawingLayerCtrls = true;
            // Drawing layer is present.
            // Remove it and add new (can not set proerties on the original?)
            jsonProps_copy.layers = jsonProps_copy.layers.filter( e => !(e instanceof DrawingLayer));

            const drawingLayer = new EditableGeoJsonLayer({
                id: "drawing-layer",
                data: features,
                mode,
                selectedFeatureIndexes,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                onEdit: ({ updatedData }) => {
                    setFeatures(updatedData);
                },
            });

            jsonProps_copy.layers.push(drawingLayer);
        }
    }

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {jsonProps_copy && (
                <DeckGL
                    id={props.id}
                    layerFilter={layerFilter}
                    {...jsonProps_copy}
                    controller={{ doubleClickZoom: false }}
                />
            )}

            {UseDrawingLayerCtrls ? (
                <Toolbox
                    mode={mode}
                    onSetMode={setMode}
                    modeConfig={modeConfig}
                    onSetModeConfig={setModeConfig}
                    geoJson={features}
                    onSetGeoJson={setFeatures}
                    onImport={setFeatures}
                />
            ) : null}
        </div>
    );
};

export default Map;
