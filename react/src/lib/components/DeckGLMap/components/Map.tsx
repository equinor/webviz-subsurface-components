import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import { PickInfo, Layer } from "deck.gl";
import { Operation } from "fast-json-patch";
import { Feature } from "geojson";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { setSpec } from "../redux/actions";
import { createStore } from "../redux/store";
import {
    WellsPickInfo,
    getLogInfo,
    getLogValues,
    LogCurveDataType,
} from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "../components/DistanceScale";
import DiscreteColorLegend from "../components/DiscreteLegend";
import ContinuousLegend from "../components/ContinuousLegend";
import StatusIndicator from "./StatusIndicator";
import {
    ColormapLayer,
    Hillshading2DLayer,
    WellsLayer,
    FaultPolygonsLayer,
    PieChartLayer,
    GridLayer,
    DrawingLayer,
} from "../layers";

// update spec object to include default layer props
function getSpecWithDefaultProps(
    deckglSpec: Record<string, unknown>
): Record<string, unknown> {
    const modified_spec = Object.assign({}, deckglSpec);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layers = [...(modified_spec["layers"] as any[])];
    layers?.forEach((layer) => {
        let default_props = undefined;
        if (layer["@@type"] === ColormapLayer.name)
            default_props = ColormapLayer.defaultProps;
        else if (layer["@@type"] === Hillshading2DLayer.name)
            default_props = Hillshading2DLayer.defaultProps;
        else if (layer["@@type"] === WellsLayer.name)
            default_props = WellsLayer.defaultProps;
        else if (layer["@@type"] === FaultPolygonsLayer.name)
            default_props = FaultPolygonsLayer.defaultProps;
        else if (layer["@@type"] === PieChartLayer.name)
            default_props = PieChartLayer.defaultProps;
        else if (layer["@@type"] === GridLayer.name)
            default_props = GridLayer.defaultProps;
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

    modified_spec["layers"] = layers;
    return modified_spec;
}

// construct views object for DeckGL component
function getViewsForDeckGL() {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getToolTip(info: PickInfo<any> | WellsPickInfo): string | null {
    if ((info as WellsPickInfo)?.logName) {
        return (info as WellsPickInfo)?.logName;
    } else {
        const feat = info.object as Feature;
        return feat?.properties?.["name"];
    }
}

function getLayer(deckGlProps: Record<string, unknown>, id: string) {
    const layers = deckGlProps["layers"] as Layer<unknown>[];
    if (null == layers) return;
    const wellsLayers = (layers as WellsLayer[]).filter(
        (item) => item.id.toLowerCase() == id.toLowerCase()
    );
    return wellsLayers[0];
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

    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    deckglSpec,
    setSpecPatch,
    coords,
    scale,
    coordinateUnit,
    legend,
    children,
}: MapProps) => {
    // state for views prop of DeckGL component
    const [deckGLViews, setDeckGLViews] = React.useState([]);
    React.useEffect(() => {
        const deckgl_views = getViewsForDeckGL();
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        const jsonConverter = new JSONConverter({ configuration });
        setDeckGLViews(jsonConverter.convert(deckgl_views));
    }, []);

    // state to update deckglSpec to include layer's defualt props
    const [deckglSpecWithDefaultProps, setDeckglSpecWithDefaultProps] =
        React.useState(getSpecWithDefaultProps(deckglSpec));
    React.useEffect(() => {
        setDeckglSpecWithDefaultProps(getSpecWithDefaultProps(deckglSpec));
    }, [deckglSpec]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = React.useRef<EnhancedStore<any, AnyAction, any>>(
        createStore(deckglSpecWithDefaultProps, setSpecPatch)
    );

    React.useEffect(() => {
        store.current = createStore(deckglSpecWithDefaultProps, setSpecPatch);
    }, [setSpecPatch]);

    const [specObj, setSpecObj] = React.useState<Record<string, unknown>>({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewState, setViewState] = React.useState<any>();
    React.useEffect(() => {
        if (!deckglSpecWithDefaultProps) {
            return;
        }

        // Add the resources as an enum in the Json Configuration and then convert the spec to actual objects.
        // See https://deck.gl/docs/api-reference/json/overview for more details.
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        if (resources) {
            configuration.merge({
                enumerations: {
                    resources,
                },
            });
        }
        const jsonConverter = new JSONConverter({ configuration });
        setSpecObj(jsonConverter.convert(deckglSpecWithDefaultProps));
    }, [deckglSpecWithDefaultProps, resources]);

    const refCb = React.useCallback(
        (deckRef) => {
            if (deckRef && deckRef.deck) {
                // Needed to initialize the viewState on first load
                setViewState(deckRef.deck.viewState);
                deckRef.deck.setProps({
                    // userData is undocumented and it doesn't appear in the
                    // deckProps type, but it is used by the layersManager
                    // and forwarded though the context to all the layers.
                    //
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore: TS2345
                    userData: {
                        setSpecPatch: setSpecPatch,
                    },
                });
            }
        },
        [setSpecPatch]
    );

    React.useEffect(() => {
        store.current.dispatch(
            setSpec(specObj ? deckglSpecWithDefaultProps : {})
        );
    }, [deckglSpecWithDefaultProps, specObj]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = React.useState<any>([]);
    const onHover = React.useCallback(
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

    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    const [legendProps, setLegendProps] = React.useState<{
        title: string;
        discrete: boolean;
        metadata: { objects: Record<string, [number[], number]> };
        valueRange: number[];
    }>({
        title: "",
        discrete: false,
        metadata: { objects: {} },
        valueRange: [],
    });

    const onAfterRender = React.useCallback(() => {
        const layers = specObj["layers"] as Layer<unknown>[];
        const state = layers.every((layer) => layer.isLoaded);
        setIsLoaded(state);
    }, [specObj]);

    const wellsLayer = getLayer(specObj, "wells-layer");

    // Get color table for log curves.
    React.useEffect(() => {
        if (!wellsLayer?.isLoaded) return;
        const logName = wellsLayer.props.logName;
        const pathLayer = wellsLayer.internalState.subLayers[1];
        if (!pathLayer.isLoaded) return;
        const logs = pathLayer?.props.data;
        const logData = logs[0];
        const logInfo = getLogInfo(logData, logData.header.name, logName);
        const title = "Wells / " + logName;
        if (logInfo?.description == "discrete") {
            const meta = logData["metadata_discrete"];
            const metadataDiscrete = meta[logName].objects;
            setLegendProps({
                title: title,
                discrete: true,
                metadata: metadataDiscrete,
                valueRange: [],
            });
        } else {
            const minArray: number[] = [];
            const maxArray: number[] = [];
            logs.forEach(function (log: LogCurveDataType) {
                const logValues = getLogValues(log, log.header.name, logName);

                minArray.push(Math.min(...logValues));
                maxArray.push(Math.max(...logValues));
            });

            setLegendProps({
                title: title,
                discrete: false,
                metadata: { objects: {} },
                valueRange: [Math.min(...minArray), Math.max(...maxArray)],
            });
        }
    }, [isLoaded, legend, wellsLayer?.props?.logName]);

    return (
        specObj && (
            <ReduxProvider store={store.current}>
                <DeckGL
                    id={id}
                    {...specObj}
                    views={deckGLViews}
                    getCursor={({ isDragging }): string =>
                        isDragging ? "grabbing" : "default"
                    }
                    getTooltip={getToolTip}
                    ref={refCb}
                    onHover={onHover}
                    onViewStateChange={({ viewState }) =>
                        setViewState(viewState)
                    }
                    onAfterRender={onAfterRender}
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
                        />
                    )}
                {
                    <StatusIndicator
                        layers={specObj["layers"] as Layer<unknown>[]}
                        isLoaded={isLoaded}
                    />
                }
            </ReduxProvider>
        )
    );
};

export default Map;
