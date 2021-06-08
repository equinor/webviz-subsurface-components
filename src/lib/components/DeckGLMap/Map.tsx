import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { PickInfo } from "deck.gl";

import { Operation } from "fast-json-patch";
import { Feature } from "geojson";

import React from "react";

import JSON_CONVERTER_CONFIG from "./configuration";

export interface MapProps {
    id: string;
    resources: Record<string, unknown>;
    deckglSpec: Record<string, unknown>;
    onHover: <D>(info: PickInfo<D>, e: MouseEvent) => void;
    patchSpec: (patch: Operation[]) => void;
    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);

    const [specObj, setSpecObj] = React.useState(null);

    React.useEffect(() => {
        if (!props.deckglSpec) {
            return;
        }

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
    }, [props.deckglSpec, props.resources]);

    React.useEffect(() => {
        if (deckRef.current) {
            deckRef.current.deck.setProps({
                // userData is undocumented and it doesn't appear in the
                // deckProps type, but it is used by the layersManager
                // and forwarded though the context to all the layers.
                //
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: TS2345
                userData: {
                    patchSpec: props.patchSpec,
                },
            });
        }
    }, [props.patchSpec]);

    return (
        specObj && (
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
                onHover={props.onHover}
            >
                {props.children}
            </DeckGL>
        )
    );
};

export default Map;
