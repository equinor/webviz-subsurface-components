import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { PickInfo } from "deck.gl";
import { Feature } from "geojson";
import React, { useEffect, useState, useCallback } from "react";
import Settings from "./settings/Settings";
import JSON_CONVERTER_CONFIG from "../utils/configuration";
import { MapState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateLayerProp } from "../redux/actions";
import { WellsPickInfo, getLogInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "../components/DistanceScale";
import DiscreteColorLegend from "../components/DiscreteLegend";

export interface DeckGLWrapperProps {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: string;

    initialViewState?: Record<string, unknown>;

    views: Record<string, unknown>[];

    /**
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec:
     * https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: Record<string, unknown>;

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

    /**
     * For reacting to prop changes
     */
    setEditedData: (data: Record<string, unknown>) => void;

    children?: React.ReactNode;
}

const DeckGLWrapper: React.FC<DeckGLWrapperProps> = ({
    id,
    initialViewState,
    views,
    resources,
    coords,
    scale,
    coordinateUnit,
    legendVisible,
    setEditedData,
    children,
}: DeckGLWrapperProps) => {
    // state for views prop of DeckGL component
    const [deckGLViews, setDeckGLViews] = useState(null);
    useEffect(() => {
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        const jsonConverter = new JSONConverter({ configuration });
        setDeckGLViews(jsonConverter.convert(views));
    }, [views]);

    const dispatch = useDispatch();
    const layersData = useSelector((st: MapState) => st.layers);

    const [deckGLLayers, setDeckGLLayers] = useState();
    useEffect(() => {
        console.log("spec updated", layersData);
        if (!layersData.length) {
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
        setDeckGLLayers(jsonConverter.convert(layersData));
    }, [layersData, resources]);

    /*
    // Hacky way of disabling well selection when drawing.
    const drawingEnabled = layersData.some((layer) => {
        return layer["@@type"] == "DrawingLayer" && layer["mode"] != "view";
    });
    React.useEffect(() => {
        console.log("spec updated", drawingEnabled);
        dispatch(
            updateLayerProp([
                "wells-layer",
                "selectionEnabled",
                !drawingEnabled,
            ])
        );
    }, [drawingEnabled, dispatch]);
    */

    //eslint-disable-next-line
    const [discreteData, setDiscreteData] = useState(Object);
    const [discreteDataPresent, setDiscreteDataPresent] = useState(false);

    //eslint-disable-next-line
    const deckgl_layers = (layersData as any[]);
    const wellsLayerData = deckgl_layers.filter(
        //eslint-disable-next-line
            (item: any) =>
                item.id.toLowerCase() == "wells-layer".toLowerCase()
    );
    const logData = wellsLayerData[0].logData;
    const logName = wellsLayerData[0].logName;

    useEffect(() => {
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
                    userData: {
                        setSpecPatch: (
                            layer_id: string,
                            updated_prop: Record<string, unknown>
                        ) => {
                            dispatch(
                                updateLayerProp([
                                    layer_id,
                                    Object.entries(updated_prop)[0][0],
                                    Object.entries(updated_prop)[0][1] as any,
                                ])
                            );
                            setEditedData?.(updated_prop);
                        },
                    },
                });
            }
        },
        [dispatch]
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewState, setViewState] = useState<any>();

    return (
        deckGLViews && (
            <div>
                <DeckGL
                    id={id}
                    initialViewState={initialViewState}
                    views={deckGLViews}
                    layers={deckGLLayers}
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
            </div>
        )
    );
};

export default DeckGLWrapper;
