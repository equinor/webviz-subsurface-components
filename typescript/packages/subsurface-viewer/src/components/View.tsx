import { Deck, Viewport, View } from "@deck.gl/core";
import { DeckGLRef } from "@deck.gl/react";
import React from "react";

export type ViewProps = {
    id: string;
    deckGlRef: React.RefObject<DeckGLRef | null>;
    children?: React.ReactNode;
};

export function ViewContent(props: ViewProps): React.ReactNode {
    const deckRef = React.useRef<Deck | null>(null);

    React.useEffect(
        function onMount() {
            if (props.deckGlRef.current) {
                deckRef.current = props.deckGlRef.current.deck ?? null;
                if (deckRef.current) {
                    const views = deckRef.current.getViews();
                    const view = views.find((v) => v.id === props.id);
                    if (view) {
                        deckRef.current.props.onViewStateChange 
                    }
                }
            }
        },
        [props.deckGlRef]
    );
}