import React from "react";

import type { WellLog } from "./WellLogTypes";
import type SyncLogViewer from "../SyncLogViewer";

import WellLogAxesPanel from "./WellLogAxesPanel";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogZoomSlider from "./WellLogZoomSlider";

export function defaultSidePanel(parent: SyncLogViewer): JSX.Element {
    return (
        <div className="side-panel">
            <WellLogAxesPanel
                header="Primary scale"
                axisTitles={parent.props.axisTitles}
                axisMnemos={parent.props.axisMnemos}
                primaryAxis={parent.getPrimaryAxis()}
                onChangePrimaryAxis={parent.onChangePrimaryAxis}
                callbackManager={parent.callbackManagers[0]}
            />
            {parent.props.welllogs?.map(
                (welllog: WellLog, iWellLog: number) => (
                    <WellLogInfoPanel
                        key={iWellLog}
                        header={"Readout " + welllog.header.well}
                        readoutOptions={parent.props.readoutOptions}
                        callbackManager={parent.callbackManagers[iWellLog]}
                    />
                )
            )}
            <WellLogZoomSlider
                label="Zoom:"
                max={parent.props.welllogOptions?.maxContentZoom}
                callbackManager={parent.callbackManagers[0]}
            />
        </div>
    );
}

import type { ViewerLayout } from "./WellLogLayout";
const defaultLayout: ViewerLayout<SyncLogViewer> = {
    right: defaultSidePanel,
};

export default defaultLayout;
