import PropTypes from "prop-types";
import * as React from "react";
import Map from "./components/Map";
import template from "../../../demo/example-data/welllayer_template.json";
import colorTables from "../../../demo/example-data/color-tables.json";

DeckGLMap.defaultProps = {
    coords: {
        visible: true,
        multiPicking: true,
        pickDepth: 10,
    },
    scale: {
        visible: true,
        incrementValue: 100,
        widthPerUnit: 100,
        position: [10, 10],
    },
    legend: {
        visible: true,
        position: [46, 10],
    },
    zoom: -3,
    colorTables: { colorTables },
    template: { template },
};

function DeckGLMap({
    id,
    resources,
    layers,
    bounds,
    zoom,
    coords,
    scale,
    legend,
    template,
    colorTables,
    coordinateUnit,
    editedData,
    setProps,
}) {
    // Contains layers data received from map layers by user interaction
    let [layerEditedData, setLayerEditedData] = React.useState(null);

    React.useEffect(() => {
        if (!layerEditedData) {
            setLayerEditedData(editedData);
        } else {
            setLayerEditedData({
                ...layerEditedData,
                ...editedData,
            });
        }
    }, [editedData]);

    // This callback is used as a mechanism to update the component from the layers or toolbar.
    // The changes done in a layer, for example, are bundled into a patch
    // and sent to the parent component via setProps. (See layers/utils/layerTools.ts)
    const setEditedData = React.useCallback(
        (data) => {
            setProps({
                editedData: {
                    ...layerEditedData,
                    ...data,
                },
            });
        },
        [setProps, layerEditedData]
    );

    return (
        layerEditedData && (
            <Map
                id={id}
                resources={resources}
                layers={layers}
                bounds={bounds}
                zoom={zoom}
                coords={coords}
                scale={scale}
                legend={legend}
                template={template}
                colorTables={colorTables}
                coordinateUnit={coordinateUnit}
                editedData={layerEditedData}
                setEditedData={setEditedData}
            />
        )
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
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec:
     * https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: PropTypes.object,

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds: PropTypes.arrayOf(PropTypes.number),

    /**
     * Zoom level for the view.
     */
    zoom: PropTypes.number,

    /* List of JSON object containing layer specific data.
     * Each JSON object will consist of layer type with key as "@@type" and
     * layer specific data, if any.
     */
    layers: PropTypes.arrayOf(PropTypes.object),

    /**
     * Parameters for the InfoCard component
     */
    coords: PropTypes.shape({
        /**
         * Toggle component visibility.
         */
        visible: PropTypes.bool,
        /**
         * Enable or disable multi picking. Might have a performance penalty.
         * See https://deck.gl/docs/api-reference/core/deck#pickmultipleobjects
         */
        multiPicking: PropTypes.bool,
        /**
         * Number of objects to pick. The more objects picked, the more picking operations will be done.
         * See https://deck.gl/docs/api-reference/core/deck#pickmultipleobjects
         */
        pickDepth: PropTypes.number,
    }),

    /**
     * Parameters for the Distance Scale component
     */
    scale: PropTypes.shape({
        /**
         * Toggle component visibility.
         */
        visible: PropTypes.bool,
        /**
         * Increment value for the scale.
         */
        incrementValue: PropTypes.number,
        /**
         * Scale bar width in pixels per unit value.
         */
        widthPerUnit: PropTypes.number,
        /**
         * Scale bar position in pixels.
         */
        position: PropTypes.arrayOf(PropTypes.number),
    }),

    /**
     * Parameters for the Distance Scale component
     * Unit for the scale ruler
     */
    coordinateUnit: PropTypes.string,

    /**
     * For reacting to prop changes
     */
    setProps: PropTypes.func,

    /**
     * Parameters for the legend
     */
    legend: PropTypes.shape({
        /**
         * Toggle component visibility.
         */
        visible: PropTypes.bool,
        /**
         * Legend position in pixels.
         */
        position: PropTypes.arrayOf(PropTypes.number),
    }),

    /**
     * Prop containing edited data from layers
     */
    editedData: PropTypes.object,
    /**
     * Prop containing color table data
     */
    colorTables: PropTypes.arrayOf(PropTypes.object),
    /**
     * Prop containing color template data
     */
    template: PropTypes.arrayOf(PropTypes.object),
};

export default DeckGLMap;
