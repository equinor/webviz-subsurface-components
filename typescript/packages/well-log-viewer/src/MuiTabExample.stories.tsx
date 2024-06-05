import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import Box from "@mui/material/Box";
//import type { Theme } from "@mui/material";
import { Grid } from "@mui/material";

// eslint-disable-next-line no-restricted-imports
import Tab from "@mui/material/Tab";
// eslint-disable-next-line no-restricted-imports
import Tabs from "@mui/material/Tabs";

import SyncLogViewer from "./SyncLogViewer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require("../../../../example-data/facies3wells.json");

// eslint-disable-next-line @typescript-eslint/naming-convention
type Story = StoryObj<typeof ViewerTabs>;

const RTCWellLogViewer: React.FunctionComponent = () => {
    return (
        <Grid container direction={"column"} justifyContent="flex-start">
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    data-testid="well-log-views"
                    style={{ width: "100%", height: "80vh" }}
                >
                    <SyncLogViewer {...args} />
                </div>
            </div>
        </Grid>
    );
};

// @mui tabs
interface ITabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: ITabPanelProps) => {
    const { children, value, index, ...other } = props;

    const ref = React.useRef(null);

    if (!ref.current && value !== index) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            ref={ref}
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box sx={{ p: 3 }}>{children}</Box>
        </div>
    );
};

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const ViewerTabs: React.FunctionComponent = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ flexDirection: "column" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                    >
                        <Tab label="Tab One" {...a11yProps(0)} />
                        <Tab label="Tab Two" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <Box sx={{ height: "80%" }}>
                    <TabPanel value={value} index={0}>
                        <div> empty tab </div>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Grid
                            container
                            direction="column"
                            justifyContent="flex-start"
                        >
                            <RTCWellLogViewer />
                        </Grid>
                    </TabPanel>
                </Box>
            </Box>
        </Box>
    );
};

export const TabsLayout: Story = {
    render: () => <ViewerTabs />,
};

// storybook page
const meta: Meta<typeof ViewerTabs> = {
    title: "WellLogViewer / Viz Examples / classification layout tabs",
    component: ViewerTabs,
};

export default meta;
