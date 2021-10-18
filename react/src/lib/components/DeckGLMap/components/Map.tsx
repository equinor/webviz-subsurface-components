import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import { PickInfo } from "deck.gl";
import { Operation } from "fast-json-patch";
import { Feature } from "geojson";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { setSpec } from "../redux/actions";
import { createStore } from "../redux/store";
import { WellsPickInfo, getLogInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "../components/DistanceScale";
import DiscreteColorLegend from "../components/DiscreteLegend";
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

    legendVisible: boolean;

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
    legendVisible,
    children,
}: MapProps) => {
    // state for views prop of DeckGL component
    const [deckGLViews, setDeckGLViews] = React.useState(null);
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

    const [specObj, setSpecObj] = React.useState(null);

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

    //eslint-disable-next-line
    const [discreteData, setDiscreteData] = React.useState(Object);
    const [discreteDataPresent, setDiscreteDataPresent] = React.useState(false);

    //eslint-disable-next-line
    const layers = (deckglSpec["layers"] as any);
    const wellsLayerData = layers.filter(
        //eslint-disable-next-line
            (item: any) =>
                item.id.toLowerCase() == "wells-layer".toLowerCase()
    );
    const logData = wellsLayerData[0].logData;
    const logName = wellsLayerData[0].logName;

    React.useEffect(() => {
        let isMounted = true;
        fetch(logData)
            .then((response) => response.json())
            .then((data) => {
                const log_info = getLogInfo(
                    data[0],
                    data[0].header.name,
                    logName
                );
                if (log_info?.description == "discrete") {
                    const metadata_discrete =
                        data[0]["metadata_discrete"][logName].objects;
                    if (isMounted) {
                        setDiscreteData(metadata_discrete);
                        setDiscreteDataPresent(true);
                    }
                }
            });
        // fix for memory leak error
        return () => {
            isMounted = false;
        };
    }, [logData, logName]);

    const refCb = React.useCallback(
        (deckRef) => {
            if (deckRef) {
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
                    onViewStateChange={({ viewState }) =>
                        setViewState(viewState)
                    }
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
                {legendVisible && discreteDataPresent ? (
                    <DiscreteColorLegend discreteData={discreteData} />
                ) : null}
            </ReduxProvider>
        )
    );
};

export default Map;
