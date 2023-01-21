import React from "react";

import { WellLog } from "./WellLogTypes";
import SyncLogViewer from "../SyncLogViewer";

import WellLogZoomSlider from "./WellLogZoomSlider";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogAxesPanel from "./WellLogAxesPanel";

export function defaultRightPanel(parent: SyncLogViewer): JSX.Element {
    return (
        <div
            key="rightPanel"
            style={{
                //flex: "0, 0",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "255px",
                //minWidth: "255px",
                //maxWidth: "255px",
            }}
        >
            <WellLogAxesPanel
                callbacksManager={parent.callbacksManagers[0]}
                header="Primary scale"
                axisTitles={parent.props.axisTitles}
                axisMnemos={parent.props.axisMnemos}
                primaryAxis={parent.getPrimaryAxis()}
                onChangePrimaryAxis={parent.onChangePrimaryAxis}
            />
            {parent.props.welllogs?.map((_welllog: WellLog, index: number) => (
                <WellLogInfoPanel
                    key={index}
                    header={
                        "Readout " + parent.props.welllogs[index].header.well
                    }
                    callbacksManager={parent.callbacksManagers[index]}
                    readoutOptions={parent.props.readoutOptions}
                />
            ))}
            <WellLogZoomSlider
                label="Zoom:"
                callbacksManager={parent.callbacksManagers[0]}
                max={parent.props.welllogOptions?.maxContentZoom}
            />
        </div>
    );
}
