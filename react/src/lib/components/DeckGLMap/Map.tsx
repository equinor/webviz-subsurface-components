import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import { AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import { PickInfo } from "deck.gl";
import { Operation } from "fast-json-patch";
import { Feature } from "geojson";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import Settings from "./components/settings/Settings";
import JSON_CONVERTER_CONFIG from "./configuration";
import { setSpec } from "./redux/actions";
import { createStore } from "./redux/store";
import { WellsPickInfo } from "./layers/wells/wellsLayer";

export interface MapProps {
    id: string;
    resources: Record<string, unknown>;
    deckglSpec: Record<string, unknown>;
    onHover: <D>(info: PickInfo<D>, e: MouseEvent) => void;
    setSpecPatch: (patch: Operation[]) => void;
    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    deckglSpec,
    onHover,
    setSpecPatch,
    children,
}: MapProps) => {
    const deckRef = React.useRef<DeckGL>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = React.useRef<EnhancedStore<any, AnyAction, any>>(
        createStore(deckglSpec, setSpecPatch)
    );

    React.useEffect(() => {
        store.current = createStore(deckglSpec, setSpecPatch);
    }, [setSpecPatch]);

    const [specObj, setSpecObj] = React.useState(null);

    React.useEffect(() => {
        if (!deckglSpec) {
            return;
        }

        const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIG);
        if (resources) {
            configuration.merge({
                enumerations: {
                    resources,
                },
            });
        }
        const jsonConverter = new JSONConverter({ configuration });
        setSpecObj(jsonConverter.convert(deckglSpec));
    }, [deckglSpec, resources]);

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
                    setSpecPatch: setSpecPatch,
                },
            });
        }
    }, [setSpecPatch]);

    React.useEffect(() => {
        store.current.dispatch(setSpec(specObj ? deckglSpec : {}));
    }, [deckglSpec, specObj]);

    return (
        specObj && (
            <ReduxProvider store={store.current}>
                <DeckGL
                    id={id}
                    {...specObj}
                    getCursor={({ isDragging }): string =>
                        isDragging ? "grabbing" : "default"
                    }
                    getTooltip={(
                        info: PickInfo<unknown> | WellsPickInfo
                    ): string | null | undefined => {
                        if ((info as WellsPickInfo)?.logName) {
                            return (info as WellsPickInfo)?.logName;
                        } else {
                            return (info.object as Feature)?.properties?.name;
                        }
                    }}
                    ref={deckRef}
                    onHover={onHover}
                >
                    {children}
                </DeckGL>
                <Settings />
            </ReduxProvider>
        )
    );
};

export default Map;
