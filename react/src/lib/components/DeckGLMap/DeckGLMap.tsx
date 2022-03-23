import Map, { ViewsType } from "./components/Map";
import React from "react";
import PropTypes from "prop-types";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "./redux/store";
import { getLayersWithDefaultProps } from "./layers/utils/layerTools";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface DeckGLMapProps {
    id: string;
    resources?: Record<string, unknown>;
    layers?: Record<string, unknown>[];
    bounds?: [number, number, number, number];
    zoom?: number;
    views?: ViewsType;
    coords?: {
        visible?: boolean | null;
        multiPicking?: boolean | null;
        pickDepth?: number | null;
    };
    scale?: {
        visible?: boolean | null;
        incrementValue?: number | null;
        widthPerUnit?: number | null;
        position?: number[] | null;
    };
    coordinateUnit?: string;
    toolbar?: {
        visible?: boolean | null;
    };
    legend?: {
        visible?: boolean | null;
        position?: number[] | null;
        horizontal?: boolean | null;
    };
    colorTables?: colorTablesArray;
    editedData?: Record<string, unknown>;
    setProps?: (data: Record<string, unknown>) => void;
}

const DeckGLMap: React.FC<DeckGLMapProps> = ({
    id,
    resources,
    layers,
    bounds,
    zoom,
    views,
    coords,
    scale,
    coordinateUnit,
    legend,
    toolbar,
    colorTables,
    editedData,
    setProps,
}: DeckGLMapProps) => {
    // Contains layers data received from map layers by user interaction
    const [layerEditedData, setLayerEditedData] = React.useState(editedData);

    React.useEffect(() => {
        if (!editedData) return;

        setLayerEditedData({
            ...layerEditedData,
            ...editedData,
        });
    }, [editedData]);

    // This callback is used as a mechanism to update the component from the layers or toolbar.
    // The changes done in a layer, for example, are bundled into a patch
    // and sent to the parent component via setProps. (See layers/utils/layerTools.ts)
    const setEditedData = React.useCallback(
        (data) => {
            if (setProps == undefined) return;
            setProps({
                editedData: {
                    ...layerEditedData,
                    ...data,
                },
            });
        },
        [setProps, layerEditedData]
    );

    // create store once with layers data
    const store = React.useMemo(() => {
        if (layers == undefined) return;

        return createStore({
            layers: getLayersWithDefaultProps(layers),
            views: views,
        });
    }, []);

    if (store == undefined) return null;
    return (
        <ReduxProvider store={store}>
            <Map
                id={id}
                resources={resources}
                layers={layers}
                bounds={bounds}
                zoom={zoom}
                views={views}
                coords={coords}
                scale={scale}
                coordinateUnit={coordinateUnit}
                toolbar={toolbar}
                legend={legend}
                colorTables={colorTables}
                editedData={editedData}
                setEditedData={setEditedData}
            />
        </ReduxProvider>
    );
};

DeckGLMap.defaultProps = {
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
};

const arrayOfLength_propTypes = (
    expectedLength: number,
    optional: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { [key: string]: any },
    propName: string,
    componentName: string
) => {
    if (optional && props[propName] == undefined) return null;
    if (
        !Array.isArray(props[propName]) ||
        props[propName].length != expectedLength
    ) {
        return new Error(
            `Prop ${propName} supplied to ${componentName} should be an array of length ${expectedLength}. Validation failed.`
        );
    }
    return null;
};

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
    resources: PropTypes.objectOf(PropTypes.any),

    /* List of JSON object containing layer specific data.
     * Each JSON object will consist of layer type with key as "@@type" and
     * layer specific data, if any.
     */
    layers: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any).isRequired),

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds: arrayOfLength_propTypes.bind(null, 4, true),

    /**
     * Zoom level for the view.
     */
    zoom: PropTypes.number,

    /**
     * Views configuration for map. If not specified, all the layers will be
     * displayed in a single 2D viewport.
     * Example:
     *      views = {
     *          "layout": [1, 1],
     *          "showLabel": false,
     *          "viewports": [
     *              {
     *                  "id": "view_1",
     *                  "name"?: "View 1"
     *                  "show3D"?: false,
     *                  "layerIds": ["layer-ids"]
     *              }
     *          ]
     *      }
     */
    // TODO - define proper type for views prop
    views: PropTypes.any,

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
        position: PropTypes.arrayOf(PropTypes.number.isRequired),
    }),

    /**
     * Parameters for the Distance Scale component
     * Unit for the scale ruler
     */
    coordinateUnit: PropTypes.string,

    /**
     * Parameters to control toolbar
     */
    toolbar: PropTypes.shape({
        /**
         * Toggle toolbar visibility
         */
        visible: PropTypes.bool,
    }),

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
        position: PropTypes.arrayOf(PropTypes.number.isRequired),
        /**
         * Orientation of color legend
         */
        horizontal: PropTypes.bool,
    }),

    /**
     * Prop containing color table data
     */
    colorTables: PropTypes.array,

    /**
     * Prop containing edited data from layers
     */
    editedData: PropTypes.objectOf(PropTypes.any),

    /**
     * For reacting to prop changes
     */
    setProps: PropTypes.func,
};

export default DeckGLMap;
