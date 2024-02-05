/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useMemo } from "react";

import type { Feature, FeatureCollection } from "geojson";
import { cloneDeep, isEmpty, isEqual } from "lodash";

import type {
    MjolnirEvent,
    MjolnirGestureEvent,
    MjolnirPointerEvent,
} from "mjolnir.js";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json/typed";

import type { DeckGLRef } from "@deck.gl/react/typed";
import DeckGL from "@deck.gl/react/typed";
import type {
    Color,
    Layer,
    LayersList,
    LayerProps,
    LayerContext,
    View,
    Viewport,
    PickingInfo,
} from "@deck.gl/core/typed";
import {
    _CameraLight as CameraLight,
    AmbientLight,
    DirectionalLight,
    LightingEffect,
    OrbitController,
    OrbitView,
    OrthographicController,
    OrthographicView,
    PointLight,
} from "@deck.gl/core/typed";
import { LineLayer } from "@deck.gl/layers/typed";

import { Matrix4 } from "@math.gl/core";
import { fovyToAltitude } from "@math.gl/web-mercator";

import { colorTables } from "@emerson-eps/color-tables";
import type { colorTablesArray } from "@emerson-eps/color-tables/";

import type { BoundingBox3D } from "../utils/BoundingBox3D";
import { boxCenter, boxUnion } from "../utils/BoundingBox3D";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import type { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "./DistanceScale";
import StatusIndicator from "./StatusIndicator";
import fitBounds from "../utils/fit-bounds";
import { validateColorTables, validateLayers } from "@webviz/wsc-common";
import type { LayerPickInfo } from "../layers/utils/layerTools";
import {
    getModelMatrixScale,
    getLayersByType,
    getWellLayerByTypeAndSelectedWells,
} from "../layers/utils/layerTools";
import { WellsLayer, Axes2DLayer, NorthArrow3DLayer } from "../layers";

import IntersectionView from "../views/intersectionView";
import type { Unit } from "convert-units";
import type { LightsType } from "../SubsurfaceViewer";

/**
 * 3D bounding box defined as [xmin, ymin, zmin, xmax, ymax, zmax].
 */
export type { BoundingBox3D };
/**
 * 2D bounding box defined as [left, bottom, right, top]
 */
export type BoundingBox2D = [number, number, number, number];
/**
 * Type of the function returning coordinate boundary for the view defined as [left, bottom, right, top].
 */
export type BoundsAccessor = () => BoundingBox2D;

type Size = {
    width: number;
    height: number;
};

const minZoom3D = -12;
const maxZoom3D = 12;
const minZoom2D = -12;
const maxZoom2D = 4;

// https://developer.mozilla.org/docs/Web/API/KeyboardEvent
type ArrowEvent = {
    key: "ArrowUp" | "ArrowDown" | "PageUp" | "PageDown";
    shiftModifier: boolean;
    // altModifier: boolean;
    // ctrlModifier: boolean;
};

function updateZScaleReducer(zScale: number, action: ArrowEvent): number {
    return zScale * getZScaleModifier(action);
}

function getZScaleModifier(arrowEvent: ArrowEvent): number {
    let scaleFactor = 0;
    switch (arrowEvent.key) {
        case "ArrowUp":
            scaleFactor = 0.05;
            break;
        case "ArrowDown":
            scaleFactor = -0.05;
            break;
        case "PageUp":
            scaleFactor = 0.25;
            break;
        case "PageDown":
            scaleFactor = -0.25;
            break;
        default:
            break;
    }
    if (arrowEvent.shiftModifier) {
        scaleFactor /= 5;
    }
    return 1 + scaleFactor;
}

function convertToArrowEvent(event: KeyboardEvent): ArrowEvent | null {
    if (event.type === "keydown") {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "PageUp":
            case "PageDown":
                return {
                    key: event.key,
                    shiftModifier: event.shiftKey,
                };
            default:
                return null;
        }
    }
    return null;
}

function parseLights(lights?: LightsType): LightingEffect[] | undefined {
    if (!lights) {
        return undefined;
    }

    const effects = [];
    let lightsObj = {};

    if (lights.headLight) {
        const headLight = new CameraLight({
            intensity: lights.headLight.intensity,
            color: lights.headLight.color ?? [255, 255, 255],
        });
        lightsObj = { ...lightsObj, headLight };
    }

    if (lights.ambientLight) {
        const ambientLight = new AmbientLight({
            intensity: lights.ambientLight.intensity,
            color: lights.ambientLight.color ?? [255, 255, 255],
        });
        lightsObj = { ...lightsObj, ambientLight };
    }

    if (lights.pointLights) {
        for (const light of lights.pointLights) {
            const pointLight = new PointLight({
                ...light,
                color: light.color ?? [255, 255, 255],
            });
            lightsObj = { ...lightsObj, pointLight };
        }
    }

    if (lights.directionalLights) {
        for (const light of lights.directionalLights) {
            const directionalLight = new DirectionalLight({
                ...light,
                color: light.color ?? [255, 255, 255],
            });
            lightsObj = { ...lightsObj, directionalLight };
        }
    }

    const lightingEffect = new LightingEffect(lightsObj);
    effects.push(lightingEffect);

    return effects;
}

