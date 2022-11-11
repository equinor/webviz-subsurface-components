import { JSONConfiguration, JSONConverter } from "@deck.gl/json/typed";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import {
    Color,
    Deck,
    Layer,
    LayersList,
    LayerProps,
    LayerContext,
    View,
    Viewport,
    PickingInfo,
} from "@deck.gl/core/typed";
import { Feature, FeatureCollection } from "geojson";
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
import { colorTablesArray } from "@emerson-eps/color-tables/";
import ColorLegends from "./ColorLegends";
import {
    applyPropsOnLayers,
    ExtendedLayer,
    getLayersInViewport,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";
import ViewFooter from "./ViewFooter";
import fitBounds from "../utils/fit-bounds";
import {
    validateColorTables,
    validateLayers,
} from "../../../inputSchema/schemaValidationUtil";
import { LayerPickInfo } from "../layers/utils/layerTools";
import { getLayersByType } from "../layers/utils/layerTools";
import { getWellLayerByTypeAndSelectedWells } from "../layers/utils/layerTools";
import { WellsLayer } from "../layers";

import { isEmpty, isEqual } from "lodash";
import { cloneDeep } from "lodash";

import { colorTables } from "@emerson-eps/color-tables";
import { getModelMatrixScale } from "../layers/utils/layerTools";
import { OrbitController, OrthographicController } from "@deck.gl/core/typed";
import { MjolnirEvent } from "mjolnir.js";

type BoundingBox = [number, number, number, number, number, number];

function addBoundingBoxes(b1: BoundingBox, b2: BoundingBox): BoundingBox {
    const boundsInitial: BoundingBox = [0, 0, 0, 1, 1, 1];

    if (typeof b1 === "undefined" || typeof b2 === "undefined") {
        return boundsInitial;
    }

    if (isEqual(b1, boundsInitial)) {
        return b2;
    }

    const xmin = Math.min(b1[0], b2[0]);
    const ymin = Math.min(b1[1], b2[1]);
    const zmin = Math.min(b1[2], b2[2]);

    const xmax = Math.max(b1[3], b2[3]);
    const ymax = Math.max(b1[4], b2[4]);
    const zmax = Math.max(b1[5], b2[5]);
    return [xmin, ymin, zmin, xmax, ymax, zmax];
}

function boundingBoxCenter(box: BoundingBox): [number, number, number] {
    const xmin = box[0];
    const ymin = box[1];
    const zmin = box[2];

    const xmax = box[3];
    const ymax = box[4];
    const zmax = box[5];
    return [
        xmin + 0.5 * (xmax - xmin),
        ymin + 0.5 * (ymax - ymin),
        zmin + 0.5 * (zmax - zmin),
    ];
}

export type BoundsAccessor = () => [number, number, number, number];

export type TooltipCallback = (
    info: PickingInfo
) => string | Record<string, unknown> | null;

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

    target?: [number, number];
    zoom?: number;
    rotationX?: number;
    rotationOrbit?: number;
    isSync?: boolean;
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

export interface ViewStateType {
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

export type EventCallback = (event: MapMouseEvent) => void;

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
    bounds?: [number, number, number, number] | BoundsAccessor;

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
    onMouseEvent?: EventCallback;

    getCameraPosition?: (input: ViewStateType) => void;

    /**
     * If changed will reset camera to default position.
     */
    triggerHome?: number;
    triggerResetMultipleWells?: number;
    selection?: {
        well: string | undefined;
        selection: [number | undefined, number | undefined] | undefined;
    };

    children?: React.ReactNode;

    getTooltip?: TooltipCallback;
    cameraPosition?: ViewStateType | undefined;
}

export interface MapMouseEvent {
    type: "click" | "hover" | "contextmenu";
    infos: PickingInfo[];
    // some frequently used values extracted from infos[]:
    x?: number;
    y?: number;
    // Only for one well. Full information is available in infos[]
    wellname?: string;
    wellcolor?: Color; // well color
    md?: number;
    tvd?: number;
}

export function useHoverInfo(): [PickingInfo[], EventCallback] {
    const [hoverInfo, setHoverInfo] = React.useState<PickingInfo[]>([]);
    const callback = React.useCallback((pickEvent: MapMouseEvent) => {
        setHoverInfo(pickEvent.infos);
    }, []);
    return [hoverInfo, callback];
}

function defaultTooltip(info: PickingInfo) {
    if ((info as WellsPickInfo)?.logName) {
        return (info as WellsPickInfo)?.logName;
    } else if (info.layer?.id === "drawing-layer") {
        return (info as LayerPickInfo).propertyValue?.toFixed(2);
    }
    const feat = info.object as Feature;
    return feat?.properties?.["name"];
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    layers,
    bounds,
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
    selection,
    children,
    getTooltip = defaultTooltip,
    cameraPosition = {} as ViewStateType,
    getCameraPosition,
    triggerHome,
    triggerResetMultipleWells,
}: MapProps) => {
    const deckRef = useRef<DeckGLRef>(null);
    const bboxInitial: BoundingBox = [0, 0, 0, 1, 1, 1];
    const boundsInitial = bounds ?? [0, 0, 1, 1];

    // state for views prop of DeckGL component
    const [viewsProps, setViewsProps] = useState<ViewportType[]>([]);

    const initialViewState = getViewState(
        boundsInitial,
        views?.viewports[0].target,
        views?.viewports[0].zoom,
        deckRef.current?.deck
    );

    // Local help function.
    function calcDefaultViewStates() {
        // If "bounds" or "cameraPosition" is not defined "viewState" will be
        // calculated based on the union of the reported bounding boxes from each layer.
        const isBoundsDefined =
            typeof bounds !== "undefined" &&
            typeof cameraPosition !== "undefined";
        const union_of_reported_bboxes = addBoundingBoxes(
            reportedBoundingBoxAcc,
            reportedBoundingBox
        );
        setReportedBoundingBoxAcc(union_of_reported_bboxes);

        const axesLayer = st_layers.find((e) => {
            return e["@@type"] === "AxesLayer";
        });
        const isAxesLayer = typeof axesLayer !== "undefined";
        // target: camera will look at either center of axes if it exists or center of data ("union_of_reported_bboxes")
        const target = boundingBoxCenter(
            isAxesLayer
                ? (axesLayer?.["bounds"] as BoundingBox)
                : (union_of_reported_bboxes as BoundingBox)
        );

        const is3D = views?.viewports?.[0]?.show3D ?? false;
        if (!is3D) {
            target.pop(); // In 2D "target" should only contain x and y.
        }

        let tempViewStates: Record<string, ViewStateType> = {};
        tempViewStates = Object.fromEntries(
            viewsProps.map((item, index) => [
                item.id,
                isBoundsDefined
                    ? getViewState(
                          boundsInitial,
                          target,
                          views?.viewports[index].zoom,
                          deckRef.current?.deck
                      )
                    : getViewState3D(
                          is3D,
                          union_of_reported_bboxes,
                          views?.viewports[index].zoom,
                          deckRef.current?.deck
                      ),
            ])
        );
        setDidUserChangeCamera(false);
        setViewStates(tempViewStates);
    }

    // set initial view state based on supplied bounds and zoom in viewState
    const [viewStates, setViewStates] = useState<Record<string, ViewStateType>>(
        {
            "main-view_2D": cameraPosition,
        }
    );
    const [firstViewStateId, setFirstViewStatesId] =
        useState<string>("main-view_2D");

    useEffect(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (cameraPosition && Object.keys(cameraPosition).length !== 0) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            );
        } else {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => {
                    const viewState = viewStates[item.id];
                    return [
                        item.id,
                        typeof viewState !== "undefined"
                            ? viewState
                            : getViewState(
                                  boundsInitial,
                                  views?.viewports[index].target,
                                  views?.viewports[index].zoom,
                                  deckRef.current?.deck
                              ),
                    ];
                })
            );
        }
        if (viewsProps[0] !== undefined) {
            setFirstViewStatesId(viewsProps[0].id);
        }
        setViewStates(tempViewStates);
    }, [viewsProps]);

    // calculate view state on deckgl context load (based on viewport size)
    const onLoad = useCallback(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (cameraPosition && Object.keys(cameraPosition).length !== 0) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            );
        } else {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => [
                    item.id,
                    getViewState(
                        boundsInitial,
                        views?.viewports[index].target,
                        views?.viewports[index].zoom,
                        deckRef.current?.deck
                    ),
                ])
            );
            if (viewsProps[0] !== undefined) {
                setFirstViewStatesId(viewsProps[0].id);
            }
            setViewStates(tempViewStates);
        }
    }, [bounds, cameraPosition]);

    const [deckGLViews, setDeckGLViews] = useState<View[]>([]);
    useEffect(() => {
        setDeckGLViews(jsonToObject(viewsProps) as View[]);
    }, [viewsProps]);

    // update store if any of the layer prop is changed
    const dispatch = useDispatch();
    const st_layers = useSelector(
        (st: MapState) => st.spec["layers"]
    ) as Record<string, unknown>[];

    const [reportedBoundingBox, setReportedBoundingBox] =
        useState<BoundingBox>(bboxInitial);
    const [reportedBoundingBoxAcc, setReportedBoundingBoxAcc] =
        useState<BoundingBox>(bboxInitial);

    useEffect(() => {
        if (typeof triggerHome !== "undefined") {
            calcDefaultViewStates();
        }
    }, [triggerHome]);

    useEffect(() => {
        // If "bounds" or "cameraPosition" is not defined "viewState" will be
        // calculated based on the union of the reported bounding boxes from each layer.
        const isCameraPositionDefined =
            typeof cameraPosition !== "undefined" &&
            Object.keys(cameraPosition).length !== 0;
        if (!didUserChangeCamera && !isCameraPositionDefined) {
            calcDefaultViewStates();
        }
    }, [reportedBoundingBox]);

    // react on bounds prop change
    useEffect(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (cameraPosition && Object.keys(cameraPosition).length === 0) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => [
                    item.id,
                    getViewState(
                        boundsInitial,
                        views?.viewports[index].target,
                        views?.viewports[index].zoom,
                        deckRef.current?.deck
                    ),
                ])
            );
            if (viewsProps[0] !== undefined) {
                setFirstViewStatesId(viewsProps[0].id);
            }
            setViewStates(tempViewStates);
        }
    }, [bounds]);

    // react on cameraPosition prop change
    useEffect(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (cameraPosition && Object.keys(cameraPosition).length !== 0) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            );
            setViewStates(tempViewStates);
            if (viewsProps[0] !== undefined) {
                setFirstViewStatesId(viewsProps[0].id);
            }
        }
        if (cameraPosition === null) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, initialViewState])
            );
            setViewStates(tempViewStates);
        }
    }, [cameraPosition]);

    // Used for scaling in z direction using arrow keys.
    const [scaleZ, setScaleZ] = useState<number>(1);
    const [scaleZUp, setScaleZUp] = useState<number>(1);
    const [scaleZDown, setScaleZDown] = useState<number>(1);

    const scaleUpFunction = () => {
        setScaleZUp(Math.random());
    };

    const scaleDownFunction = () => {
        setScaleZDown(Math.random());
    };

    useEffect(() => {
        setScaleZ(scaleZ * 1.05);
    }, [scaleZUp]);

    useEffect(() => {
        setScaleZ(scaleZ * 0.95);
    }, [scaleZDown]);

    useEffect(() => {
        setViewsProps(
            getViews(
                views,
                scaleUpFunction,
                scaleDownFunction
            ) as ViewportType[]
        );
    }, [views]);

    useEffect(() => {
        if (st_layers == undefined || layers == undefined) return;

        const m = getModelMatrixScale(scaleZ);

        let layers_copy = cloneDeep(layers);
        layers_copy = layers_copy.map((layer) => {
            // Inject "setReportedBoundingBox" function into layer for it to report
            // back its respective bounding box.
            layer["setReportedBoundingBox"] = setReportedBoundingBox;

            // Set "modelLayer" matrix to reflect correct z scaling.
            if (layer["@@type"] !== "NorthArrow3DLayer") {
                layer["modelMatrix"] = m;
            }

            return layer;
        });

        const updated_layers = applyPropsOnLayers(st_layers, layers_copy);
        const layers_default = getLayersWithDefaultProps(updated_layers);
        const updated_spec = { layers: layers_default, views: views };
        dispatch(setSpec(updated_spec));
    }, [scaleZ, layers, dispatch]);

    const [deckGLLayers, setDeckGLLayers] = useState<LayersList>([]);
    useEffect(() => {
        if (deckGLLayers) {
            const wellsLayer = getLayersByType(
                deckGLLayers,
                "WellsLayer"
            )?.[0] as WellsLayer;
            if (wellsLayer) wellsLayer.setupLegend();
        }
    }, [deckGLLayers]);

    useEffect(() => {
        const layers = st_layers;
        if (!layers || layers.length == 0) return;

        const enumerations = [];
        if (resources) enumerations.push({ resources: resources });
        if (editedData) enumerations.push({ editedData: editedData });
        else enumerations.push({ editedData: {} });

        setDeckGLLayers(jsonToObject(layers, enumerations) as LayersList);
    }, [st_layers, resources, editedData]);

    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers;
        if (layers) {
            const wellslayer = getLayersByType(
                layers,
                "WellsLayer"
            )?.[0] as WellsLayer;

            wellslayer?.setSelection(selection?.well, selection?.selection);
        }
    }, [selection]);

    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers;
        if (layers) {
            const wellslayer = getLayersByType(
                layers,
                "WellsLayer"
            )?.[0] as WellsLayer;

            wellslayer?.setSelection(selection?.well, selection?.selection);
        }
    }, [selection]);

    // multiple well layers
    const [multipleWells, setMultipleWells] = useState<string[]>([]);
    const [selectedWell, setSelectedWell] = useState<string>("");
    const [shiftHeld, setShiftHeld] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function downHandler({ key }: any) {
        if (key === "Shift") {
            setShiftHeld(true);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function upHandler({ key }: any) {
        if (key === "Shift") {
            setShiftHeld(false);
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers;
        if (layers) {
            const wellslayer = getWellLayerByTypeAndSelectedWells(
                layers,
                "WellsLayer",
                selectedWell
            )?.[0] as WellsLayer;
            wellslayer?.setMultiSelection(multipleWells);
        }
    }, [multipleWells]);

    useEffect(() => {
        if (typeof triggerResetMultipleWells !== "undefined") {
            setMultipleWells([]);
        }
    }, [triggerResetMultipleWells]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<any>([]);
    const onHover = useCallback(
        (pickInfo, event) => {
            const infos = getPickingInfos(pickInfo, event);
            setHoverInfo(infos); //  for InfoCard pickInfos
            callOnMouseEvent?.("hover", infos, event);
        },
        [coords, onMouseEvent]
    );

    const onClick = useCallback(
        (pickInfo, event) => {
            const infos = getPickingInfos(pickInfo, event);
            callOnMouseEvent?.("click", infos, event);
        },
        [coords, onMouseEvent]
    );

    const getPickingInfos = (
        pickInfo: PickingInfo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: any
    ): PickingInfo[] => {
        if (coords?.multiPicking && pickInfo.layer?.context.deck) {
            const pickInfos = pickInfo.layer.context.deck.pickMultipleObjects({
                x: event.offsetCenter.x,
                y: event.offsetCenter.y,
                depth: coords.pickDepth ? coords.pickDepth : undefined,
            }) as LayerPickInfo[];
            pickInfos.forEach((item) => {
                if (item.properties) {
                    let unit = (
                        item.sourceLayer?.props
                            .data as unknown as FeatureCollection & {
                            unit: string;
                        }
                    )?.unit;
                    if (unit == undefined) unit = " ";
                    item.properties.forEach((element) => {
                        if (
                            element.name.includes("MD") ||
                            element.name.includes("TVD")
                        ) {
                            element.value =
                                Number(element.value).toFixed(2).toString() +
                                " " +
                                unit;
                        }
                    });
                }
            });
            return pickInfos;
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
            for (const info of infos as LayerPickInfo[]) {
                if (info.coordinate) {
                    ev.x = info.coordinate[0];
                    ev.y = info.coordinate[1];
                }
                //const layer_name = (info.layer?.props as ExtendedLayerProps<FeatureCollection>)?.name;
                if (info.layer && info.layer.id === "wells-layer") {
                    // info.object is Feature or WellLog;
                    {
                        // try to use Object info (see DeckGL getToolTip callback)
                        const feat = info.object as Feature;
                        const properties = feat?.properties;
                        if (properties) {
                            ev.wellname = properties["name"];
                            ev.wellcolor = properties["color"];
                        }
                    }

                    if (!ev.wellname)
                        if (info.object) {
                            ev.wellname = info.object.header?.["well"]; // object is WellLog
                        }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (info.properties) {
                        for (const property of info.properties) {
                            if (!ev.wellcolor) ev.wellcolor = property.color;
                            let propname = property.name;
                            if (propname) {
                                const sep = propname.indexOf(" ");
                                if (sep >= 0) {
                                    if (!ev.wellname) {
                                        ev.wellname = propname.substring(
                                            sep + 1
                                        );
                                    }
                                    propname = propname.substring(0, sep);
                                }
                            }
                            const names_md = [
                                "DEPTH",
                                "DEPT",
                                "MD" /*Measured Depth*/,
                                "TDEP" /*"Tool DEPth"*/,
                                "MD_RKB" /*Rotary Relly Bushing*/,
                            ]; // aliases for MD
                            const names_tvd = [
                                "TVD" /*True Vertical Depth*/,
                                "TVDSS" /*SubSea*/,
                                "DVER" /*"VERtical Depth"*/,
                                "TVD_MSL" /*below Mean Sea Level*/,
                            ]; // aliases for MD

                            if (names_md.find((name) => name == propname))
                                ev.md = parseFloat(property.value as string);
                            else if (names_tvd.find((name) => name == propname))
                                ev.tvd = parseFloat(property.value as string);

                            if (
                                ev.md !== undefined &&
                                ev.tvd !== undefined &&
                                ev.wellname !== undefined
                            )
                                break;
                        }
                    }
                    break;
                }
            }
            onMouseEvent(ev);
        }
    };

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const onAfterRender = useCallback(() => {
        if (deckGLLayers) {
            const state = deckGLLayers.every(
                (layer) => (layer as Layer).isLoaded
            );
            setIsLoaded(state);
        }
    }, [deckGLLayers]);

    // validate layers data
    const [errorText, setErrorText] = useState<string>();
    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers as Layer[];
        // this ensures to validate the schemas only once
        if (checkDatafileSchema && layers && isLoaded) {
            try {
                validateLayers(layers);
                colorTables && validateColorTables(colorTables);
            } catch (e) {
                setErrorText(String(e));
            }
        } else setErrorText(undefined);
    }, [checkDatafileSchema, deckRef.current?.deck?.props.layers, isLoaded]);

    const layerFilter = useCallback(
        (args: { layer: Layer; viewport: Viewport }): boolean => {
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

    const [didUserChangeCamera, setDidUserChangeCamera] =
        useState<boolean>(false);
    const onViewStateChange = useCallback(
        ({ viewId, viewState }) => {
            const isSyncIds = viewsProps
                .filter((item) => item.isSync)
                .map((item) => item.id);
            if (isSyncIds.includes(viewId)) {
                let tempViewStates: Record<string, ViewStateType> = {};
                tempViewStates = Object.fromEntries(
                    viewsProps
                        .filter((item) => item.isSync)
                        .map((item) => [item.id, viewState])
                );
                setViewStates((currentViewStates) => ({
                    ...currentViewStates,
                    ...tempViewStates,
                }));
            } else {
                setViewStates((currentViewStates) => ({
                    ...currentViewStates,
                    [viewId]: viewState,
                }));
            }
            if (getCameraPosition) {
                getCameraPosition(viewState);
            }
            setFirstViewStatesId(viewsProps[0].id);
            setDidUserChangeCamera(true);
        },
        [viewStates]
    );
    if (!deckGLViews || isEmpty(deckGLViews) || isEmpty(deckGLLayers))
        return null;
    return (
        <div onContextMenu={(event) => event.preventDefault()}>
            <DeckGL
                id={id}
                viewState={viewStates}
                views={deckGLViews}
                layerFilter={layerFilter}
                layers={deckGLLayers}
                // @ts-expect-error this prop doesn't exists directly on DeckGL, but on Deck.Context
                userData={{
                    setEditedData: (updated_prop: Record<string, unknown>) => {
                        setSelectedWell(updated_prop["selectedWell"] as string);
                        if (
                            Object.keys(updated_prop).includes("selectedWell")
                        ) {
                            if (shiftHeld) {
                                if (
                                    multipleWells.includes(
                                        updated_prop["selectedWell"] as string
                                    )
                                ) {
                                    const temp = multipleWells.filter(
                                        (item) =>
                                            item !==
                                            updated_prop["selectedWell"]
                                    );
                                    setMultipleWells(temp);
                                } else {
                                    const temp = multipleWells.concat(
                                        updated_prop["selectedWell"] as string
                                    );
                                    setMultipleWells(temp);
                                }
                            } else {
                                setMultipleWells([]);
                            }
                        }
                        setEditedData?.(updated_prop);
                    },
                    colorTables: colorTables,
                }}
                getCursor={({ isDragging }): string =>
                    isDragging ? "grabbing" : "default"
                }
                getTooltip={getTooltip}
                ref={deckRef}
                onViewStateChange={onViewStateChange}
                onHover={onHover}
                onClick={onClick}
                onLoad={onLoad}
                onAfterRender={onAfterRender}
            >
                {children}
                {views?.viewports &&
                    views.viewports.map((view, index) => (
                        // @ts-expect-error This is demonstrated to work with js, but with ts it gives error
                        <View
                            key={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                            id={`${view.id}_${view.show3D ? "3D" : "2D"}`}
                        >
                            {legend?.visible && (
                                <ColorLegends
                                    {...legend}
                                    layers={
                                        getLayersInViewport(
                                            deckGLLayers,
                                            view.layerIds
                                        ) as ExtendedLayer<unknown>[]
                                    }
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
                        </View>
                    ))}
            </DeckGL>
            {scale?.visible ? (
                <DistanceScale
                    {...scale}
                    zoom={
                        viewStates[firstViewStateId] === undefined
                            ? -5
                            : viewStates[firstViewStateId].zoom
                    }
                    scaleUnit={coordinateUnit}
                    style={scale.cssStyle ?? {}}
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
    data: Record<string, unknown>[] | LayerProps[],
    enums: Record<string, unknown>[] | undefined = undefined
): LayersList | View[] {
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
    const filtered_data = data.filter(
        (value) => Object.keys(value).length !== 0
    );
    return jsonConverter.convert(filtered_data);
}

// return viewstate with computed bounds to fit the data in viewport
function getViewState(
    bounds_accessor: [number, number, number, number] | BoundsAccessor,
    target?: number[],
    zoom?: number,
    deck?: Deck
): ViewStateType {
    let bounds = [0, 0, 1, 1];
    if (typeof bounds_accessor == "function") {
        bounds = bounds_accessor();
    } else {
        bounds = bounds_accessor;
    }

    let width = bounds[2] - bounds[0]; // right - left
    let height = bounds[3] - bounds[1]; // top - bottom
    if (deck) {
        width = deck.width;
        height = deck.height;
    }
    const fitted_bound = fitBounds({ width, height, bounds });
    const view_state: ViewStateType = {
        target: target ?? [fitted_bound.x, fitted_bound.y, 0],
        zoom: zoom ?? fitted_bound.zoom,
        rotationX: 90, // look down z -axis
        rotationOrbit: 0,
    };
    return view_state;
}

///////////////////////////////////////////////////////////////////////////////////////////
// return viewstate with computed bounds to fit the data in viewport
function getViewState3D(
    is3D: boolean,
    bounds: [number, number, number, number, number, number],
    zoom?: number,
    deck?: Deck
): ViewStateType {
    const xMin = bounds[0];
    const yMin = bounds[1];
    const zMin = bounds[2];

    const xMax = bounds[3];
    const yMax = bounds[4];
    const zMax = bounds[5];

    let width = xMax - xMin;
    let height = yMax - yMin;
    if (deck) {
        width = deck.width;
        height = deck.height;
    }

    const target = [
        xMin + (xMax - xMin) / 2,
        yMin + (yMax - yMin) / 2,
        is3D ? zMin + (zMax - zMin) / 2 : 0,
    ];
    const bounds2D = [xMin, yMin, xMax, yMax];
    const fitted_bound = fitBounds({
        width,
        height,
        bounds: bounds2D,
    });
    const view_state: ViewStateType = {
        target,
        zoom: zoom ?? fitted_bound.zoom * 1.2,
        rotationX: 45, // look down z -axis at 45 degrees
        rotationOrbit: 0,
    };
    return view_state;
}

// construct views object for DeckGL component
function getViews(
    views: ViewsType | undefined,
    scaleUpFunction: { (): void; (): void },
    scaleDownFunction: { (): void; (): void }
): ViewportType[] {
    // Use modified controller to handle key events.
    class ZScaleOrbitController extends OrbitController {
        handleEvent(event: MjolnirEvent): boolean {
            if (event.type === "keydown" && event.key === "ArrowUp") {
                scaleUpFunction();
                return true;
            } else if (event.type === "keydown" && event.key === "ArrowDown") {
                scaleDownFunction();
                return true;
            }

            return super.handleEvent(event);
        }
    }

    const deckgl_views = [];
    // if props for multiple viewport are not proper, return 2d view
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
            far: 99999,
            near: -99999,
            isSync: false,
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

                const cur_viewport: ViewportType =
                    views.viewports[deckgl_views.length];

                const view_type: string = cur_viewport.show3D
                    ? "OrbitView"
                    : cur_viewport.id === "intersection_view"
                    ? "IntersectionView"
                    : "OrthographicView";
                const id_suffix = cur_viewport.show3D ? "_3D" : "_2D";
                const view_id: string = cur_viewport.id + id_suffix;

                const far = 99999;
                const near = cur_viewport.show3D ? 0.01 : -99999;

                deckgl_views.push({
                    "@@type": view_type,
                    id: view_id,
                    controller: {
                        type: cur_viewport.show3D
                            ? ZScaleOrbitController
                            : OrthographicController,
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
                    isSync: views.viewports[deckgl_views.length].isSync,
                });
                xPos = xPos + 99.5 / nX;
            }
            yPos = yPos + 99.5 / nY;
        }
    }
    return deckgl_views;
}
