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
import { WellsPickInfo } from "../layers/wells/wellsLayer";
import InfoCard from "./InfoCard";
import DistanceScale from "../components/DistanceScale";

export interface MapProps {
    id: string;
    resources: Record<string, unknown>;
    deckglSpec: Record<string, unknown>;
    setSpecPatch: (patch: Operation[]) => void;
    onHover: <D>(info: PickInfo<D>, e: MouseEvent) => void;
    hoverInfo: PickInfo<unknown>[];
    showInfoCard: boolean;
    children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
    id,
    resources,
    deckglSpec,
    setSpecPatch,
    onHover,
    hoverInfo,
    showInfoCard,
    children,
}: MapProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = React.useRef<EnhancedStore<any, AnyAction, any>>(
        createStore(deckglSpec, setSpecPatch)
    );

    React.useEffect(() => {
        store.current = createStore(deckglSpec, setSpecPatch);
    }, [setSpecPatch]);

    const [specObj, setSpecObj] = React.useState(null);

    const [viewState, setviewState] = React.useState<any | null>(null)

    React.useEffect(() => {
        if (!deckglSpec) {
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
        setSpecObj(jsonConverter.convert(deckglSpec));
    }, [deckglSpec, resources]);

    const refCb = React.useCallback(
        (deckRef) => {
            if (deckRef) {
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
                            const feat = info.object as Feature;
                            return feat?.properties?.["name"];
                        }
                    }}
                    ref={refCb}
                    onHover={onHover}
                    onViewStateChange={({viewState}) => setviewState({viewState})}
                >
                    {children}
                </DeckGL>
                {showInfoCard ? <InfoCard pickInfos={hoverInfo} /> : null}
                <Settings />
                {viewState ? <DistanceScale zoomLevel={viewState} /> : null}
                </ReduxProvider>
        )
    );
};

export default Map;