export type ReportBoundingBoxAction = { layerBoundingBox: BoundingBox3D };
function mapBoundingBoxReducer(
    mapBoundingBox: BoundingBox3D | undefined,
    action: ReportBoundingBoxAction
): BoundingBox3D | undefined {
    const union = boxUnion(mapBoundingBox, action.layerBoundingBox);
    return isEqual(union, mapBoundingBox) ? mapBoundingBox : union;
}

export type TooltipCallback = (
    info: PickingInfo
) => string | Record<string, unknown> | null;

/**
 * Views
 */
export interface ViewsType {
    /**
     * Layout for viewport in specified as [row, column].
     */
    layout: [number, number];

    /**
     * Number of pixels used for the margin in matrix mode.
     * Defaults to 0.
     */
    marginPixels?: number;

    /**
     * Show views label.
     */
    showLabel?: boolean;

    /**
     * Layers configuration for multiple viewports.
     */
    viewports: ViewportType[];
}

/**
 * Viewport type.
 */
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

/**
 * Camera view state.
 */
export interface ViewStateType {
    target: number[];
    zoom: number | BoundingBox3D | undefined;
    rotationX: number;
    rotationOrbit: number;
    minZoom?: number;
    maxZoom?: number;
    transitionDuration?: number;
}

interface MarginsType {
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

export type EventCallback = (event: MapMouseEvent) => void;

export function useHoverInfo(): [PickingInfo[], EventCallback] {
    const [hoverInfo, setHoverInfo] = useState<PickingInfo[]>([]);
    const callback = useCallback((pickEvent: MapMouseEvent) => {
        setHoverInfo(pickEvent.infos);
    }, []);
    return [hoverInfo, callback];
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
    layers?: LayersList;

    /**
     * Coordinate boundary for the view defined as [left, bottom, right, top].
     * Should be used for 2D view only.
     */
    bounds?: BoundingBox2D | BoundsAccessor;

    /**
     * Camera state for the view defined as a ViewStateType.
     * Should be used for 3D view only.
     * If the zoom is given as a 3D bounding box, the camera state is computed to
     * display the full box.
     */
    cameraPosition?: ViewStateType;

    /**
     * If changed will reset view settings (bounds or camera) to default position.
     */
    triggerHome?: number;

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
     * Will be called while layers have rendered data.
     * progress is a number between 0 and 100.
     */
    onRenderingProgress?: (progress: number) => void;

    onDragStart?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
    onDragEnd?: (info: PickingInfo, event: MjolnirGestureEvent) => void;

    triggerResetMultipleWells?: number;
    selection?: {
        well: string | undefined;
        selection: [number | undefined, number | undefined] | undefined;
    };

    lights?: LightsType;

    children?: React.ReactNode;

    getTooltip?: TooltipCallback;
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
    layers,
    bounds,
    cameraPosition,
    triggerHome,
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
    getCameraPosition,
    onRenderingProgress,
    onDragStart,
    onDragEnd,
    lights,
    triggerResetMultipleWells,
}: MapProps) => {
    // From react doc, ref should not be read nor modified during rendering.
    const deckRef = React.useRef<DeckGLRef>(null);

    const [applyViewController, forceUpdate] = React.useReducer(
        (x) => x + 1,
        0
    );
    const viewController = useMemo(() => new ViewController(forceUpdate), []);

    // Extract the needed size from onResize function
    const [deckSize, setDeckSize] = useState<Size>({ width: 0, height: 0 });
    const onResize = useCallback((size: Size) => {
        // exclude {0, 0} size (when rendered hidden pages)
        if (size.width > 0 && size.height > 0) {
            setDeckSize((prevSize: Size) => {
                if (
                    prevSize?.width !== size.width ||
                    prevSize?.height !== size.height
                ) {
                    return size;
                }
                return prevSize;
            });
        }
    }, []);

    // 3d bounding box computed from the layers
    const [dataBoundingBox3d, dispatchBoundingBox] = React.useReducer(
        mapBoundingBoxReducer,
        undefined
    );

    // Used for scaling in z direction using arrow keys.
    const [zScale, updateZScale] = React.useReducer(updateZScaleReducer, 1);

    // compute the viewport margins
    const viewPortMargins = React.useMemo<MarginsType>(() => {
        if (!layers?.length) {
            return {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            };
        }
        // Margins on the viewport are extracted from a potential axes2D layer.
        const axes2DLayer = layers?.find((e) => {
            return e?.constructor === Axes2DLayer;
        }) as Axes2DLayer;

        const axes2DProps = axes2DLayer?.props;
        return {
            left: axes2DProps?.isLeftRuler ? axes2DProps.marginH : 0,
            right: axes2DProps?.isRightRuler ? axes2DProps.marginH : 0,
            top: axes2DProps?.isTopRuler ? axes2DProps.marginV : 0,
            bottom: axes2DProps?.isBottomRuler ? axes2DProps.marginV : 0,
        };
    }, [layers]);

    // selection
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

    const divRef = React.useRef(null);

    useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            const arrowEvent = convertToArrowEvent(e);
            if (arrowEvent) {
                updateZScale(arrowEvent);
                // prevent being handled by regular OrbitController
                e.stopPropagation();
            }
            if (e.key === "Shift") {
                setShiftHeld(true);
            }
        };
        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setShiftHeld(false);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const element = divRef.current as any;

        element?.addEventListener("keydown", keyDownHandler, true);
        element?.addEventListener("keyup", keyUpHandler, true);

        return () => {
            element?.removeEventListener("keydown", keyDownHandler);
            element?.removeEventListener("keyup", keyUpHandler);
        };
    }, [updateZScale, setShiftHeld]);

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
                        unproject3D: true,
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
            if (
                (event as MjolnirPointerEvent).leftButton &&
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                event.tapCount == 2 // Note. Detect double click.
            ) {
                // Left button click identifies new camera rotation anchor.
                if (infos.length >= 1) {
                    if (infos[0].coordinate) {
                        viewController.setTarget(
                            infos[0].coordinate as [number, number, number]
                        );
                    }
                }
            }

            if (!onMouseEvent) return;
            const ev = handleMouseEvent(type, infos, event);
            onMouseEvent(ev);
        },
        [onMouseEvent, viewController]
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

    const deckGLLayers = React.useMemo<LayersList>(() => {
        if (!layers) {
            return [];
        }
        if (layers.length === 0) {
            // Empty layers array makes deck.gl set deckRef to undefined (no OpenGL context).
            // Hence insert dummy layer.
            const dummy_layer = new LineLayer({
                id: "webviz_internal_dummy_layer",
                visible: false,
            });
            layers.push(dummy_layer);
        }

        const m = getModelMatrixScale(zScale);

        return layers.map((item) => {
            if (item?.constructor.name === NorthArrow3DLayer.name) {
                return item;
            }

            return (item as Layer).clone({
                // Inject "dispatchBoundingBox" function into layer for it to report back its respective bounding box.
                // eslint-disable-next-line
                // @ts-ignore
                reportBoundingBox: dispatchBoundingBox,
                // Set "modelLayer" matrix to reflect correct z scaling.
                modelMatrix: m,
            });
        });
    }, [layers, zScale]);

    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const onAfterRender = useCallback(() => {
        if (deckGLLayers) {
            let progress = 100;

            const emptyLayers = // There will always be a dummy layer. Deck.gl does not like empty array of layers.
                deckGLLayers.length == 1 &&
                (deckGLLayers[0] as LineLayer).id ===
                    "webviz_internal_dummy_layer";
            if (!emptyLayers) {
                // compute #done layers / #visible layers percentage
                const visibleLayers = deckGLLayers.filter(
                    (layer) => (layer as Layer).props.visible
                );
                const loaded = visibleLayers?.filter(
                    (layer) => (layer as Layer)?.isLoaded
                ).length;
                // ceil to ensure reaching 100 (important to check if done)
                progress = Math.ceil((100 * loaded) / visibleLayers?.length);
            }

            setLoadingProgress(progress);
            if (onRenderingProgress) {
                onRenderingProgress(progress);
            }
        }
    }, [deckGLLayers, onRenderingProgress]);

    // validate layers data
    const [errorText, setErrorText] = useState<string>();
    useEffect(() => {
        const layers = deckRef.current?.deck?.props.layers as Layer[];
        // this ensures to validate the schemas only once
        if (checkDatafileSchema && layers && loadingProgress === 100) {
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
        loadingProgress,
    ]);

    const layerFilter = useCallback(
        (args: { layer: Layer; viewport: Viewport }): boolean => {
            // display all the layers if views are not specified correctly
            if (!views?.viewports || !views?.layout) {
                return true;
            }

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
            viewController.onViewStateChange(viewId, viewState);
            if (getCameraPosition) {
                getCameraPosition(viewState);
            }
        },
        [getCameraPosition, viewController]
    );

    const effects = parseLights(lights);

    const [deckGlViews, deckGlViewState] = useMemo(() => {
        const state = {
            triggerHome,
            camera: cameraPosition,
            bounds,
            boundingBox3d: dataBoundingBox3d,
            viewPortMargins,
            deckSize,
            zScale,
        };
        return viewController.getViews(views, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        triggerHome,
        cameraPosition,
        bounds,
        dataBoundingBox3d,
        viewPortMargins,
        deckSize,
        views,
        zScale,
        applyViewController,
        viewController,
    ]);

    if (!deckGlViews || isEmpty(deckGlViews) || isEmpty(deckGLLayers))
        return null;
    return (
        <div ref={divRef} onContextMenu={(event) => event.preventDefault()}>
            <DeckGL
                id={id}
                viewState={deckGlViewState}
                views={deckGlViews}
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
                onAfterRender={onAfterRender}
                effects={effects}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onResize={onResize}
            >
                {children}
            </DeckGL>
            {scale?.visible ? (
                <DistanceScale
                    {...scale}
                    zoom={
                        (deckGlViewState[Object.keys(deckGlViewState)[0]]
                            ?.zoom as number) ?? -5
                    }
                    scaleUnit={coordinateUnit}
                    style={scale.cssStyle ?? {}}
                />
            ) : null}
            {!onRenderingProgress && loadingProgress < 100 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "right",
                        position: "absolute",
                        height: "90%",
                        width: "90%",
                        bottom: "10px",
                        right: "10px",
                        zIndex: 200,
                    }}
                >
                    <StatusIndicator
                        progress={loadingProgress}
                        label="Loading assets..."
                    />
                </div>
            )}
            {coords?.visible && <InfoCard pickInfos={hoverInfo} />}
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

    const configuration = createConfiguration(enums);
    const jsonConverter = new JSONConverter({ configuration });

    // remove empty data/layer object
    const filtered_data = data.filter((value) => !isEmpty(value));
    return jsonConverter.convert(filtered_data);
}

