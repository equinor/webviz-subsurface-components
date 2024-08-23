import React from "react";
import type { Unit } from "convert-units";
import convert from "convert-units";

export interface ScaleProps {
    // Needed the zoom value to calculate width in units
    zoom?: number;
    // Scale increment value
    incrementValue?: number | null;
    // Scale bar width in pixels per unit value
    widthPerUnit?: number | null;
    // additional css style to position the component
    style?: Record<string, unknown>;
    // default unit for the scale ruler
    scaleUnit?: Unit;
}

const roundToStep = function (num: number, step: number) {
    return Math.floor(num / step + 0.5) * step;
};

export const DistanceScale: React.FC<ScaleProps> = ({
    zoom = -3,
    incrementValue = 100,
    widthPerUnit = 100,
    style = { top: 10, left: 10 },
    scaleUnit = "m",
}: ScaleProps) => {
    if (!zoom || !widthPerUnit || !incrementValue || !scaleUnit) return null;

    if (!convert().possibilities().includes(scaleUnit)) {
        return null;
    }

    const widthInUnits = widthPerUnit / Math.pow(2, zoom);

    const scaleValue =
        widthInUnits < incrementValue
            ? Math.round(widthInUnits)
            : roundToStep(widthInUnits, incrementValue);

    const convertedUnit = convert(scaleValue)
        .from(scaleUnit as convert.Unit)
        .toBest().unit;
    const convertedValue = convert(scaleValue)
        .from(scaleUnit as convert.Unit)
        .toBest().val;

    const rulerWidth = scaleValue * Math.pow(2, zoom);

    const scaleRulerStyle: React.CSSProperties = {
        width: rulerWidth,
        height: "4px",
        border: "2px solid",
        borderTop: "none",
        display: "inline-block",
        marginLeft: "3px",
    };

    return (
        <div
            style={{
                position: "absolute",
                ...style,
            }}
        >
            <label style={{ ...style }}>
                {convertedValue.toFixed(0)}
                {convertedUnit}
            </label>
            <div style={scaleRulerStyle}></div>
        </div>
    );
};
