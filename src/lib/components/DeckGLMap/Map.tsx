import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import Coords from "./components/Coords";
import JSON_CONVERTER_CONFIG from "./configuration";
import { PickInfo } from "deck.gl";

import { Feature } from "geojson";

export interface MapProps {
    id: string;
    deckglSpec: Record<string, unknown>;
    resources: Record<string, unknown>;
    coords: {
        visible: boolean;
        multiPicking: boolean;
        pickDepth: number;
    };
    setProps: (props: Record<string, unknown>) => void;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);

    const [deckglSpec, setDeckglSpec] = React.useState(null);
    React.useEffect(() => {
        if (props.resources) {
            JSON_CONVERTER_CONFIG.enumerations["resources"] = props.resources;
        }
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        const jsonConverter = new JSONConverter({ configuration });

        const setLayerProps = (layerId, newLayerProps) => {
            if (!props.deckglSpec) {
                return;
            }

            // Deep clone the spec
            const currSpec = JSON.parse(JSON.stringify(props.deckglSpec));

            const layerIndex = currSpec.layers.findIndex(({ id }) => {
                return id == layerId;
            });
            if (layerIndex < 0) {
                console.log("Layer %s not found", layerId);
                return;
            }

            const layerProps = currSpec.layers[layerIndex];
            currSpec.layers[layerIndex] = {
                ...layerProps,
                ...newLayerProps,
            };
            props.setProps({ deckglSpec: currSpec });
        };

        // Inject `setLayerProps` in all the layers
        const specClone = Object.assign({}, props.deckglSpec);
        if (specClone && specClone.layers) {
            specClone.layers = (specClone.layers as Array<unknown>).map(
                (layer) => {
                    return Object.assign(layer, {
                        setLayerProps: setLayerProps,
                    });
                }
            );
        }
        const deckglSpec = jsonConverter.convert(specClone);
        setDeckglSpec(deckglSpec);
    }, [props]);

    const [hoverInfo, setHoverInfo] = React.useState<PickInfo<unknown>[]>([]);

    const onHover = React.useCallback(
        (pickInfo: PickInfo<unknown>, event) => {
            if (props.coords.multiPicking) {
                const infos = deckRef.current?.pickMultipleObjects({
                    x: event.offsetCenter.x,
                    y: event.offsetCenter.y,
                    radius: 1,
                    depth: props.coords.pickDepth,
                });
                setHoverInfo(infos);
            } else {
                setHoverInfo([pickInfo]);
            }
        },
        [props.coords]
    );

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {deckglSpec && (
                <DeckGL
                    id={props.id}
                    {...deckglSpec}
                    getCursor={({ isDragging }): string =>
                        isDragging ? "grabbing" : "default"
                    }
                    getTooltip={(info: PickInfo<unknown>): string | null => {
                        return (info.object as Feature)?.properties?.name;
                    }}
                    ref={deckRef}
                    onHover={onHover}
                >
                    {props.coords.visible && <Coords pickInfos={hoverInfo} />}
                </DeckGL>
            )}
        </div>
    );
};

export default Map;
