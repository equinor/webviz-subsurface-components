import React from "react";

import type WellLogViewer from "../WellLogViewer";

import WellLogAxesPanel from "./WellLogAxesPanel";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogZoomSlider from "./WellLogZoomSlider";

export function defaultSidePanel(parent: WellLogViewer): JSX.Element {
    return (
        <div className="side-panel">
            <WellLogAxesPanel
                header="Primary scale"
                axisTitles={parent.props.axisTitles}
                axisMnemos={parent.props.axisMnemos}
                primaryAxis={parent.getPrimaryAxis()}
                onChangePrimaryAxis={parent.onChangePrimaryAxis}
                callbackManager={parent.callbackManager}
            />
            <WellLogInfoPanel
                header="Readout"
                readoutOptions={parent.props.readoutOptions}
                callbackManager={parent.callbackManager}
            />
            <WellLogZoomSlider
                label="Zoom:"
                max={parent.props.options?.maxContentZoom}
                callbackManager={parent.callbackManager}
            />
        </div>
    );
}

import type { ViewerLayout } from "./WellLogLayout";
const defaultLayout: ViewerLayout<WellLogViewer> = {
    right: defaultSidePanel,
};

export default defaultLayout;
