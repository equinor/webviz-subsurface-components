import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import SyncLogViewer from "../SyncLogViewer";

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const args = require("../../../../../example-data/two_logs_example.json");

// storybook page
const meta: Meta<typeof SyncLogViewer> = {
    title: "WellLogViewer/Demo/ExampleData",
};

export default meta;

export const TwoLogs: StoryObj<typeof SyncLogViewer> = {
    render: () => (
        <React.StrictMode>
            <div
                style={{
                    height: "92vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ width: "100%", height: "100%", flex: 1 }}>
                    <SyncLogViewer {...args} />
                </div>
            </div>
        </React.StrictMode>
    ),
};
