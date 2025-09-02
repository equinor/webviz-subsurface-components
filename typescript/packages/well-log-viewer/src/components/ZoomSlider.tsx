import React, { useEffect, useState } from "react";

import Slider from "@mui/material/Slider";

export interface ZoomSliderProps {
    onChange: (value: number) => void; // zoom value callback
    value: number; // zoom value.

    max?: number; // max zoom value. default 256
    step?: number; // step of zoom level. default 0.5
}

function convertLevelToValue(level: number): number {
    // convert zoom level to zoom value
    return 2 ** level;
}
function convertValueToLevel(value: number): number {
    // convert zoom value to zoom level
    return value > 0 ? Math.log2(value) : 0;
}

function valueLabelFormat(value: number /*, index: number*/): string {
    return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({
    onChange,
    value,
    max = 256,
    step = 0.5,
}) => {
    const [level, setLevel] = useState(convertValueToLevel(value));

    useEffect(() => {
        const newLevel = convertValueToLevel(value);
        if (level !== newLevel) {
            setLevel(newLevel);
        }
    }, [value, level]);

    // callback function from Zoom slider
    const handleChange = React.useCallback(
        (_event: Event, newLevel: number | number[]) => {
            if (typeof newLevel !== "number") return;

            if (level !== newLevel) {
                setLevel(newLevel);
                if (onChange) {
                    onChange(convertLevelToValue(newLevel));
                } else {
                    console.error("ZoomSlider props.onChange not set");
                }
            }
        },
        [level, onChange]
    );

    return (
        <Slider
            value={level}
            defaultValue={0}
            min={0}
            step={step}
            max={convertValueToLevel(max)}
            scale={convertLevelToValue} // convert zoom level to zoom value function
            onChange={handleChange}
            getAriaValueText={valueLabelFormat}
            valueLabelFormat={valueLabelFormat}
            aria-labelledby="non-linear-slider"
            valueLabelDisplay="auto"
        />
    );
};

export default ZoomSlider;
