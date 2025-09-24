import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Grid } from "@mui/material";

import SyncLogViewer from "../SyncLogViewer";

import { tabDecorator } from "./helpers/MuiComponentsTabHelper";

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const args = require("../../../../../example-data/facies3wells.json");

interface IRTCWellLogViewerProps {
    width?: string;
}

const RTCWellLogViewer: React.FunctionComponent<IRTCWellLogViewerProps> = (
    props
) => {
    return (
        <Grid container direction={"column"} justifyContent="flex-start">
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    data-testid="well-log-views"
                    style={{
                        width: props.width ?? "100%",
                        height: "80vh",
                        position: "relative",
                    }}
                >
                    <SyncLogViewer {...{ ...args, id: "c1" }} />
                </div>
            </div>
        </Grid>
    );
};

// storybook page
const meta: Meta<typeof RTCWellLogViewer> = {
    title: "WellLogViewer/Demo/ClassificationLayout",
    component: RTCWellLogViewer,
    tags: ["no-dom-test"],
};

export default meta;

export const RTCTabsLayout: StoryObj<typeof RTCWellLogViewer> = {
    decorators: [tabDecorator],
    render: () => (
        <React.StrictMode>
            <RTCWellLogViewer />
        </React.StrictMode>
    ),
};

export const RTCTabsLayoutWithScrollbar: StoryObj<typeof RTCWellLogViewer> = {
    decorators: [tabDecorator],
    render: () => (
        <React.StrictMode>
            <RTCWellLogViewer {...{ width: "1700px" }} />
        </React.StrictMode>
    ),
};
