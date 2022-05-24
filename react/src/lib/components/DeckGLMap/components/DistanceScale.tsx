import React from "react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const convert = require("convert-units");

interface scaleProps {
    // Needed the zoom value to calculate width in units
    zoom?: number;
    // Scale increment value
    incrementValue?: number | null;
    // Scale bar width in pixels per unit value
    widthPerUnit?: number | null;
    // positioning the scale ruler based on x and y values
    position?: number[] | null;
    // default unit for the scale ruler
    scaleUnit?: string;
}

const roundToStep = function (num: number, step: number) {
    return Math.floor(num / step + 0.5) * step;
};

const DistanceScale: React.FC<scaleProps> = ({
    zoom,
    incrementValue,
    widthPerUnit,
    position,
    scaleUnit,
}: scaleProps) => {
    if (!zoom || !widthPerUnit || !incrementValue || !position) return null;

    const [rulerWidth, setRulerWidth] = React.useState<number>(0);
    const widthInUnits = widthPerUnit / Math.pow(2, zoom);
    const scaleRulerStyle = {
        width: rulerWidth,
        height: "4px",
        border: "2px solid gray",
        borderTop: "none",
        display: "inline-block",
        marginLeft: "3px",
        marginRight: "3px",
        right: 0,
        bottom: 0,
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
                bottom: position[0],
                left: position[1],
                position: "relative",
            }}
        >
            <label>{convertedValue.toFixed(0)}</label>
            {convertedUnit}
            <div style={scaleRulerStyle}></div>
        </div>
    );
};

DistanceScale.defaultProps = {
    zoom: -3,
    incrementValue: 100,
    widthPerUnit: 100,
    position: [10, 10],
    scaleUnit: "m",
};

export default DistanceScale;
