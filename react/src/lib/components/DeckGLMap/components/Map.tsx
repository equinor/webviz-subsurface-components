import * as jsonpatch from "fast-json-patch";
import DeckGLWrapper from "./DeckGLWrapper";
import { AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../redux/store";
import { setLayers } from "../redux/actions";
import { getLayersWithDefaultProps } from "../layers/utils/layerTools";
import { templateArray } from "./WelllayerTemplateTypes";
import { colorTablesArray } from "./ColorTableTypes";

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

    legend: {
        visible: boolean;
        position: number[];
    };

    /**
     * Prop containing edited data from layers
     */
    editedData: Record<string, unknown>;

    /**
     * For reacting to prop changes
     */
    setEditedData: (data: Record<string, unknown>) => void;

    children?: React.ReactNode;

    template: templateArray;

    colorTables: colorTablesArray;
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
    legend,
    template,
    colorTables,
    editedData,
    setEditedData,
}: MapProps) => {
    // state for initial views prop (target and zoom) of DeckGL component
    const [initialViewState, setInitialViewState] =
        React.useState<Record<string, unknown>>();
    React.useEffect(() => {
        setInitialViewState(getInitialViewState(bounds, zoom));
    }, [bounds, zoom]);

    // state for views prop of DeckGL component
    // Now we are using single view, will extend to support multiple synced views
    const deckGLViews = getViewsForDeckGL();

    // state to update layers to include default props
    const [layersWithDefaultProps, setLayersWithDefaultProps] = React.useState(
        getLayersWithDefaultProps(layers)
    );
    React.useEffect(() => {
        setLayersWithDefaultProps(getLayersWithDefaultProps(layers));
    }, [layers]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = React.useRef<EnhancedStore<any, AnyAction, any>>(
        createStore(layersWithDefaultProps)
    );

    // update the store if layer prop is changed
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
                    legend={legend}
                    editedData={editedData}
                    setEditedData={setEditedData}
                    template={template}
                    colorTables={colorTables}
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
            id: "main2D",
            controller: {
                doubleClickZoom: false,
            },
            x: "0%",
            y: "0%",
            width: "100%",
            height: "100%",
            flipY: false,
        },
        {
            "@@type": "OrbitView",
            id: "main3D",
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
