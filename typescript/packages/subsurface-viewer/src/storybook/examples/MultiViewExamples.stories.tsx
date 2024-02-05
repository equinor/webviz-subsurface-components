import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { View } from "@deck.gl/core/typed";
import { ContinuousLegend } from "@emerson-eps/color-tables";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ViewsType } from "../../components/Map";
import { ViewFooter } from "../../components/ViewFooter";

import {
    EditedDataTemplate,
    Root,
    classes,
    colormapLayer,
    customLayerWithPolygonData,
    customLayerWithPolylineData,
    customLayerWithTextData,
    hillshadingLayer,
    hugin2DBounds,
    hugin25mDepthMapLayer,
    hugin25mKhNetmapMapLayer,
    redAxes2DLayer,
    subsufaceProps,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/MutiView",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

export const MultiViewAnnotation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "multi_view_annotation",
        layers: [hugin25mKhNetmapMapLayer, hugin25mDepthMapLayer],
        views: {
            layout: [1, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    layerIds: [hugin25mDepthMapLayer.id],
                },
                {
                    id: "view_2",
                    layerIds: [hugin25mKhNetmapMapLayer.id],
                },
            ],
        },
    },
    render: (args) => (
        <SubsurfaceViewer {...args}>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1">
                    <ContinuousLegend min={-3071} max={41048} />
                    <ViewFooter>kH netmap</ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_2">
                    <ContinuousLegend min={2725} max={3396} />
                    <ViewFooter>Hugin</ViewFooter>
                </View>
            }
        </SubsurfaceViewer>
    ),
};

export const MultiViewsWithEmptyViews: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "view_initialized_as_empty",
        layers: [hugin25mKhNetmapMapLayer, hugin25mDepthMapLayer],
        views: {} as ViewsType,
    },
};

// multiple synced view
export const SyncedMultiView: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...subsufaceProps,
        layers: [
            colormapLayer,
            hillshadingLayer,
            customLayerWithPolylineData,
            customLayerWithPolygonData,
            customLayerWithTextData,
        ],
        views: {
            layout: [2, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    name: "Colormap layer",
                    show3D: false,
                    layerIds: [colormapLayer.id],
                    zoom: -5,
                    isSync: true,
                },
                {
                    id: "view_2",
                    name: "Hill-shading layer",
                    show3D: false,
                    layerIds: [hillshadingLayer.id],
                    zoom: -5,
                    isSync: true,
                },
                {
                    id: "view_3",
                    name: "All layers",
                    show3D: false,
                    layerIds: [],
                    zoom: -5,
                    isSync: false,
                },
                {
                    id: "view_4",
                    name: "Custom layer",
                    show3D: false,
                    layerIds: [
                        customLayerWithPolylineData.id,
                        customLayerWithPolygonData.id,
                        customLayerWithTextData.id,
                    ],
                    zoom: -5,
                    isSync: false,
                },
            ],
        },
    },
    render: (args) => <EditedDataTemplate {...args} />,
};

export const ViewMatrixMargin: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "DeckGL-Map",
        layers: [hugin25mKhNetmapMapLayer, redAxes2DLayer],
        bounds: hugin2DBounds,
        views: {
            layout: [2, 2],
            marginPixels: 10,
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: true,
                },
                {
                    id: "view_2",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: true,
                },
                {
                    id: "view_3",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: false,
                },
                {
                    id: "view_4",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: false,
                },
            ],
        },
    },
    render: (args) => (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...args} />
            </div>
        </Root>
    ),
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    renderHiddenTabs: boolean;
}

const CustomTabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
    const { children, value, index, renderHiddenTabs, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {(value === index || renderHiddenTabs) && (
                <Box sx={{ p: 3 }}>{children}</Box>
            )}
        </div>
    );
};

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const SubsurfaceWrapper: React.FC<SubsurfaceViewerProps> = (
    props: SubsurfaceViewerProps
) => {
    return (
        <div
            style={{
                height: "65vh",
                //width: "50vw",
                position: "relative",
            }}
        >
            <SubsurfaceViewer {...props} />
        </div>
    );
};

type ViewerTabsProps = SubsurfaceViewerProps & { renderHiddenTabs: boolean };

const ViewerTabs: React.FC<ViewerTabsProps> = (props: ViewerTabsProps) => {
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
                        <Tab label="Tab Three" {...a11yProps(2)} />
                    </Tabs>
                </Box>

                <Box sx={{ height: "80%" }}>
                    <CustomTabPanel
                        value={value}
                        index={0}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                    <CustomTabPanel
                        value={value}
                        index={1}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                    <CustomTabPanel
                        value={value}
                        index={2}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                </Box>
            </Box>
        </Box>
    );
};

export const ViewTabs: StoryObj<typeof ViewerTabs> = {
    args: {
        renderHiddenTabs: true,
        id: "DeckGL-Map",
        layers: [hugin25mKhNetmapMapLayer, redAxes2DLayer],
        bounds: hugin2DBounds,
        views: {
            layout: [2, 2],
            marginPixels: 10,
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: true,
                },
                {
                    id: "view_2",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: true,
                },
                {
                    id: "view_3",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: false,
                },
                {
                    id: "view_4",
                    show3D: false,
                    layerIds: [hugin25mKhNetmapMapLayer.id, redAxes2DLayer.id],
                    isSync: false,
                },
            ],
        },
    },
    render: (args) => (
        <Root>
            <ViewerTabs {...args}></ViewerTabs>
        </Root>
    ),
};
