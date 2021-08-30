import React from "react";

interface scaleProps {
    // Needed the zoom value to calculate width in units
    zoom: number;
    // Scale increment value
    incrementValue: number;
    // width per unit value to calculate width in units
    widthPerUnit: number;
}

const roundOffvalues = function (num: number, step: number) {
    return Math.floor(num / step + 0.5) * step;
};

const DistanceScale: React.FC<scaleProps> = ({
    zoom,
    incrementValue,
    widthPerUnit,
}: scaleProps) => {
    const [rulerWidth, setRulerWidth] = React.useState<number>(widthPerUnit);
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

    let scaleValue = 0;

    scaleValue =
        widthInUnits < incrementValue
            ? Math.round(widthInUnits)
            : roundOffvalues(widthInUnits, incrementValue);

    React.useEffect(() => {
        setRulerWidth(scaleValue * Math.pow(2, zoom));
    }, [zoom]);

    return (
        <div style={{ bottom: 0, right: 0, position: "absolute" }}>
            <label>{scaleValue}</label>
            <div style={scaleRulerStyle}></div>
        </div>
    );
};

export default DistanceScale;
