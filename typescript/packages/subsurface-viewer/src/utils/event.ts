import React, { useState } from "react";

// https://developer.mozilla.org/docs/Web/API/KeyboardEvent
type ArrowEvent = {
    key: "ArrowUp" | "ArrowDown" | "PageUp" | "PageDown";
    shiftModifier: boolean;
};

function updateZScaleReducer(zScale: number, action: ArrowEvent): number {
    return zScale * getZScaleModifier(action);
}

function getZScaleModifier(arrowEvent: ArrowEvent): number {
    let scaleFactor = 0;
    switch (arrowEvent.key) {
        case "ArrowUp":
            scaleFactor = 0.05;
            break;
        case "ArrowDown":
            scaleFactor = -0.05;
            break;
        case "PageUp":
            scaleFactor = 0.25;
            break;
        case "PageDown":
            scaleFactor = -0.25;
            break;
        default:
            break;
    }
    if (arrowEvent.shiftModifier) {
        scaleFactor /= 5;
    }
    return 1 + scaleFactor;
}

function convertToArrowEvent(event: KeyboardEvent): ArrowEvent | null {
    if (event.type === "keydown") {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "PageUp":
            case "PageDown":
                return {
                    key: event.key,
                    shiftModifier: event.shiftKey,
                };
            default:
                return null;
        }
    }
    return null;
}

/**
 * A hook for listening to key arrow events.
 * @returns an object containing the factor state, a callback for altering
 * the state, and a ref that is used to attach the event listener used for
 * keyboard events.
 */
export const useScaleFactor = () => {
    const [factor, setFactor] = React.useState(1);

    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            const arrowEvent = convertToArrowEvent(e);
            if (!arrowEvent) {
                return;
            }

            setFactor((oldValue) => updateZScaleReducer(oldValue, arrowEvent));

            // prevent being handled by regular OrbitController
            e.stopPropagation();
        };

        const element = elementRef.current;

        // Listen for keypress events.
        element?.addEventListener("keydown", keyDownHandler, true);

        return () => {
            element?.removeEventListener("keydown", keyDownHandler);
        };
    }, [elementRef]);
    return { factor, setFactor, elementRef };
};

export function useShiftHeld(): {
    divRef: React.MutableRefObject<null>;
    shiftHeld: boolean;
} {
    // Used for scaling in z direction using arrow keys.
    const [shiftHeld, setShiftHeld] = useState(false);

    const divRef = React.useRef(null);

    React.useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setShiftHeld(true);
            }
        };
        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setShiftHeld(false);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const element = divRef.current as any;

        element?.addEventListener("keydown", keyDownHandler, true);
        element?.addEventListener("keyup", keyUpHandler, true);

        return () => {
            element?.removeEventListener("keydown", keyDownHandler);
            element?.removeEventListener("keyup", keyUpHandler);
        };
    }, [setShiftHeld, divRef]);

    return { divRef, shiftHeld };
}
