import type { Meta, StoryObj } from "@storybook/react";
import { fireEvent, userEvent } from "@storybook/test";
import React from "react";

import { View } from "@deck.gl/core";
import { useMultiViewPicking } from "../../hooks/useMultiViewPicking";
import { useMultiViewCursorTracking } from "../../hooks/useMultiViewCursorTracking";
import type { PickingInfoPerView } from "../../hooks/useMultiViewPicking";

import { ContinuousLegend } from "@emerson-eps/color-tables";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ViewStateType } from "../../SubsurfaceViewer";
import type { MapMouseEvent, ViewsType } from "../../components/Map";
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
    hugin25mDepthMapLayer,
    hugin25mKhNetmapMapLayer,
    hugin2DBounds,
    redAxes2DLayer,
    subsufaceProps,
    volveWellsLayer,
} from "../sharedSettings";
import type { DeckGLRef } from "@deck.gl/react";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/MutiView",
    args: {
        // Add some common controls for all the stories.
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

function ExampleReadoutComponent(props: {
    viewId: string;
    pickingInfoPerView: PickingInfoPerView;
}): React.ReactNode {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                background: "#fff",
                padding: 8,
                borderRadius: 4,
                display: "grid",
                gridTemplateColumns: "8rem auto",
                border: "1px solid #ccc",
            }}
        >
            <div>X:</div>
            <div>
                {props.pickingInfoPerView[props.viewId]?.coordinates
                    ?.at(0)
                    ?.toFixed(3) ?? "-"}
            </div>
            <div>Y:</div>
            <div>
                {props.pickingInfoPerView[props.viewId]?.coordinates
                    ?.at(1)
                    ?.toFixed(3) ?? "-"}
            </div>
            {props.pickingInfoPerView[props.viewId]?.layerPickingInfo.map(
                (el) => (
                    <React.Fragment key={`${el.layerId}`}>
                        <div style={{ fontWeight: "bold" }}>{el.layerName}</div>
                        {el.properties.map((prop, i) => (
                            <React.Fragment key={`${el.layerId}-${i}}`}>
                                <div style={{ gridColumn: 1 }}>{prop.name}</div>
                                <div>
                                    {typeof prop.value === "string"
                                        ? prop.value
                                        : prop.value.toFixed(3)}
                                </div>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                )
            ) ?? ""}
        </div>
    );
}

function MultiViewPickingExample(
    props: SubsurfaceViewerProps
): React.ReactNode {
    const deckGlRef = React.useRef<DeckGLRef>(null);
    const [mouseHover, setMouseHover] = React.useState<boolean>(false);
    const [cameraPosition, setCameraPosition] = React.useState<
        ViewStateType | undefined
    >(undefined);

    const { getPickingInfo, activeViewportId, pickingInfoPerView } =
        useMultiViewPicking({
            deckGlRef,
            multiPicking: true,
            pickDepth: 6,
        });

    function handleMouseEvent(event: MapMouseEvent) {
        if (event.type === "hover") {
            getPickingInfo(event);
        }
    }

    const viewports = props.views?.viewports ?? [];
    const layers = props.layers ?? [];

    const { viewports: adjustedViewports, layers: adjustedLayers } =
        useMultiViewCursorTracking({
            activeViewportId,
            worldCoordinates:
                pickingInfoPerView[activeViewportId]?.coordinates ?? null,
            viewports,
            layers,
            crosshairProps: {
                color: [255, 255, 255, 255],
                sizePx: 32,
                visible: mouseHover,
            },
        });

    return (
        <div
            style={{ width: "100%", height: "90vh", position: "relative" }}
            onMouseEnter={() => setMouseHover(true)}
            onMouseLeave={() => setMouseHover(false)}
            onBlur={() => setMouseHover(false)}
            onFocus={() => setMouseHover(true)}
        >
            <SubsurfaceViewer
                {...props}
                getCameraPosition={(position) => setCameraPosition(position)}
                layers={adjustedLayers}
                views={{
                    ...props.views,

                    viewports: adjustedViewports,
                    layout: props.views?.layout ?? [1, 2],
                }}
                deckGlRef={deckGlRef}
                cameraPosition={cameraPosition}
                onMouseEvent={handleMouseEvent}
                showReadout={false}
                scale={{
                    visible: true,
                    cssStyle: {
                        right: 10,
                        top: 10,
                    },
                }}
            >
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_1">
                        <ContinuousLegend min={-3071} max={41048} />
                        <ViewFooter>kH netmap</ViewFooter>
                        <ExampleReadoutComponent
                            viewId="view_1"
                            pickingInfoPerView={pickingInfoPerView}
                        />
                    </View>
                }
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_2">
                        <ContinuousLegend min={2725} max={3396} />
                        <ViewFooter>Hugin</ViewFooter>
                        <ExampleReadoutComponent
                            viewId="view_2"
                            pickingInfoPerView={pickingInfoPerView}
                        />
                    </View>
                }
            </SubsurfaceViewer>
        </div>
    );
}

