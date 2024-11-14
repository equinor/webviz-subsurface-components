import type { Meta, StoryObj } from "@storybook/react";
import { fireEvent } from "@storybook/test";
import React from "react";

import type { PickingInfo, Viewport } from "@deck.gl/core";
import { View } from "@deck.gl/core";
import type { DeckGLRef } from "@deck.gl/react";

import { ContinuousLegend } from "@emerson-eps/color-tables";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
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
} from "../sharedSettings";

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

type PickingInfoProperty = {
    name: string;
    value: number;
    color?: string;
};

type PickingInfoPerView = Record<
    string,
    {
        x: number | null;
        y: number | null;
        properties: PickingInfoProperty[];
    }
>;

class MultiViewPickingInfoAssembler {
    private _deckGl: DeckGLRef | null = null;
    private _multiPicking: boolean;
    private _subscribers: Set<(info: PickingInfoPerView) => void> = new Set();

    constructor(deckGL: DeckGLRef | null, multiPicking: boolean = false) {
        this._deckGl = deckGL;
        this._multiPicking = multiPicking;
    }

    setDeckGL(deckGL: DeckGLRef) {
        this._deckGl = deckGL;
    }

    subscribe(callback: (info: PickingInfoPerView) => void): () => void {
        this._subscribers.add(callback);

        return () => {
            this._subscribers.delete(callback);
        };
    }

    private publish(info: PickingInfoPerView) {
        for (const subscriber of this._subscribers) {
            subscriber(info);
        }
    }

    getMultiViewPickingInfo(hoverEvent: MapMouseEvent) {
        if (!this._deckGl?.deck) {
            return;
        }

        const viewports = this._deckGl.deck?.getViewports();
        if (!viewports) {
            return;
        }

        if (hoverEvent.infos.length === 0) {
            return;
        }

        const activeViewportId = hoverEvent.infos[0].viewport?.id;

        if (!activeViewportId) {
            return;
        }

        const eventScreenCoordinate: [number, number] = [
            hoverEvent.infos[0].x,
            hoverEvent.infos[0].y,
        ];

        this.assembleMultiViewPickingInfo(
            eventScreenCoordinate,
            activeViewportId,
            viewports
        ).then((info) => {
            this.publish(info);
        });
    }

    private async assembleMultiViewPickingInfo(
        eventScreenCoordinate: [number, number],
        activeViewportId: string,
        viewports: Viewport[]
    ): Promise<PickingInfoPerView> {
        return new Promise((resolve, reject) => {
            const deck = this._deckGl?.deck;
            if (!deck) {
                reject("DeckGL not initialized");
                return;
            }
            const activeViewport = viewports.find(
                (el) => el.id === activeViewportId
            );
            if (!activeViewport) {
                reject("Active viewport not found");
                return;
            }

            const activeViewportRelativeScreenCoordinates: [number, number] = [
                eventScreenCoordinate[0] - activeViewport.x,
                eventScreenCoordinate[1] - activeViewport.y,
            ];

            const worldCoordinate = activeViewport.unproject(
                activeViewportRelativeScreenCoordinates
            );

            const collectedPickingInfo: PickingInfoPerView = {};
            for (const viewport of viewports) {
                const [relativeScreenX, relativeScreenY] =
                    viewport.project(worldCoordinate);

                let pickingInfo: PickingInfo[] = [];
                if (this._multiPicking) {
                    pickingInfo = deck.pickMultipleObjects({
                        x: relativeScreenX + viewport.x,
                        y: relativeScreenY + viewport.y,
                        unproject3D: true,
                    });
                } else {
                    const obj = deck.pickObject({
                        x: relativeScreenX + viewport.x,
                        y: relativeScreenY + viewport.y,
                        unproject3D: true,
                    });
                    pickingInfo = obj ? [obj] : [];
                }

                if (pickingInfo) {
                    const collectedProperties: PickingInfoProperty[] = [];
                    for (const info of pickingInfo) {
                        if (
                            !("properties" in info) ||
                            !Array.isArray(info.properties)
                        ) {
                            continue;
                        }

                        const properties = info.properties;

                        for (const property of properties) {
                            collectedProperties.push({
                                name: property.name,
                                value: property.value,
                                color: property.color,
                            });
                        }
                    }

                    collectedPickingInfo[viewport.id] = {
                        x: worldCoordinate[0],
                        y: worldCoordinate[1],
                        properties: collectedProperties,
                    };
                } else {
                    collectedPickingInfo[viewport.id] = {
                        x: null,
                        y: null,
                        properties: [],
                    };
                }
            }

            resolve(collectedPickingInfo);
        });
    }
}

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
                {props.pickingInfoPerView[props.viewId]?.x?.toFixed(3) ?? "-"}
            </div>
            <div>Y:</div>
            <div>
                {props.pickingInfoPerView[props.viewId]?.y?.toFixed(3) ?? "-"}
            </div>
            {props.pickingInfoPerView[props.viewId]?.properties?.map(
                (el, i) => (
                    <React.Fragment key={`${el.name}-${i}`}>
                        <div>{el.name}</div>
                        <div>{el.value.toFixed(3)}</div>
                    </React.Fragment>
                )
            ) ?? ""}
        </div>
    );
}

function MultiViewPickingExample(
    props: SubsurfaceViewerProps
): React.ReactNode {
    const [pickingInfoPerView, setPickingInfoPerView] =
        React.useState<PickingInfoPerView>(
            props.views?.viewports.reduce((acc, viewport) => {
                acc[viewport.id] = {
                    x: null,
                    y: null,
                    properties: [],
                };
                return acc;
            }, {} as PickingInfoPerView) ?? {}
        );

    const deckGlRef = React.useRef<DeckGLRef>(null);
    const assembler = React.useRef<MultiViewPickingInfoAssembler | null>(null);

    React.useEffect(function onMountEffect() {
        assembler.current = new MultiViewPickingInfoAssembler(
            deckGlRef.current
        );

        const unsubscribe = assembler.current.subscribe((info) => {
            setPickingInfoPerView(info);
        });

        return function onUnmountEffect() {
            unsubscribe();
        };
    }, []);

    function handleMouseEvent(event: MapMouseEvent) {
        if (event.type === "hover") {
            assembler.current?.getMultiViewPickingInfo(event);
        }
    }

    return (
        <div style={{ width: "100%", height: "90vh", position: "relative" }}>
            <SubsurfaceViewer
                {...props}
                deckGlRef={deckGlRef}
                onMouseEvent={handleMouseEvent}
                coords={{
                    visible: false,
                    multiPicking: true,
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
    play: async () => {
        const delay = 500;
        const canvas = document.querySelector("canvas");

        if (!canvas) {
            return;
        }

        const leftViewCenterPosition = {
            x: canvas.clientLeft + canvas.clientWidth / 4,
            y: canvas.clientTop + canvas.clientHeight / 2,
        };

        await fireEvent.mouseMove(canvas, { clientX: 0, clientY: 0, delay });
        await fireEvent.mouseMove(canvas, {
            clientX: leftViewCenterPosition.x,
            clientY: leftViewCenterPosition.y,
            delay,
        });
    },
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

    // @ts-expect-error TS6133
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
