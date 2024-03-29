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
                callbacksManager={parent.callbacksManager}
            />
            <WellLogInfoPanel
                header="Readout"
                readoutOptions={parent.props.readoutOptions}
                callbacksManager={parent.callbacksManager}
            />
            <WellLogZoomSlider
                label="Zoom:"
                max={parent.props.options?.maxContentZoom}
                callbacksManager={parent.callbacksManager}
            />
        </div>
    );
}

import type { ViewerLayout } from "./WellLogLayout";
const defaultLayout: ViewerLayout<WellLogViewer> = {
    right: defaultSidePanel,
};

export default defaultLayout;
