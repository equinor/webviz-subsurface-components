import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { PickInfo } from "deck.gl";
import { Feature } from "geojson";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { MapState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { setSpec } from "../redux/actions";
import { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "./DistanceScale";
import StatusIndicator from "./StatusIndicator";
import { Layer, View } from "deck.gl";
import { DeckGLView } from "./DeckGLView";
import { Viewport } from "@deck.gl/core";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { LayerProps, LayerContext } from "@deck.gl/core/lib/layer";
import Deck from "@deck.gl/core/lib/deck";
import { ViewProps } from "@deck.gl/core/views/view";
import { isEmpty } from "lodash";
import ColorLegend from "./ColorLegend";
import {
    applyPropsOnLayers,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";
import ViewFooter from "./ViewFooter";
import fitBounds from "../utils/fit-bounds";
import {
    validateColorTables,
    validateLayers,
} from "../../../inputSchema/schemaValidationUtil";
import { DrawingPickInfo } from "../layers/drawing/drawingLayer";
import { getLayersByType } from "../layers/utils/layerTools";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/dist/component/color-tables.json");

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

interface ViewStateType {
    target: number[];
    zoom: number;
    rotationX: number;
    rotationOrbit: number;
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

    /* List of JSON object containing layer specific data.
     * Each JSON object will consist of layer type with key as "@@type" and
     * layer specific data, if any.
     */
    layers?: Record<string, unknown>[];

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     */
    bounds: [number, number, number, number];

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
        cssStyle?: Record<string, unknown> | null;
    };

    coordinateUnit?: string;

    /**
     * Parameters to control toolbar
     */
    toolbar?: {
        visible?: boolean | null;
    };

    legend?: {
        visible?: boolean | null;
        cssStyle?: Record<string, unknown> | null;
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

    /**
     * Validate JSON datafile against schems
     */
    checkDatafileSchema?: boolean;

    /**
     * For get mouse events
     */
    onMouseEvent?: (event: MapMouseEvent) => void;

    children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PickingInfo = any;
export interface MapMouseEvent {
    type: "click" | "hover" | "contextmenu";
    infos: PickingInfo[];
    // some frequently used values extracted from infos:
    x?: number;
    y?: number;
    wellname?: string;
    md?: number;
    tvd?: number;
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
    toolbar,
    legend,
    colorTables,
    editedData,
    setEditedData,
    checkDatafileSchema,
    onMouseEvent,
    children,
}: MapProps) => {
    const deckRef = useRef<DeckGL>(null);

    // set initial view state based on supplied bounds and zoom in viewState
    const [viewState, setViewState] = useState<ViewStateType>(
        getViewState(bounds, zoom)
    );

    // react on zoom prop change
    useEffect(() => {
        const vs = getViewState(bounds, zoom, deckRef.current?.deck);
        setViewState({ ...viewState, zoom: vs.zoom });
    }, [zoom]);

    // react on bounds prop change
    useEffect(() => {
        const vs = getViewState(bounds, zoom, deckRef.current?.deck);
        setViewState({ ...viewState, target: vs.target });
    }, [bounds]);

    // calculate view state on deckgl context load (based on viewport size)
    const onLoad = useCallback(() => {
        setViewState(getViewState(bounds, zoom, deckRef.current?.deck));
    }, []);

    // state for views prop of DeckGL component
    const [viewsProps, setViewsProps] = useState<ViewProps[]>([]);
    useEffect(() => {
        setViewsProps(getViews(views) as ViewProps[]);
    }, [views]);

    const [deckGLViews, setDeckGLViews] = useState<View[]>([]);
    useEffect(() => {
        setDeckGLViews(jsonToObject(viewsProps) as View[]);
    }, [viewsProps]);

    // update store if any of the layer prop is changed
    const dispatch = useDispatch();
    const st_layers = useSelector(
        (st: MapState) => st.spec["layers"]
    ) as Record<string, unknown>[];
    React.useEffect(() => {
        if (st_layers == undefined || layers == undefined) return;

        const updated_layers = applyPropsOnLayers(st_layers, layers);
        const layers_default = getLayersWithDefaultProps(updated_layers);
        const updated_spec = { layers: layers_default, views: views };
        dispatch(setSpec(updated_spec));
    }, [layers, dispatch]);

    const [deckGLLayers, setDeckGLLayers] = useState<Layer<unknown>[]>([]);
    useEffect(() => {
        const layers = st_layers as LayerProps<unknown>[];
        if (!layers || layers.length == 0) return;

        const enumerations = [];
        if (resources) enumerations.push({ resources: resources });
        if (editedData) enumerations.push({ editedData: editedData });
        else enumerations.push({ editedData: {} });

        setDeckGLLayers(jsonToObject(layers, enumerations) as Layer<unknown>[]);
    }, [st_layers, resources, editedData]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<any>([]);
    const onHover = useCallback(
        (pickInfo, event) => {
            const infos = getPickingInfos(pickInfo, event);
            setHoverInfo(infos); //  for InfoCard pickInfos
            callOnMouseEvent("hover", infos, event);
        },
        [coords, onMouseEvent]
    );

    const onClick = useCallback(
        (pickInfo, event) => {
            const infos = getPickingInfos(pickInfo, event);
            callOnMouseEvent("click", infos, event);
        },
        [coords, onMouseEvent]
    );

    const getPickingInfos = (
        pickInfo: PickingInfo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any
    ): PickingInfo[] => {
        if (coords?.multiPicking && pickInfo.layer) {
            return pickInfo.layer.context.deck.pickMultipleObjects({
                x: event.offsetCenter.x,
                y: event.offsetCenter.y,
                radius: 1,
                depth: coords.pickDepth,
            });
        }
        return [pickInfo];
    };

    /**
     * call onMouseEvent callback
     */
    const callOnMouseEvent = (
        type: "click" | "hover",
        infos: PickingInfo[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any
    ): void => {
        if (onMouseEvent) {
            const ev: MapMouseEvent = {
                type: type,
                infos: infos,
            };
            if (ev.type === "click") {
                if (event.rightButton) ev.type = "contextmenu";
            }
            for (const info of infos) {
                if (info.coordinate) {
                    ev.x = info.coordinate[0];
                    ev.y = info.coordinate[1];
                }
                //const layer_name = (info.layer?.props as ExtendedLayerProps<FeatureCollection>)?.name;
                if (info.layer && info.layer.id === "wells-layer") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    info.properties?.forEach((property: any) => {
                        let propname = property.name;
                        if (propname) {
                            const sep = propname.indexOf(" ");
                            if (sep >= 0) {
                                // it is a simple hack to get well name previously added to the end of property name
                                ev.wellname = propname.substring(sep + 1);
                                propname = propname.substring(0, sep);
                            }
                        }
                        if (propname === "MD")
                            ev.md = parseFloat(property.value);
                        else if (propname === "TVD")
                            ev.tvd = parseFloat(property.value);
                    });
                    break;
                }
            }
            onMouseEvent(ev);
        }
    };

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const onAfterRender = useCallback(() => {
        if (deckGLLayers) {
            const state = deckGLLayers.every((layer) => layer.isLoaded);
            setIsLoaded(state);
        }
    }, [deckGLLayers]);

    // validate layers data
    const [errorText, setErrorText] = useState<string>();
    useEffect(() => {
        const layers = deckRef.current?.deck.props.layers as Layer<unknown>[];
        // this ensures to validate the schemas only once
        if (checkDatafileSchema && layers && isLoaded) {
            try {
                validateLayers(layers);
                colorTables && validateColorTables(colorTables);
            } catch (e) {
                setErrorText(String(e));
            }
        } else setErrorText(undefined);
    }, [checkDatafileSchema, deckRef.current?.deck.props.layers, isLoaded]);

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
                    info: PickInfo<unknown>
                ): string | null | undefined => {
                    if ((info as WellsPickInfo)?.logName) {
                        return (info as WellsPickInfo)?.logName;
                    } else if (info.layer?.id === "drawing-layer") {
                        return (info as DrawingPickInfo).measurement?.toFixed(
                            2
                        );
                    } else {
                        const feat = info.object as Feature;
                        return feat?.properties?.["name"];
                    }
                }}
                ref={deckRef}
                onViewStateChange={(viewport) =>
                    setViewState(viewport.viewState)
                }
                onHover={onHover}
                onClick={onClick}
                onLoad={onLoad}
                onAfterRender={onAfterRender}
            >
                {children}
                {views?.viewports &&
                    views.viewports.map((view, index) => (
                        <DeckGLView
                            key={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                            id={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                        >
                            {colorTables && legend?.visible && (
                                <ColorLegend
                                    {...legend}
                                    layers={[
                                        getLayersByType(
                                            deckRef.current?.deck.props
                                                .layers as Layer<unknown>[],
                                            "WellsLayer"
                                        )?.[0],
                                        getLayersByType(
                                            deckRef.current?.deck.props
                                                .layers as Layer<unknown>[],
                                            "ColormapLayer"
                                        )?.[0],
                                    ]}
                                    colorTables={colorTables}
                                />
                            )}
                            {toolbar?.visible && (
                                <Settings
                                    viewportId={view.id}
                                    layerIds={view.layerIds}
                                />
                            )}
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
                    {...scale}
                    zoom={viewState?.zoom}
                    scaleUnit={coordinateUnit}
                />
            ) : null}

            <StatusIndicator layers={deckGLLayers} isLoaded={isLoaded} />

            {coords?.visible ? <InfoCard pickInfos={hoverInfo} /> : null}

            {errorText && (
                <pre
                    style={{
                        flex: "0, 0",
                        color: "rgb(255, 64, 64)",
                        backgroundColor: "rgb(255, 255, 192)",
                    }}
                >
                    {errorText}
                </pre>
            )}
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
        cssStyle: { top: 10, left: 10 },
    },
    toolbar: {
        visible: false,
    },
    legend: {
        visible: true,
        cssStyle: { top: 5, right: 10 },
        horizontal: false,
    },
    coordinateUnit: "m",
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
    colorTables: colorTables,
    checkDatafileSchema: false,
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

// return viewstate with computed bounds to fit the data in viewport
function getViewState(
    bounds: [number, number, number, number],
    zoom?: number,
    deck?: Deck
): ViewStateType {
    let width = bounds[2] - bounds[0]; // right - left
    let height = bounds[3] - bounds[1]; // top - bottom
    if (deck) {
        width = deck.width;
        height = deck.height;
    }

    const padding = 20;
    const fitted_bound = fitBounds({ width, height, bounds, padding });
    const view_state: ViewStateType = {
        target: [fitted_bound.x, fitted_bound.y, 0],
        zoom: zoom ?? fitted_bound.zoom,
        rotationX: 90, // look down z -axis
        rotationOrbit: 0,
    };
    return view_state;
}

// construct views object for DeckGL component
function getViews(views: ViewsType | undefined): Record<string, unknown>[] {
    const deckgl_views = [];
    // if props for multiple viewport are not proper, return 2d view
    const far = 9999.9;
    const near = 0.0001;
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
            near,
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

                    // Using 99.5% of viewport to avoid flickering of deckgl canvas
                    width: 99.5 / nX + "%",
                    height: 99.5 / nY + "%",
                    flipY: false,
                    far,
                    near,
                });
                xPos = xPos + 99.5 / nX;
            }
            yPos = yPos + 99.5 / nY;
        }
    }
    return deckgl_views;
}
