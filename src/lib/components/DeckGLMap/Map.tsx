import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import JSON_CONVERTER_CONFIG from "./configuration";
import { PickInfo } from "deck.gl";

import { Feature } from "geojson";

export interface MapProps {
    id: string;
    resources: Record<string, unknown>;
    deckglSpec: Record<string, unknown>;
    onHover: any;
    patchSpec: (patch: any) => void;
    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);

    const [specObj, setSpecObj] = React.useState({});

    React.useEffect(() => {
        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        if (props.resources) {
            configuration.merge({
                enumerations: {
                    resources: props.resources,
                },
            });
        }
        const jsonConverter = new JSONConverter({ configuration });
        setSpecObj(jsonConverter.convert(props.deckglSpec));
    }, [props.deckglSpec]);

    return (
        <DeckGL
            id={props.id}
            {...specObj}
            getCursor={({ isDragging }): string =>
                isDragging ? "grabbing" : "default"
            }
            getTooltip={(info: PickInfo<unknown>): string | null => {
                return (info.object as Feature)?.properties?.name;
            }}
            ref={deckRef}
            patchSpec={props.patchSpec} // TODO: find a better way to send the callback
            onHover={props.onHover}
        >
            {props.children}
        </DeckGL>
    );
};

export default Map;