export const MultiViewPicking: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "multi_view_picking",
        layers: [hugin25mKhNetmapMapLayer, hugin25mDepthMapLayer],
        views: {
            layout: [1, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    layerIds: [hugin25mDepthMapLayer.id],
                    isSync: true,
                },
                {
                    id: "view_2",
                    layerIds: [hugin25mKhNetmapMapLayer.id],
                    isSync: true,
                },
            ],
        },
    },
    render: (args) => <MultiViewPickingExample {...args} />,
    play: async (args) => {
        const delay = 500;
        const canvas = document.querySelector("canvas");

        if (canvas) {
            await userEvent.click(canvas, { delay });
        }

        const layout = args.args.views?.layout;

        if (!canvas || !layout) {
            return;
        }

        const leftViewCenterPosition = {
            x: canvas.clientLeft + canvas.clientWidth / layout[1] / 2,
            y: canvas.clientTop + canvas.clientHeight / layout[0] / 2,
        };

        await userEvent.hover(canvas, { delay });

        await fireEvent.mouseMove(canvas, { clientX: 0, clientY: 0, delay });
        await fireEvent.mouseMove(canvas, {
            clientX: leftViewCenterPosition.x,
            clientY: leftViewCenterPosition.y,
            delay,
        });
    },
};

export const MultiViewPickingWithWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "multi_view_picking",
        layers: [
            hugin25mKhNetmapMapLayer,
            hugin25mDepthMapLayer,
            volveWellsLayer,
        ],
        views: {
            layout: [1, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    layerIds: [hugin25mDepthMapLayer.id, volveWellsLayer.id],
                    isSync: true,
                },
                {
                    id: "view_2",
                    layerIds: [hugin25mKhNetmapMapLayer.id],
                    isSync: true,
                },
            ],
        },
    },
    render: (args) => <MultiViewPickingExample {...args} />,
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

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
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

const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    gridLines: true,
    material: true,
    colorMapName: "Rainbow",
    ZIncreasingDownwards: false,
    pickable: true,
    opacity: 1.0,
    pointsData: "vtk-grid/Simgrid_points.json",
    polysData: "vtk-grid/Simgrid_polys.json",
    propertiesData: "vtk-grid/Simgrid_scalar.json",
};

export const MultiViewPickingCrash: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "multi_view_picking",
        layers: [grid3dLayer],
        views: {
            layout: [1, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    layerIds: [grid3dLayer.id],
                    isSync: true,
                    show3D: true,
                },
                {
                    id: "view_2",
                    layerIds: [grid3dLayer.id],
                    isSync: false,
                    show3D: true,
                },
            ],
        },
        verticalScale: 1.025,
    },
    render: (args) => <MultiViewWithCameraError {...args} />,
};

function MultiViewWithCameraError(
    props: SubsurfaceViewerProps
): React.ReactNode {
    const [cameraPosition, setCameraPosition] = React.useState<
        ViewStateType | undefined
    >(undefined);

    return (
        <SubsurfaceViewer
            {...props}
            getCameraPosition={setCameraPosition}
            cameraPosition={cameraPosition}
        ></SubsurfaceViewer>
    );
}
