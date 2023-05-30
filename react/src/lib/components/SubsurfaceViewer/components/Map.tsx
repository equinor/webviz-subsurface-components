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
    OrthographicView,
    OrbitView,
} from "@deck.gl/core/typed";
import { Feature, FeatureCollection } from "geojson";
import React, { useEffect, useState, useCallback, useRef } from "react";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "./DistanceScale";
import StatusIndicator from "./StatusIndicator";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import fitBounds from "../utils/fit-bounds";
import {
    validateColorTables,
    validateLayers,
} from "../../../inputSchema/schemaValidationUtil";
import { LayerPickInfo } from "../layers/utils/layerTools";
import { getLayersByType } from "../layers/utils/layerTools";
import { getWellLayerByTypeAndSelectedWells } from "../layers/utils/layerTools";
import { WellsLayer, Axes2DLayer, NorthArrow3DLayer } from "../layers";

import { isEmpty, isEqual } from "lodash";
import { cloneDeep } from "lodash";

import { colorTables } from "@emerson-eps/color-tables";
import { getModelMatrixScale } from "../layers/utils/layerTools";
import { OrbitController, OrthographicController } from "@deck.gl/core/typed";
import { MjolnirEvent, MjolnirPointerEvent } from "mjolnir.js";
import IntersectionView from "../views/intersectionView";
import { Unit } from "convert-units";

type BoundingBox = [number, number, number, number, number, number];
type NumberQuad = [number, number, number, number];