export function createLayers(
    data: Record<string, unknown>[],
    enums: Record<string, unknown>[] | undefined = undefined
): LayersList {
    const configuration = createConfiguration(enums);
    const layersList: Layer[] = [];

    // remove empty data/layer object
    const filtered_data = data.filter((value) => !isEmpty(value));
    for (const layerData of filtered_data) {
        const layer = createLayer(layerData, configuration);
        if (layer) {
            layersList.push(layer);
        }
    }
    return layersList;
}

function createConfiguration(
    enums: Record<string, unknown>[] | undefined = undefined
): JSONConfiguration {
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
    return configuration;
}

function createLayer(
    layerData: Record<string, unknown>,
    configuration: JSONConfiguration
): Layer | null {
    const typeKey = configuration.typeKey;
    const classes = configuration.classes as Record<string, any>;
    if (layerData[typeKey]) {
        const type = layerData[typeKey] as string;
        if (type in classes) {
            const Class = classes[type];

            // Prepare a props object
            const props = { ...layerData };
            delete props[typeKey];
            return new Class(props);
        }
    }
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////
// View Controller
// Implements the algorithms to compute the views and the view state
type ViewControllerState = {
    // Explicit state
    triggerHome: number | undefined;
    camera: ViewStateType | undefined;
    bounds: BoundingBox2D | BoundsAccessor | undefined;
    boundingBox3d: BoundingBox3D | undefined;
    deckSize: Size;
    zScale: number;
    viewPortMargins: MarginsType;
};
type ViewControllerDerivedState = {
    // Derived state
    target: [number, number, number] | undefined;
    viewStateChanged: boolean;
};
type ViewControllerFullState = ViewControllerState & ViewControllerDerivedState;
class ViewController {
    private rerender_: React.DispatchWithoutAction;

    private state_: ViewControllerFullState = {
        triggerHome: undefined,
        camera: undefined,
        bounds: undefined,
        boundingBox3d: undefined,
        deckSize: { width: 0, height: 0 },
        zScale: 1,
        viewPortMargins: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        // Derived state
        target: undefined,
        viewStateChanged: false,
    };

    private derivedState_: ViewControllerDerivedState = {
        target: undefined,
        viewStateChanged: false,
    };

    private views_: ViewsType | undefined = undefined;
    private result_: {
        views: View[];
        viewState: Record<string, ViewStateType>;
    } = {
        views: [],
        viewState: {},
    };

    public constructor(rerender: React.DispatchWithoutAction) {
        this.rerender_ = rerender;
    }

    public readonly setTarget = (target: [number, number, number]) => {
        this.derivedState_.target = [target[0], target[1], target[2]];
        this.rerender_();
    };

    public readonly getViews = (
        views: ViewsType | undefined,
        state: ViewControllerState
    ): [View[], Record<string, ViewStateType>] => {
        const fullState = this.consolidateState(state);
        const newViews = this.getDeckGlViews(views, fullState);
        const newViewState = this.getDeckGlViewState(views, fullState);

        this.state_ = fullState;
        this.views_ = views;
        this.result_.views = newViews;
        this.result_.viewState = newViewState;
        return [newViews, newViewState];
    };

    // consolidate "controlled" state (ie. set by parent) with "uncontrolled" state
    private readonly consolidateState = (
        state: ViewControllerState
    ): ViewControllerFullState => {
        return { ...state, ...this.derivedState_ };
    };

    // returns the DeckGL views (ie. view position and viewport)
    private readonly getDeckGlViews = (
        views: ViewsType | undefined,
        state: ViewControllerFullState
    ) => {
        const needUpdate =
            views != this.views_ || state.deckSize != this.state_.deckSize;
        if (!needUpdate) {
            return this.result_.views;
        }
        return buildDeckGlViews(views, state.deckSize);
    };

    // returns the DeckGL views state(s) (ie. camera settings applied to individual views)
    private readonly getDeckGlViewState = (
        views: ViewsType | undefined,
        state: ViewControllerFullState
    ): Record<string, ViewStateType> => {
        const viewsChanged = views != this.views_;
        const triggerHome = state.triggerHome !== this.state_.triggerHome;
        const updateTarget =
            (viewsChanged || state.target !== this.state_?.target) &&
            state.target !== undefined;
        const updateZScale =
            viewsChanged || state.zScale !== this.state_?.zScale || triggerHome;
        const updateViewState =
            viewsChanged ||
            triggerHome ||
            state.camera != this.state_.camera ||
            state.bounds != this.state_.bounds ||
            (!state.viewStateChanged &&
                (state.boundingBox3d !== this.state_.boundingBox3d ||
                    state.deckSize != this.state_.deckSize));
        const needUpdate = updateZScale || updateTarget || updateViewState;

        const isCacheEmpty = isEmpty(this.result_.viewState);
        if (!isCacheEmpty && !needUpdate) {
            return this.result_.viewState;
        }

        // initialize with last result
        const prevViewState = this.result_.viewState;
        let viewState = prevViewState;

        if (updateViewState || isCacheEmpty) {
            viewState = buildDeckGlViewStates(
                views,
                state.viewPortMargins,
                state.camera,
                state.boundingBox3d,
                state.bounds,
                state.deckSize
            );
            // reset state
            this.derivedState_.viewStateChanged = false;
        }

        // check if view state could be computed
        if (isEmpty(viewState)) {
            return viewState;
        }

        const viewStateKeys = Object.keys(viewState);
        if (
            updateTarget &&
            this.derivedState_.target &&
            viewStateKeys?.length === 1
        ) {
            // deep clone to notify change (memo checks object address)
            if (viewState === prevViewState) {
                viewState = cloneDeep(prevViewState);
            }
            // update target
            viewState[viewStateKeys[0]].target = this.derivedState_.target;
            viewState[viewStateKeys[0]].transitionDuration = 1000;
            // reset
            this.derivedState_.target = undefined;
        }
        if (updateZScale) {
            // deep clone to notify change (memo checks object address)
            if (viewState === prevViewState) {
                viewState = cloneDeep(prevViewState);
            }
            // Z scale to apply to target.
            // - if triggerHome: the target was recomputed from the input data (ie. without any scale applied)
            // - otherwise: previous scale (ie. this.state_.zScale) was already applied, and must be "reverted"
            const targetScale =
                state.zScale / (triggerHome ? 1 : this.state_.zScale);
            // update target
            for (const key in viewState) {
                const t = viewState[key].target;
                if (t) {
                    viewState[key].target = [t[0], t[1], t[2] * targetScale];
                }
            }
        }
        return viewState;
    };

    public readonly onViewStateChange = (
        viewId: string,
        viewState: ViewStateType
    ): void => {
        const viewports = this.views_?.viewports ?? [];
        if (viewState.target.length === 2) {
            // In orthographic mode viewState.target contains only x and y. Add existing z value.
            viewState.target.push(this.result_.viewState[viewId].target[2]);
        }
        const isSyncIds = viewports
            .filter((item) => item.isSync)
            .map((item) => item.id);
        if (isSyncIds?.includes(viewId)) {
            const viewStateTable = this.views_?.viewports
                .filter((item) => item.isSync)
                .map((item) => [item.id, viewState]);
            const tempViewStates = Object.fromEntries(viewStateTable ?? []);
            this.result_.viewState = {
                ...this.result_.viewState,
                ...tempViewStates,
            };
        } else {
            this.result_.viewState = {
                ...this.result_.viewState,
                [viewId]: viewState,
            };
        }
        this.derivedState_.viewStateChanged = true;
        this.rerender_();
    };
}

/**
 * Returns the zoom factor allowing to view the complete boundingBox.
 * @param camera camera defining the view orientation.
 * @param boundingBox 3D bounding box to visualize.
 * @param fov field of view (see deck.gl file orbit-viewports.ts).
 */
function computeCameraZoom(
    camera: ViewStateType,
    boundingBox: BoundingBox3D,
    size: Size,
    fovy = 50
): number {
    const DEGREES_TO_RADIANS = Math.PI / 180;
    const RADIANS_TO_DEGREES = 180 / Math.PI;
    const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    const fD = fovyToAltitude(fovy);

    const xMin = boundingBox[0];
    const yMin = boundingBox[1];
    const zMin = boundingBox[2];

    const xMax = boundingBox[3];
    const yMax = boundingBox[4];
    const zMax = boundingBox[5];

    const target = [
        xMin + (xMax - xMin) / 2,
        yMin + (yMax - yMin) / 2,
        zMin + (zMax - zMin) / 2,
    ];

    const cameraFovVertical = 50;
    const angle_ver = (cameraFovVertical / 2) * DEGREES_TO_RADIANS;
    const L = size.height / 2 / Math.sin(angle_ver);
    const r = L * Math.cos(angle_ver);
    const cameraFov = 2 * Math.atan(size.width / 2 / r) * RADIANS_TO_DEGREES;
    const angle_hor = (cameraFov / 2) * DEGREES_TO_RADIANS;

    const points: [number, number, number][] = [];
    points.push([xMin, yMin, zMin]);
    points.push([xMin, yMax, zMin]);
    points.push([xMax, yMax, zMin]);
    points.push([xMax, yMin, zMin]);
    points.push([xMin, yMin, zMax]);
    points.push([xMin, yMax, zMax]);
    points.push([xMax, yMax, zMax]);
    points.push([xMax, yMin, zMax]);

    let zoom = 999;
    for (const point of points) {
        const x_ = (point[0] - target[0]) / size.height;
        const y_ = (point[1] - target[1]) / size.height;
        const z_ = (point[2] - target[2]) / size.height;

        const m = new Matrix4(IDENTITY);
        m.rotateX(camera.rotationX * DEGREES_TO_RADIANS);
        m.rotateZ(camera.rotationOrbit * DEGREES_TO_RADIANS);

        const [x, y, z] = m.transformAsVector([x_, y_, z_]);
        if (y >= 0) {
            // These points will actually appear further away when zooming in.
            continue;
        }

        const fwX = fD * Math.tan(angle_hor);
        let y_new = fwX / (Math.abs(x) / y - fwX / fD);
        const zoom_x = Math.log2(y_new / y);

        const fwY = fD * Math.tan(angle_ver);
        y_new = fwY / (Math.abs(z) / y - fwY / fD);
        const zoom_z = Math.log2(y_new / y);

        // it needs to be inside view volume in both directions.
        zoom = zoom_x < zoom ? zoom_x : zoom;
        zoom = zoom_z < zoom ? zoom_z : zoom;
    }
    return zoom;
}

///////////////////////////////////////////////////////////////////////////////////////////
// return viewstate with computed bounds to fit the data in viewport
function getViewStateFromBounds(
    viewPortMargins: MarginsType,
    bounds_accessor: BoundingBox2D | BoundsAccessor,
    target: [number, number, number],
    views: ViewsType | undefined,
    viewPort: ViewportType,
    size: Size
): ViewStateType | undefined {
    const bounds =
        typeof bounds_accessor == "function"
            ? bounds_accessor()
            : bounds_accessor;

    let w = bounds[2] - bounds[0]; // right - left
    let h = bounds[3] - bounds[1]; // top - bottom

    const z = target[2];

    const fb = fitBounds({ width: w, height: h, bounds });
    let fb_target = [fb.x, fb.y, z];
    let fb_zoom = fb.zoom;

    if (size.width > 0 && size.height > 0) {
        // If there are margins/rulers in the viewport (axes2DLayer) we have to account for that.
        // Camera target should be in the middle of viewport minus the rulers.
        const w_bounds = w;
        const h_bounds = h;

        const ml = viewPortMargins.left;
        const mr = viewPortMargins.right;
        const mb = viewPortMargins.bottom;
        const mt = viewPortMargins.top;

        // Subtract margins.
        const marginH = (ml > 0 ? ml : 0) + (mr > 0 ? mr : 0);
        const marginV = (mb > 0 ? mb : 0) + (mt > 0 ? mt : 0);

        w = size.width - marginH; // width of the viewport minus margin.
        h = size.height - marginV;

        // Special case if matrix views.
        // Use width and height for a sub-view instead of full viewport.
        if (views?.layout) {
            const [nY, nX] = views.layout;
            const isMatrixViews = nX !== 1 || nY !== 1;
            if (isMatrixViews) {
                const mPixels = views?.marginPixels ?? 0;

                const w_ = 99.5 / nX; // Using 99.5% of viewport to avoid flickering of deckgl canvas
                const h_ = 99.5 / nY;

                const marginHorPercentage =
                    100 * 100 * (mPixels / (w_ * size.width)); //percentage of sub view
                const marginVerPercentage =
                    100 * 100 * (mPixels / (h_ * size.height));

                const sub_w = (w_ / 100) * size.width;
                const sub_h = (h_ / 100) * size.height;

                w = sub_w * (1 - 2 * (marginHorPercentage / 100)) - marginH;
                h = sub_h * (1 - 2 * (marginVerPercentage / 100)) - marginV;
            }
        }

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

    const view_state: ViewStateType = {
        target: viewPort.target ?? fb_target,
        zoom: viewPort.zoom ?? fb_zoom,
        rotationX: 90, // look down z -axis
        rotationOrbit: 0,
        minZoom: viewPort.show3D ? minZoom3D : minZoom2D,
        maxZoom: viewPort.show3D ? maxZoom3D : maxZoom2D,
    };
    return view_state;
}

///////////////////////////////////////////////////////////////////////////////////////////
// build views
type ViewTypeType =
    | typeof OrbitView
    | typeof IntersectionView
    | typeof OrthographicView;
function getVT(
    viewport: ViewportType
): [
    ViewType: ViewTypeType,
    Controller: typeof OrbitController | typeof OrthographicController,
] {
    if (viewport.show3D) {
        return [OrbitView, OrbitController];
    }
    return [
        viewport.id === "intersection_view"
            ? IntersectionView
            : OrthographicView,
        OrthographicController,
    ];
}

function areViewsValid(views: ViewsType | undefined, size: Size): boolean {
    const isInvalid: boolean =
        views?.viewports === undefined ||
        views?.layout === undefined ||
        !views?.layout?.[0] ||
        !views?.layout?.[1] ||
        !size.width ||
        !size.height;
    return !isInvalid;
}

/** returns a new View instance. */
function newView(
    viewport: ViewportType,
    x: number | string,
    y: number | string,
    width: number | string,
    height: number | string
): View {
    const far = 9999;
    const near = viewport.show3D ? 0.1 : -9999;

    const [ViewType, Controller] = getVT(viewport);
    return new ViewType({
        id: viewport.id,
        controller: {
            type: Controller,
            doubleClickZoom: false,
        },

        x,
        y,
        width,
        height,

        flipY: false,
        far,
        near,
    });
}

function buildDeckGlViews(views: ViewsType | undefined, size: Size): View[] {
    const isOk = areViewsValid(views, size);
    if (!views || !isOk) {
        return [
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
            }),
        ];
    }

    // compute

    const [nY, nX] = views.layout;
    // compute for single view (code is more readable)
    const singleView = nX === 1 && nY === 1;
    if (singleView) {
        // Using 99.5% of viewport to avoid flickering of deckgl canvas
        return [newView(views.viewports[0], 0, 0, "99.5%", "99.5%")];
    }

    // compute for matrix
    const result: View[] = [];
    const w = 99.5 / nX; // Using 99.5% of viewport to avoid flickering of deckgl canvas
    const h = 99.5 / nY;
    const marginPixels = views.marginPixels ?? 0;
    const marginHorPercentage = 100 * 100 * (marginPixels / (w * size.width));
    const marginVerPercentage = 100 * 100 * (marginPixels / (h * size.height));
    let yPos = 0;
    for (let y = 1; y <= nY; y++) {
        let xPos = 0;
        for (let x = 1; x <= nX; x++) {
            if (result.length >= views.viewports.length) {
                // stop when all the viewports are filled
                return result;
            }

            const currentViewport: ViewportType =
                views.viewports[result.length];

            const viewX = xPos + marginHorPercentage / nX + "%";
            const viewY = yPos + marginVerPercentage / nY + "%";
            const viewWidth = w * (1 - 2 * (marginHorPercentage / 100)) + "%";
            const viewHeight = h * (1 - 2 * (marginVerPercentage / 100)) + "%";

            result.push(
                newView(currentViewport, viewX, viewY, viewWidth, viewHeight)
            );
            xPos = xPos + w;
        }
        yPos = yPos + h;
    }
    return result;
}

