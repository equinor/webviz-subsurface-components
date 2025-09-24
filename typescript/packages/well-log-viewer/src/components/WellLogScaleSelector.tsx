import React, { useCallback, useEffect, useState } from "react";

import ScaleSelector from "./ScaleSelector";

import type { CallbackManager } from "./CallbackManager";

interface Props {
    callbackManager: CallbackManager | undefined;

    label?: string | JSX.Element;
    values?: number[]; // Available scale values array
    round?: boolean | number; // round the value to a "good" number
}

export const WellLogScaleSelector: React.FC<Props> = ({
    callbackManager,
    label,
    values,
    round,
}) => {
    const [value, setValue] = useState<number>(1.0);

    // callback function from content rescale
    const onContentRescale = useCallback(() => {
        const controller = callbackManager?.controller;
        if (!controller) return;

        const newValue = controller.getContentScale();
        setValue((currentValue) => {
            if (Math.abs(currentValue - newValue) < 1) return currentValue;
            return newValue;
        });
    }, [callbackManager]);

    // callback function from Vertical Scale combobox
    const onChange = useCallback(
        (newValue: number) => {
            const controller = callbackManager?.controller;
            if (!controller) return;

            controller.setContentScale(newValue);
        },
        [callbackManager]
    );

    // Handle callback registration/unregistration
    useEffect(() => {
        if (!callbackManager) return;

        callbackManager.registerCallback("onContentRescale", onContentRescale);

        return () => {
            callbackManager.unregisterCallback(
                "onContentRescale",
                onContentRescale
            );
        };
    }, [callbackManager, onContentRescale]);

    return (
        <div className="scale">
            {label && <span className="scale-label">{label}</span>}
            <span className="scale-value">
                <ScaleSelector
                    onChange={onChange}
                    values={values}
                    value={value}
                    round={round}
                />
            </span>
        </div>
    );
};

export default WellLogScaleSelector;
