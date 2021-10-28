import * as jsonpatch from "fast-json-patch";
import DeckGLWrapper from "./DeckGLWrapper";
import { AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import { Operation } from "fast-json-patch";
import React, { useCallback } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../redux/store";
import { setLayers } from "../redux/actions";
import {
    ColormapLayer,
    Hillshading2DLayer,
    WellsLayer,
    FaultPolygonsLayer,
    PieChartLayer,
    DrawingLayer,
} from "../layers";

export interface MapProps {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: string;

    /**
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec:
     * https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: Record<string, unknown>;

    /**
     * JSON object describing the map specification.
     * More details about the specification format can be found here:
     * https://deck.gl/docs/api-reference/json/conversion-reference
     */
    deckglSpec: Record<string, unknown>;

    /**
     * For reacting to prop changes
     */
    setSpecPatch: (patch: Operation[]) => void;

    /* List of JSON object containing layer specific data.
     * Each JSON object will consist of layer type with key as "@@type" and
     * layer specific data, if any.
     */
    layers: Record<string, unknown>[];

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds: [number, number, number, number];

    /**
     * Zoom level for the view.
     */
    zoom: number;

    /**
     * Parameters for the InfoCard component
     */
    coords: {
        visible: boolean;
        multiPicking: boolean;
        pickDepth: number;
    };

    /**
     * Parameters for the Distance Scale component
     */
    scale: {
        visible: boolean;
        incrementValue: number;
        widthPerUnit: number;
        position: number[];
    };

    coordinateUnit: string;

    legendVisible: boolean;

    /**
     * For reacting to prop changes
     */
    setEditedData: (data: Record<string, unknown>) => void;

    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    layers,
    bounds,
    zoom,
    coords,
    scale,
    coordinateUnit,
    legendVisible,
    setEditedData,
}: MapProps) => {
    // state for initial views prop (target and zoom) of DeckGL component
    const [initialViewState, setInitialViewState] =
        React.useState<Record<string, unknown>>();
    React.useEffect(() => {
        setInitialViewState(getInitialViewState(bounds, zoom));
    }, [bounds, zoom]);

    // state for views prop of DeckGL component
    const deckGLViews = getViewsForDeckGL();

    // state to update layers to include defualt props
    const [layersWithDefaultProps, setLayersWithDefaultProps] = React.useState(
        getLayersWithDefaultProps(layers, bounds)
    );
    React.useEffect(() => {
        setLayersWithDefaultProps(getLayersWithDefaultProps(layers, bounds));
    }, [layers, bounds]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = React.useRef<EnhancedStore<any, AnyAction, any>>(
        createStore(layersWithDefaultProps)
    );

    React.useEffect(() => {
        store.current = createStore(layersWithDefaultProps);
    }, []);

    // update the store if layer property is changed
    React.useEffect(() => {
        const prev_state = store.current.getState()["layers"];
        const cur_state = layers;
        const patch = jsonpatch.compare(prev_state, cur_state);
        const replace_operations = patch.filter((obj) => obj.op === "replace");
        if (replace_operations.length > 0) {
            const new_state = jsonpatch.applyPatch(
                prev_state,
                replace_operations,
                false,
                false
            ).newDocument;
            store.current.dispatch(setLayers(new_state));
        }
    }, [layers]);

    //React.useEffect(() => {
    //    store.current.dispatch(setLayers({ layers: layersWithDefaultProps }));
    //}, [layersWithDefaultProps]);

    return (
        deckGLViews && (
            <ReduxProvider store={store.current}>
                <DeckGLWrapper
                    id={id}
                    initialViewState={initialViewState}
                    views={deckGLViews}
                    resources={resources}
                    coords={coords}
                    scale={scale}
                    coordinateUnit={coordinateUnit}
                    legendVisible={legendVisible}
                    setEditedData={setEditedData}
                />
            </ReduxProvider>
        )
    );
};

export default Map;

// ------------- Helper functions ---------- //
// returns initial view state for DeckGL
function getInitialViewState(
    bounds: [number, number, number, number],
    zoom: number
): Record<string, unknown> {
    const width = bounds[2] - bounds[0]; // right - left
    const height = bounds[3] - bounds[1]; // top - bottom

    const initial_view_state = {
        // target to center of the bound
        target: [bounds[0] + width / 2, bounds[1] + height / 2, 0],
        zoom: zoom,
    };

    return initial_view_state;
}

// construct views object for DeckGL component
function getViewsForDeckGL(): Record<string, unknown>[] {
    const deckgl_views = [
        {
            "@@type": "OrthographicView",
            id: "main",
            controller: {
                doubleClickZoom: false,
            },
            x: "0%",
            y: "0%",
            width: "100%",
            height: "100%",
            flipY: false,
        },
    ];
    return deckgl_views;
}

// update layer object to include default props
function getLayersWithDefaultProps(
    deckgl_layers: Record<string, unknown>[],
    bounds: [number, number, number, number]
): Record<string, unknown>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layers = deckgl_layers.map((a) => {
        return { ...a };
    });
    //const layers = [...(deckgl_layers as any[])];
    layers?.forEach((layer) => {
        let default_props = undefined;
        if (layer["@@type"] === ColormapLayer.name) {
            default_props = ColormapLayer.defaultProps;
            if (default_props) default_props["bounds"] = bounds;
        } else if (layer["@@type"] === Hillshading2DLayer.name) {
            default_props = Hillshading2DLayer.defaultProps;
            if (default_props) default_props["bounds"] = bounds;
        } else if (layer["@@type"] === WellsLayer.name)
            default_props = WellsLayer.defaultProps;
        else if (layer["@@type"] === FaultPolygonsLayer.name)
            default_props = FaultPolygonsLayer.defaultProps;
        else if (layer["@@type"] === PieChartLayer.name)
            default_props = PieChartLayer.defaultProps;
        else if (layer["@@type"] === DrawingLayer.name)
            default_props = DrawingLayer.defaultProps;

        if (default_props) {
            Object.entries(default_props).forEach(([prop, value]) => {
                const prop_type = typeof value;
                if (["string", "boolean", "number"].includes(prop_type)) {
                    if (layer[prop] === undefined) layer[prop] = value;
                }
            });
        }
    });
    return layers;
}
