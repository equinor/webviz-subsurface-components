import Map, {
    ViewsType,
    TooltipCallback,
    ViewStateType,
    BoundsAccessor,
} from "./components/Map";
import { MapMouseEvent } from "./components/Map";
import React from "react";
import PropTypes from "prop-types";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "./redux/store";
import { getLayersWithDefaultProps } from "./layers/utils/layerTools";
import { colorTablesArray } from "@emerson-eps/color-tables/";

export interface DeckGLMapProps {
    id: string;
    resources?: Record<string, unknown>;
    layers?: Record<string, unknown>[];
    bounds?: [number, number, number, number] | BoundsAccessor;
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
        cssStyle?: Record<string, unknown> | null;
    };
    coordinateUnit?: string;
    toolbar?: {
        visible?: boolean | null;
    };
    legend?: {
        visible?: boolean | null;
        cssStyle?: Record<string, unknown> | null;
        horizontal?: boolean | null;
    };
    colorTables?: colorTablesArray;
    editedData?: Record<string, unknown>;
    setProps?: (data: Record<string, unknown>) => void;

    /**
     * Validate JSON datafile against schems
     */
    checkDatafileSchema?: boolean;

    /**
     * For get mouse events
     */
    onMouseEvent?: (event: MapMouseEvent) => void;

    getCameraPosition?: (input: ViewStateType) => void;

    /**
     * If changed will reset camera to default position.
     */
    triggerHome?: number;

    /**
     * Range selection of the current well
     */
    selection?: {
        well: string | undefined;
        selection: [number | undefined, number | undefined] | undefined;
    };

    /**
     * Override default tooltip with a callback.
     */
    getTooltip?: TooltipCallback;
    cameraPosition?: ViewStateType | undefined;

    triggerResetOption?: boolean;
}

const DeckGLMap: React.FC<DeckGLMapProps> = ({
    id,
    resources,
    layers,
    bounds,
    views,
    coords,
    scale,
    coordinateUnit,
    legend,
    toolbar,
    colorTables,
    editedData,
    setProps,
    checkDatafileSchema,
    onMouseEvent,
    selection,
    getTooltip,
    cameraPosition,
    getCameraPosition,
    triggerHome,
    triggerResetOption,
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
                views={views}
                coords={coords}
                scale={scale}
                coordinateUnit={coordinateUnit}
                toolbar={toolbar}
                legend={legend}
                colorTables={colorTables}
                editedData={editedData}
                setEditedData={setEditedData}
                checkDatafileSchema={checkDatafileSchema}
                onMouseEvent={onMouseEvent}
                selection={selection}
                getTooltip={getTooltip}
                cameraPosition={cameraPosition}
                getCameraPosition={getCameraPosition}
                triggerHome={triggerHome}
                triggerResetOption={triggerResetOption}
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
    checkDatafileSchema: false,
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
     * It can be either an array or a callback returning [number, number, number, number].
     */
    bounds: PropTypes.any,

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
     *                  "layerIds": ["layer-ids"],
     *                  "isSync?": true,
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
         * Scale bar css style can be used for positioning.
         */
        cssStyle: PropTypes.objectOf(PropTypes.any),
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
         * Legend css style can be used for positioning.
         */
        cssStyle: PropTypes.objectOf(PropTypes.any),
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

    /**
     * Validate JSON datafile against schems
     */
    checkDatafileSchema: PropTypes.bool,

    /**
     * For get mouse events
     */
    onMouseEvent: PropTypes.func,

    /**
     * Range selection of the current well
     */
    //selection: PropTypes.shape({
    //    /**
    //     * Current well name
    //     */
    //	well: PropTypes.string,
    //    /**
    //     * [from/cuurrent, to]
    //     */
    //    selection: PropTypes.arrayOf(PropTypes.number)
    //}),
};

export default DeckGLMap;
