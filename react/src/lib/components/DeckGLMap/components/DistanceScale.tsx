import React from "react";

const DistanceScale = (props: any) => {
    const [width] = React.useState(100);
    // styling
    const scaleBarStyle = {
        width: width,
        height: "4px",
        border: "2px solid gray",
        borderTop: "none",
        display: "inline-block",
        right: 0, 
        bottom:0
    };

    let zoom = props.zoomLevel.viewState.zoom
    let pixelPerUnit = width / Math.pow(2, zoom)

    return (
        <div className="distanceScale">
            <label style={{marginRight: "5px"}}>{parseFloat(pixelPerUnit.toFixed(2))}</label>
            <div style={scaleBarStyle}></div>
        </div>
    )
}

export default DistanceScale;