import React from "react";
import PropTypes from "prop-types";
import { View } from "@deck.gl/core/typed";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import type { SubsurfaceViewerProps } from "@webviz/subsurface-viewer/dist/SubsurfaceViewer";
import SubsurfaceViewer from "@webviz/subsurface-viewer/dist/SubsurfaceViewer";
import type {
    ViewsType,
    TooltipCallback,
    ViewStateType,
    BoundsAccessor,
    MapMouseEvent,
} from "@webviz/subsurface-viewer/dist/components/Map";
import type { Unit } from "convert-units";
import convert from "convert-units";

export interface DashSubsurfaceViewerProps {
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
    coordinateUnit?: Unit;
    colorTables?: colorTablesArray;
    editedData?: Record<string, unknown>;
    setProps?: (data: Record<string, unknown>) => void;

    /**
     * Validate JSON datafile against schema
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
    triggerResetMultipleWells?: number;
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

    children?: React.ReactNode;
}

function mapAnnotation(annotationContainers: React.ReactNode) {
    return React.Children.map(annotationContainers, (annotationContainer) => {
        const viewId = (annotationContainer as React.ReactElement).key;
        return (
            // @ts-expect-error This is demonstrated to work with js, but with ts it gives error
            <View key={viewId} id={viewId}>
                {annotationContainer}
            </View>
        );
    });
}

const DashSubsurfaceViewer: React.FC<DashSubsurfaceViewerProps> = ({
    id,
    resources,
    layers,
    bounds,
    views,
    coords,
    scale,
    coordinateUnit,
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
    triggerResetMultipleWells,
    children,
}: DashSubsurfaceViewerProps) => {
    const mapArgs: SubsurfaceViewerProps = {
        id: id,
        resources: resources,
        layers: layers,
        bounds: bounds,
        views: views,
        coords: coords,
        scale: scale,
        coordinateUnit: coordinateUnit,
        colorTables: colorTables,
        editedData: editedData,
        setProps: setProps,
        checkDatafileSchema: checkDatafileSchema,
        onMouseEvent: onMouseEvent,
        selection: selection,
        getTooltip: getTooltip,
        cameraPosition: cameraPosition,
        getCameraPosition: getCameraPosition,
        triggerHome: triggerHome,
        triggerResetMultipleWells: triggerResetMultipleWells,
        children: children,
    };

    return (
        <SubsurfaceViewer {...mapArgs}>
            {mapAnnotation(children)}
        </SubsurfaceViewer>
    );
};

DashSubsurfaceViewer.defaultProps = {
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
    checkDatafileSchema: false,
};

DashSubsurfaceViewer.propTypes = {
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
    coordinateUnit: PropTypes.oneOf(convert().possibilities()),

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
     * Validate JSON datafile against schema
     */
    checkDatafileSchema: PropTypes.bool,

    /**
     * For get mouse events
     */
    onMouseEvent: PropTypes.func,

    children: PropTypes.any,
};

export default DashSubsurfaceViewer;
