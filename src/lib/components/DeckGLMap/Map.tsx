import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import Coords from "./components/Coords";
import JSON_CONVERTER_CONFIGURATION from "./configuration";
import { PickInfo } from "deck.gl";

import { WellDataType } from "./layers/wells/wellsLayer";

export interface MapProps {
    id: string;
    deckglSpec: Record<string, unknown>;
    coords: {
        visible: boolean;
        multiPicking: boolean;
        pickDepth: number;
    };
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);

    const [deckglSpec, setDeckglSpec] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });

        setDeckglSpec(jsonConverter.convert(props.deckglSpec));
    }, [props.deckglSpec]);

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
                        return (info.object as WellDataType)?.properties.name;
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