function addBoundingBoxes(b1: BoundingBox, b2: BoundingBox): BoundingBox {
    const boxDefault: BoundingBox = [0, 0, 0, 1, 1, 1];

    if (typeof b1 === "undefined" || typeof b2 === "undefined") {
        return boxDefault;
    }

    if (isEqual(b1, boxDefault)) {
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

interface marginsType {
    left: number;
    right: number;
    top: number;
    bottom: number;
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
    layers?: LayersList;

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

    coordinateUnit?: Unit;

    /**
     * Parameters to control toolbar
     */
    toolbar?: {
        visible?: boolean | null;
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
     * Validate JSON datafile against schema
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
    cameraPosition?: ViewStateType;
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

function adjustCameraTarget(
    viewStates: Record<string, ViewStateType>,
    scale: number,
    newScale: number
): Record<string, ViewStateType> {
    const vs = cloneDeep(viewStates);
    for (const key in vs) {
        if (typeof vs[key].target !== "undefined") {
            const t = vs[key].target;
            const z = newScale * (t[2] / scale);
            vs[key].target = [t[0], t[1], z];
        }
    }
    return vs;
}

const Map: React.FC<MapProps> = ({
    id,
    layers,
    bounds,
    views,
    coords,
    scale,
    coordinateUnit,
    colorTables,
    setEditedData,
    checkDatafileSchema,
    onMouseEvent,
    selection,
    children,
    getTooltip = defaultTooltip,
    cameraPosition,
    getCameraPosition,
    triggerHome,
    triggerResetMultipleWells,
}: MapProps) => {
    const isCameraPositionDefined =
        typeof cameraPosition !== "undefined" &&
        Object.keys(cameraPosition).length !== 0;

    const deckRef = useRef<DeckGLRef>(null);

    const bboxInitial: BoundingBox = [0, 0, 0, 1, 1, 1];

    const boundsInitial = React.useMemo(
        () => bounds ?? ([0, 0, 1, 1] as NumberQuad),
        [bounds]
    );

    // state for views prop of DeckGL component
    const [viewsProps, setViewsProps] = useState<ViewportType[]>([]);
    const [alteredLayers, setAlteredLayers] = useState<LayersList>([]);

    const [viewPortMargins, setViewPortMargins] = useState<marginsType>({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    });

    const [didUserChangeCamera, setDidUserChangeCamera] =
        useState<boolean>(false);

    const [reportedBoundingBox, setReportedBoundingBox] =
        useState<BoundingBox>(bboxInitial);
    const [reportedBoundingBoxAcc, setReportedBoundingBoxAcc] =
        useState<BoundingBox>(bboxInitial);

    const initialViewState = getViewState(
        viewPortMargins,
        boundsInitial,
        boundingBoxCenter(reportedBoundingBoxAcc),
        views?.viewports?.[0].target,
        views?.viewports?.[0].zoom,
        deckRef.current?.deck
    );

    // Local help function.
    const calcDefaultViewStates = useCallback(
        (boundingBox: BoundingBox, input?: ViewportType[]) => {
            const center = boundingBoxCenter(
                boundingBox // note this may include axesLayer
            );

            const updatedViewProps = input ? input : viewsProps;

            const isBoundsDefined = typeof bounds !== "undefined";
            const viewStateMap = updatedViewProps.map((item, index) => {
                const is3D = views?.viewports?.[index]?.show3D ?? false;

                const viewState = isBoundsDefined
                    ? getViewState(
                          viewPortMargins,
                          boundsInitial,
                          center,
                          views?.viewports?.[index].target,
                          views?.viewports?.[index].zoom,
                          deckRef.current?.deck
                      )
                    : getViewState3D(
                          is3D,
                          boundingBox,
                          views?.viewports?.[index].zoom,
                          deckRef.current?.deck
                      );

                const minZoom = is3D ? -12 : -12;
                const maxZoom = is3D ? +12 : +4;

                return [item.id, { ...viewState, minZoom, maxZoom }];
            });

            const tempViewStates = Object.fromEntries(viewStateMap);

            setDidUserChangeCamera(false);
            setViewStates(tempViewStates);
        },

        [bounds, boundsInitial, viewPortMargins, views?.viewports, viewsProps]
    );

    // set initial view state based on supplied bounds and zoom in viewState
    const [viewStates, setViewStates] = useState<Record<string, ViewStateType>>(
        {
            "main-view_2D": cameraPosition ?? ({} as ViewStateType),
        }
    );
    const [firstViewStateId, setFirstViewStatesId] =
        useState<string>("main-view_2D");

    useEffect(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (isCameraPositionDefined) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            ) as unknown as Record<string, ViewStateType>;
        } else {
            const isBoundsDefined = typeof bounds !== "undefined";

            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => {
                    let viewState = viewStates[item.id];
                    if (typeof viewState === "undefined") {
                        viewState = isBoundsDefined
                            ? getViewState(
                                  viewPortMargins,
                                  boundsInitial,
                                  boundingBoxCenter(reportedBoundingBoxAcc),
                                  views?.viewports?.[index].target,
                                  views?.viewports?.[index].zoom,
                                  deckRef.current?.deck
                              )
                            : getViewState3D(
                                  views?.viewports?.[index]?.show3D ?? false,
                                  reportedBoundingBoxAcc,
                                  views?.viewports?.[index].zoom,
                                  deckRef.current?.deck
                              );
                    }

                    return [item.id, viewState];
                })
            );
        }
        if (viewsProps[0] !== undefined) {
            setFirstViewStatesId(viewsProps[0].id);
        }
        setViewStates(tempViewStates);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        boundsInitial,
        cameraPosition,
        isCameraPositionDefined,
        viewPortMargins,
        views?.viewports,
        viewsProps,
    ]);

    // calculate view state on deckgl context load (based on viewport size)
    const onLoad = useCallback(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (isCameraPositionDefined) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            ) as unknown as Record<string, ViewStateType>;
        } else {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => [
                    item.id,
                    getViewState(
                        viewPortMargins,
                        boundsInitial,
                        boundingBoxCenter(reportedBoundingBoxAcc),
                        views?.viewports?.[index].target,
                        views?.viewports?.[index].zoom,
                        deckRef.current?.deck
                    ),
                ])
            );
            if (viewsProps[0] !== undefined) {
                setFirstViewStatesId(viewsProps[0].id);
            }
            setViewStates(tempViewStates);
        }
    }, [
        isCameraPositionDefined,
        viewsProps,
        cameraPosition,
        viewPortMargins,
        boundsInitial,
        reportedBoundingBoxAcc,
        views?.viewports,
    ]);

    useEffect(() => {
        if (typeof triggerHome !== "undefined") {
            calcDefaultViewStates(reportedBoundingBoxAcc);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerHome]);

    useEffect(() => {
        const union_of_reported_bboxes = addBoundingBoxes(
            reportedBoundingBoxAcc,
            reportedBoundingBox
        );
        setReportedBoundingBoxAcc(union_of_reported_bboxes);

        // If "bounds" or "cameraPosition" is not defined "viewState" will be
        // calculated based on the union of the reported bounding boxes from each layer.
        if (!didUserChangeCamera && !isCameraPositionDefined) {
            calcDefaultViewStates(union_of_reported_bboxes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportedBoundingBox]);

    // react on bounds prop change
    useEffect(() => {
        const isBoundsDefined = typeof bounds !== "undefined";

        let tempViewStates: Record<string, ViewStateType> = {};
        if (!isCameraPositionDefined) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item, index) => [
                    item.id,
                    isBoundsDefined
                        ? getViewState(
                              viewPortMargins,
                              boundsInitial,
                              boundingBoxCenter(reportedBoundingBoxAcc),
                              views?.viewports?.[index].target,
                              views?.viewports?.[index].zoom,
                              deckRef.current?.deck
                          )
                        : getViewState3D(
                              views?.viewports?.[index]?.show3D ?? false,
                              reportedBoundingBoxAcc,
                              views?.viewports?.[index].zoom,
                              deckRef.current?.deck
                          ),
                ])
            );
            if (viewsProps[0] !== undefined) {
                setFirstViewStatesId(viewsProps[0].id);
            }
            setViewStates(tempViewStates);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boundsInitial, cameraPosition, views?.viewports, viewsProps]);

    // react on cameraPosition prop change
    useEffect(() => {
        let tempViewStates: Record<string, ViewStateType> = {};
        if (isCameraPositionDefined) {
            tempViewStates = Object.fromEntries(
                viewsProps.map((item) => [item.id, cameraPosition])
            ) as unknown as Record<string, ViewStateType>;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraPosition, viewsProps]);

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
        const newScaleZ = scaleZ * 1.05;
        setScaleZ(newScaleZ);
        // Make camera target follow the scaling.
        const vs = adjustCameraTarget(viewStates, scaleZ, newScaleZ);
        setViewStates(vs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scaleZUp]);

    useEffect(() => {
        const newScaleZ = scaleZ * 0.95;
        setScaleZ(newScaleZ);
        // Make camera target follow the scaling.
        const vs = adjustCameraTarget(viewStates, scaleZ, newScaleZ);
        setViewStates(vs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scaleZDown]);

    useEffect(() => {
        const viewProps = getViews(views) as ViewportType[];

        setViewsProps(viewProps);

        if (!bounds) {
            calcDefaultViewStates(reportedBoundingBoxAcc);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [views]);

    useEffect(() => {
        if (layers == undefined) return;

        // Margins on the viewport are extracted from a potenial axes2D layer.
        const axes2DLayer = layers?.find((e) => {
            return e?.constructor === Axes2DLayer;
        }) as Axes2DLayer;

        const left =
            axes2DLayer && axes2DLayer.props.isLeftRuler
                ? axes2DLayer.props.marginH
                : 0;
        const right =
            axes2DLayer && axes2DLayer.props.isRightRuler
                ? axes2DLayer.props.marginH
                : 0;
        const top =
            axes2DLayer && axes2DLayer.props.isTopRuler
                ? axes2DLayer.props.marginV
                : 0;
        const bottom =
            axes2DLayer && axes2DLayer.props.isBottomRuler
                ? axes2DLayer.props.marginV
                : 0;

        setViewPortMargins({ left, right, top, bottom });

        const m = getModelMatrixScale(scaleZ);

        const layers_copy = layers.map((item) => {
            if (item?.constructor.name === NorthArrow3DLayer.name) return item;

            const layer = item as Layer;

            // Set "modelLayer" matrix to reflect correct z scaling.
            const scaledLayer = layer.clone({ modelMatrix: m });

            // Inject "setReportedBoundingBox" function into layer for it to report
            // back its respective bounding box.
            const boundedLayer = scaledLayer.clone({
                setReportedBoundingBox: setReportedBoundingBox,
            });

            return boundedLayer ?? scaledLayer;
        });

        setAlteredLayers(layers_copy);
    }, [scaleZ, layers /*dispatch*/]);

    const [deckGLLayers, setDeckGLLayers] = useState<LayersList>([]);

    useEffect(() => {
        setDeckGLLayers(alteredLayers);
    }, [alteredLayers]);

    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers;
        if (layers) {
            const wellslayer = getLayersByType(
                layers,
                WellsLayer.name
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
    }, [multipleWells, selectedWell]);

    useEffect(() => {
        if (typeof triggerResetMultipleWells !== "undefined") {
            setMultipleWells([]);
        }
    }, [triggerResetMultipleWells]);

    const getPickingInfos = useCallback(
        (
            pickInfo: PickingInfo,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: any
        ): PickingInfo[] => {
            if (coords?.multiPicking && pickInfo.layer?.context.deck) {
                const pickInfos =
                    pickInfo.layer.context.deck.pickMultipleObjects({
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
                                    Number(element.value)
                                        .toFixed(2)
                                        .toString() +
                                    " " +
                                    unit;
                            }
                        });
                    }
                });
                return pickInfos;
            }
            return [pickInfo];
        },
        [coords?.multiPicking, coords?.pickDepth]
    );

    /**
     * call onMouseEvent callback
     */
    const callOnMouseEvent = useCallback(
        (
            type: "click" | "hover",
            infos: PickingInfo[],
            event: MjolnirEvent
        ): void => {
            if (!onMouseEvent) return;
            const ev = handleMouseEvent(type, infos, event);
            onMouseEvent(ev);
        },
        [onMouseEvent]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<any>([]);
    const onHover = useCallback(
        (pickInfo: PickingInfo, event: MjolnirEvent) => {
            const infos = getPickingInfos(pickInfo, event);
            setHoverInfo(infos); //  for InfoCard pickInfos
            callOnMouseEvent?.("hover", infos, event);
        },
        [callOnMouseEvent, getPickingInfos]
    );

    const onClick = useCallback(
        (pickInfo: PickingInfo, event: MjolnirEvent) => {
            const infos = getPickingInfos(pickInfo, event);
            callOnMouseEvent?.("click", infos, event);
        },
        [callOnMouseEvent, getPickingInfos]
    );

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
    }, [
        checkDatafileSchema,
        colorTables,
        deckRef?.current?.deck?.props.layers,
        isLoaded,
    ]);

    const layerFilter = useCallback(
        (args: { layer: Layer; viewport: Viewport }): boolean => {
            // display all the layers if views are not specified correctly
            if (!views || !views.viewports || !views.layout) return true;

            const cur_view = views.viewports.find(
                ({ id }) => args.viewport.id && id === args.viewport.id
            );
            if (cur_view?.layerIds && cur_view.layerIds.length > 0) {
                const layer_ids = cur_view.layerIds;
                return layer_ids.some((layer_id) => {
                    const t = layer_id === args.layer.id;
                    return t;
                });
            } else {
                return true;
            }
        },
        [views]
    );

    const onViewStateChange = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ viewId, viewState }: { viewId: string; viewState: any }) => {
            const viewports = views?.viewports || [];
            const isSyncIds = viewports
                .filter((item) => item.isSync)
                .map((item) => item.id);
            if (isSyncIds?.includes(viewId)) {
                const viewStateTable = views?.viewports
                    .filter((item) => item.isSync)
                    .map((item) => [item.id, viewState]);
                const tempViewStates = Object.fromEntries(viewStateTable ?? []);
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
            setFirstViewStatesId(viewsProps[0]?.id);
            setDidUserChangeCamera(true);
        },
        [getCameraPosition, views?.viewports, viewsProps]
    );

    const deckGLViews = React.useMemo(() => {
        return createViews(views, scaleUpFunction, scaleDownFunction);
    }, [views]);

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
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
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
export function jsonToObject(
    data: Record<string, unknown>[] | LayerProps[],
    enums: Record<string, unknown>[] | undefined = undefined
): LayersList | View[] {
    if (!data) return [];

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
    viewPortMargins: marginsType,
    bounds_accessor: [number, number, number, number] | BoundsAccessor,
    centerOfData: [number, number, number],
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

    let w = bounds[2] - bounds[0]; // right - left
    let h = bounds[3] - bounds[1]; // top - bottom

    const z = centerOfData[2];

    const fb = fitBounds({ width: w, height: h, bounds });
    let fb_target = [fb.x, fb.y, z];
    let fb_zoom = fb.zoom;

    if (deck) {
        // If there are margins in the viewport (axes2DLayer) we have to account for that.
        // Camera target should be in the middle of viewport minus the margins.
        const w_bounds = w;
        const h_bounds = h;

        const ml = viewPortMargins.left;
        const mr = viewPortMargins.right;
        const mb = viewPortMargins.bottom;
        const mt = viewPortMargins.top;

        // Subtract margins.
        const marginH = (ml > 0 ? ml : 0) + (mr > 0 ? mr : 0);
        const marginV = (mb > 0 ? mb : 0) + (mt > 0 ? mt : 0);
        w = deck.width - marginH; // width of the viewport minus margin.
        h = deck.height - marginV;

        const port_aspect = h / w;
        const bounds_aspect = h_bounds / w_bounds;

        const m_pr_pixel =
            bounds_aspect > port_aspect ? h_bounds / h : w_bounds / w;

        let translate_x = 0;
        if (ml > 0 && mr === 0) {
            // left margin and no right margin
            translate_x = 0.5 * ml * m_pr_pixel;
        } else if (ml === 0 && mr > 0) {
            // no left margin but  right margin
            translate_x = -0.5 * mr * m_pr_pixel;
        }

        let translate_y = 0;
        if (mb > 0 && mt === 0) {
            translate_y = 0.5 * mb * m_pr_pixel;
        } else if (mb === 0 && mt > 0) {
            translate_y = -0.5 * mt * m_pr_pixel;
        }

        const fb = fitBounds({ width: w, height: h, bounds });
        fb_target = [fb.x - translate_x, fb.y - translate_y, z];
        fb_zoom = fb.zoom;
    }

    const target_ = target ?? fb_target;
    const zoom_ = zoom ?? fb_zoom;

    const view_state: ViewStateType = {
        target: target_,
        zoom: zoom_,
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
function createViews(
    views: ViewsType | undefined,
    scaleUpFunction: { (): void; (): void },
    scaleDownFunction: { (): void; (): void }
): View[] {
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
    const deckgl_views: View[] = [];

    // if props for multiple viewport are not proper, return 2d view
    if (!views || !views.viewports || !views.layout) {
        deckgl_views.push(
            new OrthographicView({
                id: "main",
                controller: { doubleClickZoom: false },
                x: "0%",
                y: "0%",
                width: "100%",
                height: "100%",
                flipY: false,
                far: +99999,
                near: -99999,
            })
        );
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

                const currentViewport: ViewportType =
                    views.viewports[deckgl_views.length];

                const ViewType = currentViewport.show3D
                    ? OrbitView
                    : currentViewport.id === "intersection_view"
                    ? IntersectionView
                    : OrthographicView;

                const far = 9999;
                const near = currentViewport.show3D ? 0.1 : -9999;

                const Controller = currentViewport.show3D
                    ? ZScaleOrbitController
                    : OrthographicController;

                const controller = {
                    type: Controller,
                    doubleClickZoom: false,
                };

                deckgl_views.push(
                    new ViewType({
                        id: currentViewport.id,
                        controller: controller,
                        x: xPos + "%",
                        y: yPos + "%",

                        // Using 99.5% of viewport to avoid flickering of deckgl canvas
                        width: 99.5 / nX + "%",
                        height: 99.5 / nY + "%",
                        flipY: false,
                        far,
                        near,
                    })
                );
                xPos = xPos + 99.5 / nX;
            }
            yPos = yPos + 99.5 / nY;
        }
    }
    return deckgl_views;
}