/**
 * Returns the camera if it is fully specified (ie. the zoom is a valid number), otherwise computes
 * the zoom to visualize the complete camera boundingBox if set, the provided boundingBox otherwise.
 * @param camera input camera
 * @param boundingBox fallback bounding box, if the camera zoom is not zoom a value nor a bounding box
 */
function updateViewState(
    camera: ViewStateType,
    boundingBox: BoundingBox3D | undefined,
    size: Size,
    is3D = true
): ViewStateType {
    if (typeof camera.zoom === "number" && !Number.isNaN(camera.zoom)) {
        return camera;
    }

    // update the camera to see the whole boundingBox
    if (Array.isArray(camera.zoom)) {
        boundingBox = camera.zoom as BoundingBox3D;
    }

    // return the camera if the bounding box is undefined
    if (boundingBox === undefined) {
        return camera;
    }

    if (!is3D) {
        // in 2D, use flat boxes
        boundingBox[2] = 0;
        boundingBox[5] = 0;
    }

    // clone the camera in case of triggerHome
    const camera_ = cloneDeep(camera);
    camera_.zoom = computeCameraZoom(camera, boundingBox, size);
    camera_.target = boxCenter(boundingBox);
    camera_.minZoom = camera_.minZoom ?? minZoom3D;
    camera_.maxZoom = camera_.maxZoom ?? maxZoom3D;
    return camera_;
}

