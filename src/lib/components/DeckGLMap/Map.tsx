import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import Coords, { CoordsInfo } from "./components/Coords";
import JSON_CONVERTER_CONFIGURATION from "./configuration";

export interface MapProps {
    id: string;
    jsonData: object;
    showCoords: boolean;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });

        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);

    const [coordsInfo, setCoordsInfo] = React.useState<CoordsInfo | null>(null);
    const extractCoords = React.useCallback(pickInfo => {
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
        const zValue = pickInfo?.propertyValue;
        const zLayerId = pickInfo?.layer?.id;
        if (zValue) {
            coords.z = [{ value: zValue, layerId: zLayerId }];
        }
        setCoordsInfo(coords);
    }, []);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {jsonProps && (
                <DeckGL
                    id={props.id}
                    {...jsonProps}
                    getCursor={({ isDragging }): string =>
                        isDragging ? "grabbing" : "default"
                    }
                    getTooltip={(pickInfo: any): string | undefined => {
                        return pickInfo?.object?.properties?.name;
                    }}
                    onHover={(pickInfo: any): void => {
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
