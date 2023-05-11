/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
// @rmt: Changed require to import - added type dependency
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
    scaleUnit?: string;
}

const roundToStep = function (num: number, step: number) {
    return Math.floor(num / step + 0.5) * step;
};

const DistanceScale: React.FC<ScaleProps> = ({
    zoom,
    incrementValue,
    widthPerUnit,
    style,
    scaleUnit,
}: ScaleProps) => {
    // @rmt: added scaleUnit check - NOTE: if any of the values below === 0 || === "", this will return null
    if (!zoom || !widthPerUnit || !incrementValue || scaleUnit === undefined) {
        return null;
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [rulerWidth, setRulerWidth] = React.useState<number>(0);
    const widthInUnits = widthPerUnit / Math.pow(2, zoom);
    const scaleRulerStyle: React.CSSProperties = {
        width: rulerWidth,
        height: "4px",
        border: "2px solid",
        borderTop: "none",
        display: "inline-block",
        marginLeft: "3px",
    };

    const scaleValue =
        widthInUnits < incrementValue
            ? Math.round(widthInUnits)
            : roundToStep(widthInUnits, incrementValue);

    // @rmt: scaleUnit could be undefined? - scaleUnit: string !instanceof convert.Unit
    const convertedUnit = convert(scaleValue)
        .from(scaleUnit as convert.Unit)
        .toBest().unit;
    const convertedValue = convert(scaleValue)
        .from(scaleUnit as convert.Unit)
        .toBest().val;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        setRulerWidth(scaleValue * Math.pow(2, zoom));
    }, [zoom]);

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

DistanceScale.defaultProps = {
    zoom: -3,
    incrementValue: 100,
    widthPerUnit: 100,
    scaleUnit: "m",
};

export default DistanceScale;
