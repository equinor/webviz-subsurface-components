import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { PickInfo } from "deck.gl";
import { Feature } from "geojson";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { MapState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateLayerProp } from "../redux/actions";
import { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "../components/DistanceScale";
import DiscreteColorLegend from "../components/DiscreteLegend";
import ContinuousLegend from "../components/ContinuousLegend";
import StatusIndicator from "./StatusIndicator";
import { DrawingLayer, WellsLayer, PieChartLayer } from "../layers";
import { Layer, View } from "deck.gl";
import { templateArray } from "./WelllayerTemplateTypes";
import { colorTablesArray } from "./ColorTableTypes";
import { LayerProps } from "@deck.gl/core/lib/layer";

export interface DeckGLWrapperProps {
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
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds: [number, number, number, number];

    /**
     * Zoom level for the view.
     */
    zoom: number;

    /**
     * If true, displays map in 3D view, default is 2D view
     */
    view3D: boolean;

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

    template: templateArray;

    colorTables: colorTablesArray;
}

function getLayer(layers: Layer<unknown>[] | undefined, id: string) {
    if (!layers) return;
    const layer = layers.filter(
        (item) => item.id?.toLowerCase() == id.toLowerCase()
    );
    return layer[0];
}

const DeckGLWrapper: React.FC<DeckGLWrapperProps> = ({
    id,
    resources,
    bounds,
    zoom,
    view3D,
    coords,
    scale,
    coordinateUnit,
    legend,
    editedData,
    setEditedData,
    template,
    colorTables,
    children,
}: DeckGLWrapperProps) => {
    // state for initial views prop (target and zoom) of DeckGL component
    const [initialViewState, setInitialViewState] =
        useState<Record<string, unknown>>();
    useEffect(() => {
        setInitialViewState(getInitialViewState(bounds, zoom));
    }, [bounds, zoom]);

    // state for views prop of DeckGL component
    const [deckGLViews, setDeckGLViews] = useState<View[]>([]);
    useEffect(() => {
        setDeckGLViews(getViewsForDeckGL(view3D));
    }, [view3D]);

    // get layers data from store
    const layersData = useSelector((st: MapState) => st.layers);
    const [deckGLLayers, setDeckGLLayers] = useState<Layer<unknown>[]>([]);

    useEffect(() => {
        if (!layersData.length) {
            return;
        }

        const enumerations = [
            { resources: resources },
            { editedData: editedData },
        ];
        setDeckGLLayers(
            jsonToObject(layersData, enumerations) as Layer<unknown>[]
        );
    }, [layersData, resources, editedData]);

    // Hacky way of disabling well selection when drawing.
    const drawingLayer = useMemo(
        () => getLayer(deckGLLayers, "drawing-layer") as DrawingLayer,
        [deckGLLayers]
    );

    const dispatch = useDispatch();
    useEffect(() => {
        if (!drawingLayer) return;

        const wellsLayer = getLayer(deckGLLayers, "wells-layer") as WellsLayer;
        const drawingEnabled = drawingLayer.props.mode != "view";
        if (wellsLayer) {
            dispatch(
                updateLayerProp([
                    "wells-layer",
                    "selectionEnabled",
                    !drawingEnabled,
                ])
            );
        }

        const pieLayer = getLayer(deckGLLayers, "pie-layer") as PieChartLayer;
        if (pieLayer) {
            dispatch(
                updateLayerProp([
                    "pie-layer",
                    "selectionEnabled",
                    !drawingEnabled,
                ])
            );
        }
    }, [drawingLayer?.props.mode, dispatch]);

    const refCb = useCallback(
        (deckRef) => {
            if (deckRef && deckRef.deck) {
                // Needed to initialize the viewState on first load
                setViewState(deckRef.deck.viewState);
                deckRef.deck.setProps({
                    // userData is undocumented and it doesn't appear in the
                    // deckProps type, but it is used by the layersManager
                    // and forwarded though the context to all the layers.
                    userData: {
                        setEditedData: (
                            updated_prop: Record<string, unknown>
                        ) => {
                            setEditedData?.(updated_prop);
                        },
                    },
                });
            }
        },
        [setEditedData]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<any>([]);
    const onHover = useCallback(
        (pickInfo, event) => {
            if (coords.multiPicking && pickInfo.layer) {
                const infos = pickInfo.layer.context.deck.pickMultipleObjects({
                    x: event.offsetCenter.x,
                    y: event.offsetCenter.y,
                    radius: 1,
                    depth: coords.pickDepth,
                });
                setHoverInfo(infos);
            } else {
                setHoverInfo([pickInfo]);
            }
        },
        [coords]
    );

    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const [legendProps, setLegendProps] = useState<{
        title: string;
        name: string;
        discrete: boolean;
        metadata: { objects: Record<string, [number[], number]> };
        valueRange: number[];
    }>({
        title: "",
        name: "string",
        discrete: false,
        metadata: { objects: {} },
        valueRange: [],
    });

    const onAfterRender = useCallback(() => {
        if (deckGLLayers) {
            const state = deckGLLayers.every((layer) => layer.isLoaded);
            setIsLoaded(state);
        }
    }, [deckGLLayers]);

    const wellsLayer = useMemo(
        () => getLayer(deckGLLayers, "wells-layer") as WellsLayer,
        [deckGLLayers]
    );
    const onLoad = useCallback(() => {
        if (wellsLayer) {
            wellsLayer.setState({
                template: template,
                colorTables: colorTables,
            });
        }
    }, [wellsLayer, template, colorTables]);
    // Get color table for log curves.
    useEffect(() => {
        if (!wellsLayer?.isLoaded || !wellsLayer.props.logData) return;
        const legend = wellsLayer.state.legend[0];
        setLegendProps({
            title: legend.title,
            name: legend.name,
            discrete: legend.discrete,
            metadata: legend.metadata,
            valueRange: legend.valueRange,
        });
    }, [isLoaded, legend, wellsLayer?.props?.logName]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewState, setViewState] = useState<any>();

    if (!deckGLViews) return null;

    return (
        <div>
            <DeckGL
                id={id}
                initialViewState={initialViewState}
                views={deckGLViews}
                layers={deckGLLayers}
                getCursor={({ isDragging }): string =>
                    isDragging ? "grabbing" : "default"
                }
                // @ts-expect-error: Fix type in WellsLayer
                getTooltip={(
                    info: PickInfo<unknown> | WellsPickInfo
                ): string | null | undefined => {
                    if ((info as WellsPickInfo)?.logName) {
                        return (info as WellsPickInfo)?.logName;
                    } else {
                        const feat = info.object as Feature;
                        return feat?.properties?.["name"];
                    }
                }}
                ref={refCb}
                onHover={onHover}
                onViewStateChange={({ viewState }) => setViewState(viewState)}
                onAfterRender={onAfterRender}
                onLoad={onLoad}
            >
                {children}
            </DeckGL>
            {coords.visible ? <InfoCard pickInfos={hoverInfo} /> : null}
            <Settings />
            {viewState && scale.visible ? (
                <DistanceScale
                    zoom={viewState.zoom}
                    incrementValue={scale.incrementValue}
                    widthPerUnit={scale.widthPerUnit}
                    position={scale.position}
                    scaleUnit={coordinateUnit}
                />
            ) : null}
            {legend.visible && legendProps.discrete && (
                <DiscreteColorLegend
                    discreteData={legendProps.metadata}
                    dataObjectName={legendProps.title}
                    position={legend.position}
                    name={legendProps.name}
                    template={template}
                    colorTables={colorTables}
                    horizontal={legend.horizontal}
                />
            )}
            {legendProps.valueRange?.length > 0 &&
                legend.visible &&
                legendProps && (
                    <ContinuousLegend
                        min={legendProps.valueRange[0]}
                        max={legendProps.valueRange[1]}
                        dataObjectName={legendProps.title}
                        position={legend.position}
                        name={legendProps.name}
                        template={template}
                        colorTables={colorTables}
                        horizontal={legend.horizontal}
                    />
                )}
            {deckGLLayers && (
                <StatusIndicator layers={deckGLLayers} isLoaded={isLoaded} />
            )}
        </div>
    );
};

export default DeckGLWrapper;

// ------------- Helper functions ---------- //
// Add the resources as an enum in the Json Configuration and then convert the spec to actual objects.
// See https://deck.gl/docs/api-reference/json/overview for more details.
function jsonToObject(
    data: Record<string, unknown>[] | LayerProps<unknown>[],
    enums: Record<string, unknown>[] | undefined = undefined
): Layer<unknown>[] | View[] {
    const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
    enums?.forEach((enumeration) => {
        if (enumeration) {
            configuration.merge({
                enumerations: {
                    ...enumeration,
                },
            });
        }
    });
    const jsonConverter = new JSONConverter({ configuration });
    return jsonConverter.convert(data);
}

// Returns DeckGL specific views object
function getViewsForDeckGL(view3D: boolean): View[] {
    return jsonToObject(getViews(view3D)) as View[];
}

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
function getViews(view3D: boolean): Record<string, unknown>[] {
    const view_type = view3D ? "OrbitView" : "OrthographicView";
    const id = view3D ? "main3D" : "main2D";
    const deckgl_views = [
        {
            "@@type": view_type,
            id: id,
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
