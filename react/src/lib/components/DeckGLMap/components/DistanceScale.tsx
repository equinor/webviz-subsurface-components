import React from "react";

interface Props {
    zoomLevel: number
}
const DistanceScale: React.FC<Props> = (props) => {
    const [width] = React.useState(100);
    const pixelPerUnit = width / Math.pow(2, props.zoomLevel)
    // styling
    const scaleBarStyle = {
        width: width,
        height: "4px",
        border: "2px solid gray",
        borderTop: "none",
        display: "inline-block",
        marginLeft: "3px",
        right: 0,
        bottom: 0
    };

    return (
        <div style={{ bottom: 0, right: 0, position: "absolute" }}>
            <label>{parseFloat(pixelPerUnit.toFixed(2))}</label>
            <div style={scaleBarStyle}></div>
        </div>
    )
}

export default DistanceScale;