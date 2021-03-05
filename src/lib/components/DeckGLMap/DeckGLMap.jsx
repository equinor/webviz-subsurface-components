import * as React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import PropTypes from "prop-types";
import { EditableGeoJsonLayer, DrawPolygonMode, DrawLineStringMode } from 'nebula.gl';
import { DrawingLayer } from './layers';
import Checkbox from '@material-ui/core/Checkbox';
import { Toolbox } from "@nebula.gl/editor";


import JSON_CONVERTER_CONFIGURATION from "./configuration";
import { COORDINATE_SYSTEM } from "deck.gl";

const EMPTY_GEOJSON = {
    type: "FeatureCollection",
    features: []
 }

function layerFilter({layer, viewport}) {
  // Do not draw the DrawingLayer in the minimap view.
  return !(viewport.id === 'minimap' && layer.id === 'drawing-layer');
}


function DeckGLMap(props) {

    //== Drawing layer hooks ==
    const [features, setFeatures] = React.useState(EMPTY_GEOJSON);
    const [mode, setMode] = React.useState(() => DrawLineStringMode);
    const [modeConfig, setModeConfig] = React.useState({});
    const [selectedFeatureIndexes] = React.useState([]);

    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });
        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);


    let jsonProps_copy = {...jsonProps};

    let UseDrawingLayerCtrls = false;
    if (jsonProps_copy?.layers) {
        const drawingLayer_from_json = jsonProps_copy.layers.find(e => e instanceof DrawingLayer);
        if (drawingLayer_from_json) {
            UseDrawingLayerCtrls = true;
            // Drawing layer is present.
            // Remove it and add new (can not set proerties on the original?)
            jsonProps_copy.layers = jsonProps_copy.layers.filter(e => !(e instanceof DrawingLayer));

            const drawingLayer = new EditableGeoJsonLayer({
                id: 'drawing-layer',
                data: features,
                mode,
                selectedFeatureIndexes,
                onEdit: ({ updatedData }) => { setFeatures(updatedData); }
            });

            jsonProps_copy.layers.push(drawingLayer);
        }
    }


    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {jsonProps_copy && <DeckGL id={props.id} layerFilter={layerFilter} {...jsonProps_copy} controller={{ doubleClickZoom: false }} />}
            
            { UseDrawingLayerCtrls ?
                <Toolbox 
                    mode={mode}
                    onSetMode={setMode}
                    modeConfig={modeConfig}
                    onSetModeConfig={setModeConfig}
                    geoJson={features}
                    onSetGeoJson={setFeatures}
                    onImport={setFeatures}
                /> : null
            };

        </div>
    );
}


DeckGLMap.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * JSON description of the map to be displayed. More detailes about
     * the format can be found here: https://deck.gl/docs/api-reference/json/conversion-reference
     */
    jsonData: PropTypes.object,
};

export default DeckGLMap;
