import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { PickInfo } from "deck.gl";
import { Feature } from "geojson";
import React, { useEffect, useState, useCallback } from "react";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { MapState } from "../redux/store";
import { useSelector } from "react-redux";
import { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "./DistanceScale";
import StatusIndicator from "./StatusIndicator";
import { Layer, View } from "deck.gl";
import { DeckGLView } from "./DeckGLView";
import { Viewport } from "@deck.gl/core";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { LayerProps, LayerContext } from "@deck.gl/core/lib/layer";
import { ViewProps } from "@deck.gl/core/views/view";
import { isEmpty } from "lodash";
import ColorLegend from "./ColorLegend";
import { getLayersInViewport } from "../layers/utils/layerTools";
import ViewFooter from "./ViewFooter";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");

export interface ViewportType {
    /**
     * Viewport id
     */
    id: string;

    /**
     * Viewport name
     */
    name?: string;

    /**
     * If true, displays map in 3D view, default is 2D view (false)
     */
    show3D?: boolean;

    /**
     * Layers to be displayed on viewport
     */
    layerIds?: string[];
}

export interface ViewsType {
    /**
     * Layout for viewport in specified as [row, column]
     */
    layout: [number, number];

    /**
     * Show views label
     */
    showLabel?: boolean;

    /**
     * Layers configuration for multiple viewport
     */
    viewports: ViewportType[];
}

export interface DeckGLLayerContext extends LayerContext {
    userData: {
        setEditedData: (data: Record<string, unknown>) => void;
        colorTables: colorTablesArray;
    };
}

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
    resources?: Record<string, unknown>;

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds?: [number, number, number, number];

    /**
     * Zoom level for the view.
     */
    zoom?: number;

    /**
     * Views configuration for map. If not specified, all the layers will be
     * displayed in a single 2D viewport
     */
    views?: ViewsType;

    /**
     * Parameters for the InfoCard component
     */
    coords?: {
        visible?: boolean | null;
        multiPicking?: boolean | null;
        pickDepth?: number | null;
    };

    /**
     * Parameters for the Distance Scale component
     */
    scale?: {
        visible?: boolean | null;
        incrementValue?: number | null;
        widthPerUnit?: number | null;
        position?: number[] | null;
    };

    coordinateUnit?: string;

    legend?: {
        visible?: boolean | null;
        position?: number[] | null;
        horizontal?: boolean | null;
    };

    /**
     * Prop containing color table data
     */
    colorTables?: colorTablesArray;

    /**
     * Prop containing edited data from layers
     */
    editedData?: Record<string, unknown>;

    /**
     * For reacting to prop changes
     */
    setEditedData?: (data: Record<string, unknown>) => void;

    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
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
    children,
}: MapProps) => {
    // state for initial views prop (target and zoom) of DeckGL component
    const [initialViewState, setInitialViewState] =
        useState<Record<string, unknown>>();
    useEffect(() => {
        if (bounds == undefined || zoom == undefined) return;
        setInitialViewState(getInitialViewState(bounds, zoom));
    }, [bounds, zoom]);

    // state for views prop of DeckGL component
    const [viewsProps, setViewsProps] = useState<ViewProps[]>([]);
    useEffect(() => {
        setViewsProps(getViews(views) as ViewProps[]);
    }, [views]);

    const [deckGLViews, setDeckGLViews] = useState<View[]>([]);
    useEffect(() => {
        setDeckGLViews(jsonToObject(viewsProps) as View[]);
    }, [viewsProps]);

    // get layers data from store
    const spec = useSelector((st: MapState) => st.spec);
    const [layersData, setLayersData] = useState<LayerProps<unknown>[]>();
    useEffect(() => {
        if (isEmpty(spec) || !("layers" in spec)) return;
        setLayersData(spec["layers"] as LayerProps<unknown>[]);
    }, [spec]);

    const [deckGLLayers, setDeckGLLayers] = useState<Layer<unknown>[]>([]);
    useEffect(() => {
        if (!layersData || !layersData.length) {
            return;
        }
        const enumerations = [];
        if (resources) enumerations.push({ resources: resources });
        if (editedData) enumerations.push({ editedData: editedData });
        else enumerations.push({ editedData: {} });

        setDeckGLLayers(
            jsonToObject(layersData, enumerations) as Layer<unknown>[]
        );
    }, [layersData, resources, editedData]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewState, setViewState] = useState<any>();

    const refCb = useCallback((deckRef) => {
        if (deckRef && deckRef.deck) {
            // Needed to initialize the viewState on first load
            setViewState(deckRef.deck.viewState);
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<any>([]);
    const onHover = useCallback(
        (pickInfo, event) => {
            if (coords?.multiPicking && pickInfo.layer) {
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

    const onAfterRender = useCallback(() => {
        if (deckGLLayers) {
            const state = deckGLLayers.every((layer) => layer.isLoaded);
            setIsLoaded(state);
        }
    }, [deckGLLayers]);

    const layerFilter = useCallback(
        (args: {
            layer: Layer<unknown, LayerProps<unknown>>;
            viewport: Viewport;
        }): boolean => {
            // display all the layers if views are not specified correctly
            if (!views || !views.viewports || !views.layout) return true;

            const cur_view = views.viewports.find(
                ({ id }) =>
                    args.viewport.id &&
                    new RegExp("^" + id).test(args.viewport.id)
            );
            if (cur_view?.layerIds && cur_view.layerIds.length > 0) {
                const layer_ids = cur_view.layerIds;
                return layer_ids.some((layer_id) =>
                    args.layer.id.match(new RegExp("\\b" + layer_id + "\\b"))
                );
            } else {
                return true;
            }
        },
        [views]
    );

    if (!deckGLViews || isEmpty(deckGLViews) || isEmpty(deckGLLayers))
        return null;

    return (
        <div>
            <DeckGL
                id={id}
                viewState={viewState}
                initialViewState={initialViewState}
                views={deckGLViews}
                layerFilter={layerFilter}
                layers={deckGLLayers}
                userData={{
                    setEditedData: (updated_prop: Record<string, unknown>) => {
                        setEditedData?.(updated_prop);
                    },
                    colorTables: colorTables,
                }}
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
                onViewStateChange={(viewport) =>
                    setViewState(viewport.viewState)
                }
                onAfterRender={onAfterRender}
            >
                {children}
                {views?.viewports &&
                    views.viewports.map((view, index) => (
                        <DeckGLView
                            key={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                            id={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                        >
                            {colorTables && (
                                <ColorLegend
                                    {...legend}
                                    layers={
                                        getLayersInViewport(
                                            deckGLLayers,
                                            view.layerIds
                                        ) as Layer<unknown>[]
                                    }
                                    colorTables={colorTables}
                                />
                            )}
                            <Settings
                                viewportId={view.id}
                                layerIds={view.layerIds}
                            />
                            {views.showLabel && (
                                <ViewFooter>
                                    {`${
                                        view.name
                                            ? view.name
                                            : `View_${index + 1}`
                                    } `}
                                </ViewFooter>
                            )}
                        </DeckGLView>
                    ))}
            </DeckGL>

            {scale?.visible ? (
                <DistanceScale
                    zoom={
                        viewState?.zoom
                            ? viewState.zoom
                            : initialViewState?.["zoom"]
                    }
                    incrementValue={scale.incrementValue}
                    widthPerUnit={scale.widthPerUnit}
                    position={scale.position}
                    scaleUnit={coordinateUnit}
                />
            ) : null}

            <StatusIndicator layers={deckGLLayers} isLoaded={isLoaded} />

            {coords?.visible ? <InfoCard pickInfos={hoverInfo} /> : null}
        </div>
    );
};

Map.defaultProps = {
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
        position: [5, 10],
        horizontal: true,
    },
    coordinateUnit: "m",
    zoom: -3,
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
    colorTables: colorTables,
};

export default Map;

// ------------- Helper functions ---------- //

// Add the resources as an enum in the Json Configuration and then convert the spec to actual objects.
// See https://deck.gl/docs/api-reference/json/overview for more details.
function jsonToObject(
    data: ViewProps[] | LayerProps<unknown>[],
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

    // remove empty data/layer object
    const filtered_data = (data as Record<string, unknown>[]).filter(
        (value) => Object.keys(value).length !== 0
    );
    return jsonConverter.convert(filtered_data);
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
function getViews(views: ViewsType | undefined): Record<string, unknown>[] {
    const deckgl_views = [];
    // if props for multiple viewport are not proper, return 2d view
    const far = 9999.9;
    if (!views || !views.viewports || !views.layout) {
        deckgl_views.push({
            "@@type": "OrthographicView",
            id: "main",
            controller: { doubleClickZoom: false },
            x: "0%",
            y: "0%",
            width: "100%",
            height: "100%",
            flipY: false,
            far,
        });
    } else {
        let yPos = 0;
        const [nY, nX] = views.layout;
        for (let y = 1; y <= nY; y++) {
            let xPos = 0;
            for (let x = 1; x <= nX; x++) {
                if (
                    views.viewports == undefined ||
                    deckgl_views.length >= views.viewports.length
                )
                    return deckgl_views;

                const cur_viewport = views.viewports[deckgl_views.length];
                const view_type: string = cur_viewport.show3D
                    ? "OrbitView"
                    : "OrthographicView";
                const id_suffix = cur_viewport.show3D ? "_3D" : "_2D";
                const view_id: string = cur_viewport.id + id_suffix;

                deckgl_views.push({
                    "@@type": view_type,
                    id: view_id,
                    controller: {
                        doubleClickZoom: false,
                    },
                    x: xPos + "%",
                    y: yPos + "%",
                    width: 100 / nX + "%",
                    height: 100 / nY + "%",
                    flipY: false,
                    far,
                });
                xPos = xPos + 100 / nX;
            }
            yPos = yPos + 100 / nY;
        }
    }
    return deckgl_views;
}
