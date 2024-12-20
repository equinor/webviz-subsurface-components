import React from "react";

import { PickingInfoPerView } from "@webviz/subsurface-viewer/src/hooks/useMultiViewPicking";

function ReadoutComponent(props: {
    viewId: string;
    pickingInfoPerView: PickingInfoPerView;
}): React.ReactNode {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 24,
                left: 8,
                background: "#fff",
                padding: 8,
                borderRadius: 4,
                display: "grid",
                gridTemplateColumns: "8rem auto",
                border: "1px solid #ccc",
                fontSize: "0.8rem",
                zIndex: 10,
            }}
        >
            <div>X:</div>
            <div>
                {roundToSignificant(
                    props.pickingInfoPerView[props.viewId]?.coordinates?.at(0)
                )}
            </div>
            <div>Y:</div>
            <div>
                {roundToSignificant(
                    props.pickingInfoPerView[props.viewId]?.coordinates?.at(1)
                )}
            </div>
            {props.pickingInfoPerView[props.viewId]?.layerPickingInfo.map(
                (el) => (
                    <React.Fragment key={`${el.layerId}`}>
                        <div style={{ fontWeight: "bold" }}>{el.layerName}</div>
                        {el.properties.map((prop, i) => (
                            <React.Fragment key={`${el.layerId}-${i}}`}>
                                <div style={{ gridColumn: 1 }}>{prop.name}</div>
                                <div>
                                    {typeof prop.value === "string"
                                        ? prop.value
                                        : roundToSignificant(prop.value)}
                                </div>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                )
            ) ?? ""}
        </div>
    );
}

function roundToSignificant(num: number | undefined) {
    if (num === undefined) {
        return "-";
    }
    // Returns two significant figures (non-zero) for numbers with an absolute value less
    // than 1, and two decimal places for numbers with an absolute value greater
    // than 1.
    return parseFloat(
        num.toExponential(Math.max(1, 2 + Math.log10(Math.abs(num))))
    );
}

export default ReadoutComponent;
