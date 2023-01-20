import React from "react";

import WellLogViewer from "../WellLogViewer";

import WellLogZoomSlider from "./WellLogZoomSlider";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogAxesPanel from "./WellLogAxesPanel";

export function defaultRightPanel(parent: WellLogViewer): JSX.Element {
    return (
        <div
            style={{
                flexDirection: "column",
                height: "100%",
                width: "255px",
            }}
        >
            <WellLogAxesPanel
                header="Primary scale"
                parent={parent}
                callbacksManager={parent.callbacksManager}
            />
            <WellLogInfoPanel
                header="Readout"
                parent={parent}
                callbacksManager={parent.callbacksManager}
                readoutOptions={parent.props.readoutOptions}
            />
            <WellLogZoomSlider
                label="Zoom:"
                parent={parent}
                callbacksManager={parent.callbacksManager}
                max={parent.props.options?.maxContentZoom}
            />
        </div>
    );
}
