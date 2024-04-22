import React from "react";
import type { PickingInfo, Layer, LayersList } from "@deck.gl/core/typed";
import PropTypes from "prop-types";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import type { Unit } from "convert-units";
import convert from "convert-units";

import type { MjolnirGestureEvent } from "mjolnir.js";

import type {
    BoundsAccessor,
    MapMouseEvent,
    TooltipCallback,
    ViewStateType,
    ViewsType,
} from "./components/Map";

import { TGrid3DColoringMode } from "./layers/grid3d/grid3dLayer";

import Map, { createLayers } from "./components/Map";

export type {
    BoundsAccessor,
    MapMouseEvent,
    TooltipCallback,
    ViewStateType,
    ViewsType,
    colorTablesArray,
};

export { TGrid3DColoringMode };

export type LightsType = {
    headLight?: {
        intensity: number;
        color?: [number, number, number];
    };
    ambientLight?: {
        intensity: number;
        color?: [number, number, number];
    };
    pointLights?: [
        {
            intensity: number;
            position: [number, number, number];
            color?: [number, number, number];
        },
    ];

    directionalLights?: [
        {
            intensity: number;
            direction: [number, number, number];
            color?: [number, number, number];
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
export interface SubsurfaceViewerProps {
    id: string;
    resources?: Record<string, unknown>;
    /**
     * Array of externally created layers or layer definition records or JSON strings.
     * Add '@@typedArraySupport' : true in a layer definition in order to
     * use typed arrays as inputs.
     */
    layers?: TLayerDefinition[];

    bounds?: [number, number, number, number] | BoundsAccessor;
    cameraPosition?: ViewStateType | undefined;
    triggerHome?: number;

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
     * Will be called while layers are processed to rendered data.
     * @param progress vlaue between 0 and 100.
     */
    onRenderingProgress?: (progress: number) => void;

    onDragStart?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
    onDragEnd?: (info: PickingInfo, event: MjolnirGestureEvent) => void;

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

    lights?: LightsType;

    children?: React.ReactNode;

    /** A vertical scale factor, used to scale items in the view vertically */
    verticalScale?: number;
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
        >
            {children}
        </Map>
    );
};

SubsurfaceViewer.defaultProps = {
    views: {
        layout: [1, 1],
        marginPixels: 0,
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
    checkDatafileSchema: false,
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
};

export default SubsurfaceViewer;
