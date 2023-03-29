import React from "react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    if (!zoom || !widthPerUnit || !incrementValue) return null;
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

    const convertedUnit = convert(scaleValue).from(scaleUnit).toBest().unit;
    const convertedValue = convert(scaleValue).from(scaleUnit).toBest().val;

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