/**
 *
 * @returns Computes the view state
 */
function computeViewState(
    viewPort: ViewportType,
    cameraPosition: ViewStateType | undefined,
    boundingBox: BoundingBox3D | undefined,
    bounds: BoundingBox2D | BoundsAccessor | undefined,
    viewportMargins: MarginsType,
    views: ViewsType | undefined,
    size: Size
): ViewStateType | undefined {
    // If the camera is defined, use it
    const isCameraPositionDefined = cameraPosition !== undefined;
    const isBoundsDefined = bounds !== undefined;

    if (viewPort.show3D ?? false) {
        // If the camera is defined, use it
        if (isCameraPositionDefined) {
            return updateViewState(cameraPosition, boundingBox, size);
        }

        // deprecated in 3D, kept for backward compatibility
        if (isBoundsDefined) {
            const centerOfData: [number, number, number] = boundingBox
                ? boxCenter(boundingBox)
                : [0, 0, 0];
            return getViewStateFromBounds(
                viewportMargins,
                bounds,
                centerOfData,
                views,
                viewPort,
                size
            );
        }
        const defaultCamera = {
            target: [0, 0, 0],
            zoom: NaN,
            rotationX: 45, // look down z -axis at 45 degrees
            rotationOrbit: 0,
        };
        return updateViewState(defaultCamera, boundingBox, size);
    } else {
        // If the camera is defined, use it
        if (isCameraPositionDefined) {
            const is3D = false;
            return updateViewState(cameraPosition, boundingBox, size, is3D);
        }

        const centerOfData: [number, number, number] = boundingBox
            ? boxCenter(boundingBox)
            : [0, 0, 0];
        // if bounds are defined, use them
        if (isBoundsDefined) {
            return getViewStateFromBounds(
                viewportMargins,
                bounds,
                centerOfData,
                views,
                viewPort,
                size
            );
        }

        return boundingBox
            ? getViewStateFromBounds(
                  viewportMargins,
                  // use the bounding box to extract the 2D bounds
                  [
                      boundingBox[0],
                      boundingBox[1],
                      boundingBox[3],
                      boundingBox[4],
                  ],
                  centerOfData,
                  views,
                  viewPort,
                  size
              )
            : undefined;
    }
}