// construct views object for DeckGL component
function getViews(views: ViewsType | undefined): ViewportType[] {
    const deckgl_views = [];

    // if props for multiple viewport are not proper, return 2d view
    if (!views || !views.viewports || !views.layout) {
        deckgl_views.push({
            id: "main",
        });
    } else {
        const [nY, nX] = views.layout;
        for (let y = 1; y <= nY; y++) {
            for (let x = 1; x <= nX; x++) {
                if (
                    views.viewports == undefined ||
                    deckgl_views.length >= views.viewports.length
                )
                    return deckgl_views;

                const cur_viewport: ViewportType =
                    views.viewports[deckgl_views.length];

                deckgl_views.push({
                    id: cur_viewport.id,
                });
            }
        }
    }
    return deckgl_views;
}

function handleMouseEvent(
    type: "click" | "hover",
    infos: PickingInfo[],
    event: MjolnirEvent
) {
    const ev: MapMouseEvent = {
        type: type,
        infos: infos,
    };
    if (ev.type === "click") {
        if ((event as MjolnirPointerEvent).rightButton) ev.type = "contextmenu";
    }
    for (const info of infos as LayerPickInfo[]) {
        if (info.coordinate) {
            ev.x = info.coordinate[0];
            ev.y = info.coordinate[1];
        }
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
                                ev.wellname = propname.substring(sep + 1);
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
    return ev;
}
