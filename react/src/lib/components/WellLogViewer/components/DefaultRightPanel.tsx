import React, { Component } from "react";

import WellLogViewer from "../WellLogViewer";

import WellLogZoomSlider from "./WellLogZoomSlider";
import WellLogInfoPanel from "./WellLogInfoPanel";
import WellLogAxesPanel from "./WellLogAxesPanel";

interface Props {
    parent: WellLogViewer;
}

export class DefaultRightPanel extends Component<Props> {
    render(): JSX.Element {
        const width = "255px"; // default width for InfoPanel
        return (
            <div
                style={{
                    flexDirection: "column",
                    height: "100%",
                    width: width,
                    //minWidth: width,
                    //maxWidth: width,
                }}
            >
                <WellLogAxesPanel
                    header="Primary scale"
                    parent={this.props.parent}
                />
                <WellLogInfoPanel header="Readout" parent={this.props.parent} />
                <WellLogZoomSlider label="Zoom:" parent={this.props.parent} />
            </div>
        );
    }
}

export default DefaultRightPanel;
