import React, { useState, useEffect, useCallback } from "react";

import type { CallbackManager } from "./CallbackManager";

import ZoomSlider from "./ZoomSlider";

interface Props {
    callbackManager: CallbackManager | undefined;

    label?: string | JSX.Element;
    max?: number;
}

export const WellLogZoomSlider: React.FC<Props> = ({
    callbackManager,
    label,
    max,
}) => {
    const [zoomValue, setZoomValue] = useState<number>(1.0);

    const onContentRescale = useCallback(() => {
        const controller = callbackManager?.controller;
        if (!controller) return;
        const zoom = controller.getContentZoom();
        if (Math.abs(Math.log(zoomValue / zoom)) >= 0.01) {
            setZoomValue(zoom);
        }
    }, [callbackManager, zoomValue]);

    const registerCallbacks = useCallback(
        (cm: CallbackManager | undefined) => {
            cm?.registerCallback("onContentRescale", onContentRescale);
        },
        [onContentRescale]
    );

    const unregisterCallbacks = useCallback(
        (cm: CallbackManager | undefined) => {
            cm?.unregisterCallback("onContentRescale", onContentRescale);
        },
        [onContentRescale]
    );

    useEffect(() => {
        registerCallbacks(callbackManager);
        return () => {
            unregisterCallbacks(callbackManager);
        };
    }, [callbackManager, registerCallbacks, unregisterCallbacks]);

    // callback function from zoom slider
    const onZoomSliderChange = useCallback(
        (zoom: number) => {
            callbackManager?.controller?.zoomContent(zoom);
        },
        [callbackManager]
    );

    return (
        <div className="zoom">
            {label && <span className="zoom-label">{label}</span>}
            <span className="zoom-value">
                <ZoomSlider
                    value={zoomValue}
                    max={max}
                    onChange={onZoomSliderChange}
                />
            </span>
        </div>
    );
};

export default WellLogZoomSlider;
