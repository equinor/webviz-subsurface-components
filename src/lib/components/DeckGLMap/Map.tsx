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
    patchSpec: (patch: any) => void;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    deckglSpec,
    coords,
    patchSpec,
}: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);

    const [specObj, setSpecObj] = React.useState({});

    React.useEffect(() => {
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        if (resources) {
            configuration.merge({
                enumerations: {
                    resources: resources,
                },
            });
        }
        const jsonConverter = new JSONConverter({ configuration });
        setSpecObj(jsonConverter.convert(deckglSpec));
    }, [deckglSpec]);

    const [hoverInfo, setHoverInfo] = React.useState<PickInfo<unknown>[]>([]);

    const onHover = React.useCallback(
        (pickInfo: PickInfo<unknown>, event) => {
            if (coords.multiPicking) {
                const infos = deckRef.current?.pickMultipleObjects({
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
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <DeckGL
                id={id}
                {...specObj}
                getCursor={({ isDragging }): string =>
                    isDragging ? "grabbing" : "default"
                }
                getTooltip={(info: PickInfo<unknown>): string | null => {
                    return (info.object as Feature)?.properties?.name;
                }}
                ref={deckRef}
                {
                    // TODO: find a better way to send the callback
                }
                patchSpec={patchSpec}
                onHover={onHover}
            >
                {
                    // TODO: MOVE THE COORDS OUT TO PARENT
                }
                {coords.visible && <Coords pickInfos={hoverInfo} />}
            </DeckGL>
        </div>
    );
};

export default Map;
