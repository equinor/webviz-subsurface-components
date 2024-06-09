import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Grid } from "@mui/material";
//import type { GridDirection } from "@mui/material";

import SyncLogViewer from "../SyncLogViewer";

import { tabDecorator } from "./helpers/MuiComponentsTabHelper";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require("../../../../../example-data/facies3wells.json");

const RTCWellLogViewer: React.FunctionComponent = () => {
    return (
        <Grid container direction={"column"} justifyContent="flex-start">
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    data-testid="well-log-views"
                    style={{ width: "100%", height: "90vh" }}
                >
                    <SyncLogViewer {...{ ...args, id: "c1" }} />
                </div>
            </div>
        </Grid>
    );
};

// storybook page
const meta: Meta<typeof RTCWellLogViewer> = {
    title: "WellLogViewer / Viz Examples / classification layout",
    component: RTCWellLogViewer,
};

export default meta;

export const RTCTabsLayout: StoryObj<typeof RTCWellLogViewer> = {
    decorators: [tabDecorator],
    render: () => (
        <React.StrictMode>
            <RTCWellLogViewer />,
        </React.StrictMode>
    ),
};
