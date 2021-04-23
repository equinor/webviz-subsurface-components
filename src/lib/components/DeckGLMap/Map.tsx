import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import Coords, { CoordsInfo } from "./components/Coords";
import JSON_CONVERTER_CONFIGURATION from "./configuration";
import { PickInfo } from "deck.gl";

import { WellDataType } from "./layers/wells/wellsLayer";
import { PropertyMapPickInfo } from "./layers/utils/propertyMapTools";

export interface MapProps {
    id: string;
    deckglSpec: Record<string, unknown>;
    showCoords: boolean;
    setProps: (props: Record<string, unknown>) => void;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const [deckglSpec, setDeckglSpec] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
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

    const [coordsInfo, setCoordsInfo] = React.useState<CoordsInfo | null>(null);
    const extractCoords = React.useCallback((pickInfo: PickInfo<unknown>) => {
        const xy = pickInfo.coordinate;
        if (!xy) {
            setCoordsInfo(null);
            return;
        }
        const coords: CoordsInfo = {
            x: xy[0],
            y: xy[1],
        };

        // TODO: modify this to support multiple property layers, once this issue is fixed:
        // https://github.com/visgl/deck.gl/issues/5576
        const zValue = (pickInfo as PropertyMapPickInfo).propertyValue;
        if (zValue) {
            coords.z = [{ value: zValue, layerId: pickInfo.layer.id }];
        }
        setCoordsInfo(coords);
    }, []);

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
                        return (info.object as WellDataType)?.properties.name;
                    }}
                    onHover={(pickInfo: PickInfo<unknown>): void => {
                        extractCoords(pickInfo);
                    }}
                >
                    {props.showCoords && <Coords coordsInfo={coordsInfo} />}
                </DeckGL>
            )}
        </div>
    );
};

export default Map;