function buildDeckGlViewStates(
    views: ViewsType | undefined,
    viewPortMargins: MarginsType,
    cameraPosition: ViewStateType | undefined,
    boundingBox: BoundingBox3D | undefined,
    bounds: BoundingBox2D | BoundsAccessor | undefined,
    size: Size
): Record<string, ViewStateType> {
    const isOk = areViewsValid(views, size);
    if (!views || !isOk) {
        return {};
    }

    // compute

    const [nY, nX] = views.layout;
    // compute for single view (code is more readable)
    const singleView = nX === 1 && nY === 1;
    if (singleView) {
        const viewState = computeViewState(
            views.viewports[0],
            cameraPosition,
            boundingBox,
            bounds,
            viewPortMargins,
            views,
            size
        );
        return viewState ? { [views.viewports[0].id]: viewState } : {};
    }

    // compute for matrix
    let result: Record<string, ViewStateType> = {} as Record<
        string,
        ViewStateType
    >;
    for (let y = 1; y <= nY; y++) {
        for (let x = 1; x <= nX; x++) {
            const resultLength = Object.keys(result).length;
            if (resultLength >= views.viewports.length) {
                // stop when all the viewports are filled
                return result;
            }
            const currentViewport: ViewportType = views.viewports[resultLength];
            const currentViewState = computeViewState(
                currentViewport,
                cameraPosition,
                boundingBox,
                bounds,
                viewPortMargins,
                views,
                size
            );
            if (currentViewState) {
                result = {
                    ...result,
                    [currentViewport.id]: currentViewState,
                };
            }
        }
    }
    return result;
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
