import DeckGLWrapper, { ViewsType } from "./DeckGLWrapper";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../redux/store";
import { setSpec } from "../redux/actions";
import {
    applyPropsOnLayers,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";
import { colorTablesArray } from "@emerson-eps/color-tables";

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
     * Views configuration for map. If not specified, all the layers will be
     * displayed in a single 2D viewport
     */
    views?: ViewsType;

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
        horizontal: boolean;
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

    colorTables: colorTablesArray;
}

const Map: React.FC<MapProps> = ({
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
    colorTables,
    editedData,
    setEditedData,
}: MapProps) => {
    // create store once with layers data
    const store = React.useMemo(() => {
        return createStore({
            layers: getLayersWithDefaultProps(layers),
            views: views,
        });
    }, []);

    // update store if any of the layer prop is changed
    React.useEffect(() => {
        const prev_layers_in_redux = store.getState()["spec"]["layers"];
        const layers_store = applyPropsOnLayers(prev_layers_in_redux, layers);
        const layers_default = getLayersWithDefaultProps(layers_store);
        const spec = { layers: layers_default, views: views };
        store.dispatch(setSpec(spec));
    }, [layers]);

    return (
        <ReduxProvider store={store}>
            <DeckGLWrapper
                id={id}
                resources={resources}
                bounds={bounds}
                zoom={zoom}
                views={views}
                coords={coords}
                scale={scale}
                coordinateUnit={coordinateUnit}
                legend={legend}
                editedData={editedData}
                setEditedData={setEditedData}
                colorTables={colorTables}
            />
        </ReduxProvider>
    );
};

export default Map;
