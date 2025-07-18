import React from "react";

import type { Layer, LayersList } from "@deck.gl/core";
import type { colorTablesArray } from "@emerson-eps/color-tables/";

import type { Unit } from "convert-units";
import convert from "convert-units";
import PropTypes from "prop-types";

// cannot use these type, they break python build
// import type { Point3D, RGBColor } from "./utils";

import type {
    BoundsAccessor,
    MapMouseEvent,
    MapProps,
    TooltipCallback,
    ViewStateType,
    ViewsType,
} from "./components/Map";
import Map, { createLayers } from "./components/Map";

import { TGrid3DColoringMode } from "./layers/grid3d/grid3dLayer";

export type {
    BoundsAccessor,
    colorTablesArray,
    MapMouseEvent,
    TooltipCallback,
    ViewStateType,
    ViewsType,
};

export { TGrid3DColoringMode };

export type LightsType = {
    headLight?: {
        intensity: number;
        color?: [number, number, number]; // RGBColor;
    };
    ambientLight?: {
        intensity: number;
        color?: [number, number, number]; // RGBColor;
    };
    pointLights?: [
        {
            intensity: number;
            position: [number, number, number]; // Point3D;
            color?: [number, number, number]; // RGBColor;
        },
    ];

    directionalLights?: [
        {
            intensity: number;
            direction: [number, number, number]; // Point3D;
            color?: [number, number, number]; // RGBColor;
        },
    ];
};

export type TLayerDefinition =
    | Record<string, unknown>
    | Layer
    | false
    | null
    | undefined;

/**
 * Properties of the SubsurfaceViewer component.
 */
export interface SubsurfaceViewerProps
    extends Omit<MapProps, "layers" | "setEditedData" | "toolbar"> {
    /**
     * Array of externally created layers or layer definition records or JSON strings.
     * Add '@@typedArraySupport' : true in a layer definition in order to
     * use typed arrays as inputs.
     */
    layers?: TLayerDefinition[];

    /**
     * @deprecated Used by layers to propagate state to component, eg. selected
     * wells from the Wells layer. Use client code to handle layer state
     * instead.
     */
    setProps?: (data: Record<string, unknown>) => void;
}

const SubsurfaceViewer: React.FC<SubsurfaceViewerProps> = ({
    id,
    resources,
    layers,
    bounds,
    cameraPosition,
    triggerHome,
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
    getCameraPosition,
    onRenderingProgress,
    onDragStart,
    onDragEnd,
    triggerResetMultipleWells,
    lights,
    children,
    verticalScale,
    ...args
}: SubsurfaceViewerProps) => {
    // Contains layers data received from map layers by user interaction
    const [layerEditedData, setLayerEditedData] = React.useState(editedData);

    const [layerInstances, setLayerInstances] = React.useState<LayersList>([]);

    React.useEffect(() => {
        const enumerations: Record<string, unknown>[] = [];
        if (resources) enumerations.push({ resources: resources });
        if (editedData) enumerations.push({ editedData: editedData });
        else enumerations.push({ editedData: {} });

        if (!layers) {
            setLayerInstances([]);
            return;
        }
        const layersList = createLayers(layers, enumerations);
        setLayerInstances(layersList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers]); // Note. Fixing this dependency list may cause infinite recursion.

    React.useEffect(() => {
        if (!editedData) return;

        setLayerEditedData({
            ...layerEditedData,
            ...editedData,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editedData]); // Note. Fixing this dependency list may cause infinite recursion.

    // This callback is used as a mechanism to update the component from the layers or toolbar.
    // The changes done in a layer, for example, are bundled into a patch
    // and sent to the parent component via setProps. (See layers/utils/layerTools.ts)
    const setEditedData = React.useCallback(
        (data: Record<string, unknown>) => {
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

    if (coordinateUnit && !convert().possibilities().includes(coordinateUnit)) {
        console.error(
            `Invalid coordinate unit: '${coordinateUnit}'. Valid units are: ${convert().possibilities()}`
        );
        coordinateUnit = undefined;
    }

    return (
        <Map
            id={id}
            layers={layerInstances}
            bounds={bounds}
            views={views}
            coords={coords}
            scale={scale}
            coordinateUnit={coordinateUnit as Unit}
            colorTables={colorTables}
            setEditedData={setEditedData}
            checkDatafileSchema={checkDatafileSchema}
            onMouseEvent={onMouseEvent}
            selection={selection}
            getTooltip={getTooltip}
            cameraPosition={cameraPosition}
            getCameraPosition={getCameraPosition}
            onRenderingProgress={onRenderingProgress}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            triggerHome={triggerHome}
            triggerResetMultipleWells={triggerResetMultipleWells}
            lights={lights}
            verticalScale={verticalScale}
            {...args}
        >
            {children}
        </Map>
    );
};

SubsurfaceViewer.propTypes = {
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
     * Extra pixels around the pointer to include while picking.
     */
    pickingRadius: PropTypes.number,

    /** Prop containing the lighting settings. */
    lights: PropTypes.object,
};

export default SubsurfaceViewer;
