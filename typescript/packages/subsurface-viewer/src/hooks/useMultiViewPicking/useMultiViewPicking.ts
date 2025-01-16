import React from "react";

import { MultiViewPickingInfoAssembler } from "./MultiViewPickingInfoAssembler";

import type { DeckGLRef } from "@deck.gl/react";
import type { PickingInfoPerView } from "./MultiViewPickingInfoAssembler";
import type { MapMouseEvent } from "../../SubsurfaceViewer";

export type UseMultiViewPickingProps = {
    deckGlRef: React.RefObject<DeckGLRef | null>;
    multiPicking: boolean;
    pickDepth: number;
};

export type UseMultiViewPickingReturnType = {
    getPickingInfo: (event: MapMouseEvent) => void;
    pickingInfoPerView: PickingInfoPerView;
    activeViewportId: string;
};

// Make a documentation comment for the function
/**
 * Hook for multi-view picking.
 *
 * @param props - The hook properties.
 * @returns The hook return value.
 */
export function useMultiViewPicking(
    props: UseMultiViewPickingProps
): UseMultiViewPickingReturnType {
    const assembler = React.useRef<MultiViewPickingInfoAssembler | null>(null);

    const [info, setInfo] = React.useState<
        Omit<UseMultiViewPickingReturnType, "getPickingInfo">
    >({
        pickingInfoPerView: {},
        activeViewportId: "",
    });

    React.useEffect(
        function onPropsChangeEffect() {
            assembler.current = new MultiViewPickingInfoAssembler(
                props.deckGlRef.current,
                { multiPicking: props.multiPicking, pickDepth: props.pickDepth }
            );

            const unsubscribe = assembler.current.subscribe(
                function onPickingInfo(
                    info: PickingInfoPerView,
                    activeViewportId: string
                ) {
                    setInfo({
                        pickingInfoPerView: info,
                        activeViewportId,
                    });
                }
            );

            return function onPropsChangeUnmountEffect() {
                assembler.current = null;
                unsubscribe();
            };
        },
        [props.deckGlRef, props.multiPicking, props.pickDepth]
    );

    const getPickingInfo = React.useCallback(function getPickingInfo(
        event: MapMouseEvent
    ) {
        if (assembler.current) {
            assembler.current.getMultiViewPickingInfo(event);
        }
    }, []);

    return {
        getPickingInfo,
        ...info,
    };
}
