import React from "react";

import WellLogViewer from "../WellLogViewer";

import WellLogZoomSlider from "./WellLogZoomSlider";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogAxesPanel from "./WellLogAxesPanel";

export function defaultRightPanel(parent: WellLogViewer): JSX.Element {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "255px",
            }}
        >
            <WellLogAxesPanel
                header="Primary scale"
                callbacksManager={parent.callbacksManager}
                axisTitles={parent.props.axisTitles}
                axisMnemos={parent.props.axisMnemos}
                primaryAxis={parent.getPrimaryAxis()}
                onChangePrimaryAxis={parent.onChangePrimaryAxis}
            />
            <WellLogInfoPanel
                header="Readout"
                callbacksManager={parent.callbacksManager}
                readoutOptions={parent.props.readoutOptions}
            />
            <WellLogZoomSlider
                label="Zoom:"
                callbacksManager={parent.callbacksManager}
                max={parent.props.options?.maxContentZoom}
            />
        </div>
    );
}
