import React from "react";

import WellLogViewer from "../WellLogViewer";

import WellLogZoomSlider from "./WellLogZoomSlider";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogAxesPanel from "./WellLogAxesPanel";

interface Props {
    parent: WellLogViewer;
}

export function DefaultRightPanel(props: Props): JSX.Element {
    const parent = props.parent;
    return (
        <div
            style={{
                flexDirection: "column",
                height: "100%",
                width: "255px",
            }}
        >
            <WellLogAxesPanel header="Primary scale" parent={parent} />
            <WellLogInfoPanel
                header="Readout"
                parent={parent}
                readoutOptions={parent.props.readoutOptions}
            />
            <WellLogZoomSlider
                label="Zoom:"
                parent={parent}
                max={parent.props.options?.maxContentZoom}
            />
        </div>
    );
}

export default DefaultRightPanel;
