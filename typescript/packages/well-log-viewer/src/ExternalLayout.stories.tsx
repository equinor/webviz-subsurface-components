import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Grid } from "@mui/material";
import type { GridDirection } from "@mui/material";

import SyncLogViewer from "./SyncLogViewer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require("../../../../example-data/facies3wells.json");

const RTCWellLogViewer: React.FunctionComponent = () => {
    return (
        <Grid container direction={"column"} justifyContent="flex-start">
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    data-testid="well-log-views"
                    style={{ width: "100%", height: "90vh" }}
                >
                    <SyncLogViewer {...args} />
                </div>
            </div>
        </Grid>
    );
};

const renderWellLogViews = (
    ref: React.MutableRefObject<null>,
    selectedTabIndex: number
) => {
    // When the Well Log Viewer is displayed, this is always on Tab with index 2.
    const viewerTabIndex = 2;
    if (!ref.current && viewerTabIndex !== selectedTabIndex) {
        return null;
    } else {
        return (
            <div ref={ref} style={{ width: "100%", height: "100%" }}>
                <RTCWellLogViewer />
            </div>
        );
    }
};

const WellLogsViewerArea: React.FC = () => {
    //---------------------------------------------------------------------------------
    // The Page rendering
    //---------------------------------------------------------------------------------

    //const supervisedTitle = renderTitle("Supervised Classification");
    //const wellSelector = renderWellSelector();
    const direction: GridDirection = "column";

    //const processingContext = useAppSelector(selectProcessingContext);
    const ref = React.useRef(null);
    const wellLogViews = renderWellLogViews(ref, 2);

    return (
        <div>
            <Grid container direction={direction} justifyContent="flex-start">
                {wellLogViews}
            </Grid>
            <br />
        </div>
    );
};

// storybook page
const meta: Meta<typeof WellLogsViewerArea> = {
    title: "WellLogViewer / Viz Examples / classification layout",
    component: WellLogsViewerArea,
};

export default meta;

export const RTCTabsLayout: StoryObj<typeof WellLogsViewerArea> = {
    render: () => <WellLogsViewerArea />,
};
