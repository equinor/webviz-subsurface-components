import React, { useCallback, useMemo, useState } from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import type { PickingInfo } from "@deck.gl/core/typed";
import { View } from "@deck.gl/core/typed";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import type { SubsurfaceViewerProps, LightsType } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";
import type {
    MapMouseEvent,
    TooltipCallback,
    ViewStateType,
    ViewsType,
    BoundingBox3D,
} from "./components/Map";
import { WellsLayer, MapLayer, AxesLayer, Grid3DLayer } from "./layers";
import InfoCard from "./components/InfoCard";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "./layers/utils/layerTools";
import type { WellsPickInfo } from "./layers/wells/wellsLayer";
import type { Feature } from "geojson";
import { ViewFooter } from "./components/ViewFooter";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import { SphereGeometry } from "@luma.gl/engine";
import {
    Points as SnubCubePoints,
    Faces as SnubCubeFaces,
    VertexCount as SnubCubeVertexCount,
} from "./layers/grid3d/test_data/TruncatedSnubCube";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers/typed";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer",
    tags: ["screenshot-test"],
};

const classes = {
    main: "default-main",
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        width: 750,
        height: 500,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid black",
        background: "azure",
        position: "absolute",
    },
});

const defaultWellsProps = {
    id: "volve-wells",
    data: "./volve_wells.json",
};

const defaultWellsLayer = new WellsLayer({
    ...defaultWellsProps,
});

const defaultProps = {
    id: "volve-wells",
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number,
    ],
    layers: [defaultWellsLayer],
};

const wellsLayerWithlogs = new WellsLayer({
    ...defaultWellsProps,
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "PORO",
    logColor: "Physics",
});

const meshMapLayerBig = new MapLayer({
    id: "mesh-layer",
    meshData: "hugin_depth_5_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [1451, 1141],
        increment: [5, 5],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_5_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    colorMapName: "Physics",
});

const Template: ComponentStory<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

function mdTooltip(info: PickingInfo) {
    if (!info.picked) return null;
    const value = (info as WellsPickInfo)?.properties?.[0].value;
    if (!value) return null;
    const f = format(".2f");
    const niceValue = f(+value);
    return "MD: " + niceValue;
}

export const TooltipApi = Template.bind({});
TooltipApi.args = {
    ...defaultProps,
    layers: [
        new WellsLayer({
            ...defaultWellsProps,
            lineStyle: { width: 7 },
        }),
    ],
    getTooltip: mdTooltip,
    bounds: [433000, 6476000, 439000, 6480000],
};

TooltipApi.parameters = {
    docs: {
        description: {
            story: "Example of overriding the default tooltip, showing measured depth (MD) instead of the default bahaviour, which is to show the well name.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const TooltipStyle = Template.bind({});

const processPropInfo = (
    properties: PropertyDataType[] | undefined,
    filter: string[] | boolean
): string => {
    if (!properties) {
        return "";
    }

    let outputString = "";

    if (typeof filter == "boolean") {
        if (filter) {
            properties.forEach((ppobj) => {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            });
        }
    } else {
        // filter is not boolean - thus it is a string array and we should check each property
        properties.forEach((ppobj) => {
            if (filter.includes(ppobj["name"] as string)) {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            }
        });
    }
    return outputString;
};

const tooltipImpFunc: TooltipCallback = (
    info: PickingInfo
): Record<string, unknown> | string | null => {
    if (!info.picked || !info.layer) {
        return null;
    }
    const outputObject: Record<string, unknown> = {};
    const layerName = info.layer.constructor.name;
    let outputString = "";
    if (layerName === "Map3DLayer") {
        const layerProps = info.layer.props as unknown as ExtendedLayerProps;
        const layerName = layerProps.name;
        const properties = (info as LayerPickInfo).properties;
        outputString += `Property: ${layerName}`;
        outputString += processPropInfo(properties, true);
    } else if (layerName === "WellsLayer") {
        const wellsPickInfo = info as WellsPickInfo;
        const wellsPickInfoObject = info.object as Feature;
        const wellProperties = wellsPickInfoObject.properties;
        const name = (wellProperties as { name: string }).name;
        outputString += `Well: ${name || ""}`;
        if (wellsPickInfo.featureType !== "points") {
            outputString += processPropInfo(wellsPickInfo.properties, true);
        }
    }
    outputObject["text"] = outputString;
    outputObject["style"] = { color: "yellow" };
    return outputObject;
};

TooltipStyle.args = {
    ...defaultProps,
    layers: [
        new WellsLayer({
            ...defaultWellsProps,
            lineStyle: { width: 7 },
        }),
    ],
    getTooltip: tooltipImpFunc,
    bounds: [433000, 6476000, 439000, 6480000],
};

TooltipStyle.parameters = {
    docs: {
        description: {
            story: "Example of overriding tooltip style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

const CustomTemplate: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const [state, setState] = React.useState(args.cameraPosition);

    const getCameraPosition = React.useCallback((input: ViewStateType) => {
        setState(input);
        return input;
    }, []);
    return (
        <>
            <SubsurfaceViewer
                {...args}
                cameraPosition={args.cameraPosition}
                getCameraPosition={getCameraPosition}
            />
            <div
                style={{
                    position: "absolute",
                    marginLeft: 200,
                }}
            >
                <div>zoom: {state?.zoom}</div>
                <div>rotationX: {state?.rotationX}</div>
                <div>rotationOrbit: {state?.rotationOrbit}</div>
                <div>targetX: {state?.target[0]}</div>
                <div>targetY: {state?.target[1]}</div>
            </div>
        </>
    );
};

export const customizedCameraPosition = CustomTemplate.bind({});
const cameraPosition: ViewStateType = {
    target: [437500, 6475000],
    zoom: -5.0,
    rotationX: 90,
    rotationOrbit: 0,
};

customizedCameraPosition.args = {
    ...defaultProps,
    cameraPosition,
};

const mapProps = {
    id: "kh_netmap",
    meshData: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800] as [number, number],
        count: [291, 229] as [number, number],
        increment: [25, 25] as [number, number],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_25_m.float32",
    contours: [0, 100] as [number, number],
    material: false,
};

const netmapLayer = new MapLayer({ ...mapProps });
const huginLayer = new MapLayer({
    ...mapProps,
    id: "hugin",
    propertiesData: "hugin_depth_25_m.float32",
});

const MultiViewAnnotationTemplate: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => (
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
);

export const MultiViewAnnotation = MultiViewAnnotationTemplate.bind({});

MultiViewAnnotation.args = {
    id: "multi_view_annotation",
    layers: [netmapLayer, huginLayer],
    views: {
        layout: [1, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin"],
            },
            {
                id: "view_2",
                layerIds: ["kh_netmap"],
            },
        ],
    },
};

export const ViewObjectInitializedAsEmpty = MultiViewAnnotationTemplate.bind(
    {}
);

ViewObjectInitializedAsEmpty.args = {
    id: "view_initialized_as_empty",
    layers: [netmapLayer, huginLayer],
    views: {} as ViewsType,
};

const wellsLayerNoDepthTest = new WellsLayer({
    ...defaultWellsProps,
    id: "wells-layer-no-depth-test",
    depthTest: false,
});

export const DepthTest: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const props = {
        ...args,
        layers: [huginLayer, defaultWellsLayer, wellsLayerNoDepthTest],
    };

    return (
        <>
            <div>
                <SubsurfaceViewer {...props} />
            </div>
            <h4>
                View on the right depthTest for the wells layer property is set
                to false and wells layer is given last so that it will be
                painted on top. On the left parts of the wells are hidden
                beneath the surface.
            </h4>
        </>
    );
};

DepthTest.args = {
    id: "DepthTest",
    views: {
        layout: [1, 2],
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin", "volve-wells"],
                show3D: false,
                isSync: true,
            },
            {
                id: "view_2",
                layerIds: ["hugin", "wells-layer-no-depth-test"],
                show3D: false,
                isSync: true,
            },
        ],
    },
};

DepthTest.parameters = {
    docs: {
        description: {
            story: "Example using the depthTest property. If this is set to false it will disable depth testing for the layer",
        },
    },
};

function getReadout(event: MapMouseEvent) {
    const pickInfo = event.infos;
    return <InfoCard pickInfos={pickInfo} />;
}

const MouseEventStory = (args: { show3d: boolean }) => {
    const [event, setEvent] = useState<MapMouseEvent>({
        type: "click",
        infos: [],
    });

    const handleEvent = useCallback(
        (event: MapMouseEvent) => {
            setEvent(event);
        },
        [setEvent]
    );

    const useProps = useMemo(() => {
        const props = {
            ...defaultProps,
            layers: [wellsLayerWithlogs, netmapLayer],
            onMouseEvent: handleEvent,
            views: {
                layout: [1, 1] as [number, number],
                viewports: [{ id: "test", show3D: args.show3d }],
            },
            coords: { visible: false },
        };
        return props;
    }, [handleEvent, args.show3d]);

    return (
        <SubsurfaceViewer {...useProps}>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="test">
                    {getReadout(event)}
                    <ViewFooter>Mouse event example</ViewFooter>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const MouseEvent: ComponentStory<typeof MouseEventStory> = (args) => {
    return <MouseEventStory {...args} />;
};

MouseEvent.args = {
    show3d: true,
};

const ViewStateSynchronizationStory = (args: {
    show3d: boolean;
    sync: string[];
}) => {
    const subsurfaceViewerArgs = {
        id: "view_state_synchronization",
        layers: [netmapLayer, huginLayer, defaultWellsLayer],
        views: {
            layout: [2, 2] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    layerIds: ["hugin"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_1"),
                },
                {
                    id: "view_2",
                    layerIds: ["kh_netmap"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_2"),
                },
                {
                    id: "view_3",
                    layerIds: ["volve-wells"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_3"),
                },
                {
                    id: "view_4",
                    layerIds: ["volve-wells", "hugin"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_4"),
                },
            ],
        },
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const ViewStateSynchronization: ComponentStory<
    typeof ViewStateSynchronizationStory
> = (args) => {
    return <ViewStateSynchronizationStory {...args} />;
};

ViewStateSynchronization.args = {
    show3d: false,
    sync: ["view_1", "view_2", "view_3", "view_4"],
};

ViewStateSynchronization.argTypes = {
    sync: {
        options: ["view_1", "view_2", "view_3", "view_4"],
        control: "check",
    },
};

export const IsRenderedCallback = (args: SubsurfaceViewerProps) => {
    const [layers, setLayers] = React.useState([defaultWellsLayer] as [
        WellsLayer,
        MapLayer?,
    ]);
    const [label, setLabel] = React.useState("");

    const handleChange = () => {
        if (layers.length === 1) {
            setLayers([defaultWellsLayer, meshMapLayerBig]);
        } else if (layers.length === 2) {
            setLayers([]);
        } else {
            setLayers([defaultWellsLayer]);
        }
    };

    const props = {
        ...args,
        isRenderedCallback: (isLoaded: boolean) => {
            console.log("isRenderedCallback", isLoaded);
            setLabel(isLoaded ? "LOADED" : "NOT LOADED");
            return;
        },
        layers,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <label>{"Add big map layer "}</label>
            <Switch onClick={handleChange} />
            <label>{label}</label>
        </Root>
    );
};

IsRenderedCallback.args = {
    id: "DeckGL-Map",
    layers: [meshMapLayerBig, defaultWellsLayer],
    bounds: [432150, 6475800, 439400, 6481501],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

IsRenderedCallback.parameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
        description: {
            story: "IsRenderedCallback will report in console when triggered",
        },
    },
};

export const LightsStory = (args: SubsurfaceViewerProps) => {
    const [headLight, setHeadLight] = React.useState(false);
    const [ambientLight, setAmbientLight] = React.useState(false);
    const [pointLight, setPointLight] = React.useState(false);
    const [directionalLight, setDirectionalLight] = React.useState(false);

    const [headLightIntensity, setHeadLightIntensity] = React.useState(1.0);
    const [ambientLightIntensity, setAmbientLightIntensity] =
        React.useState(1.0);
    const [pointLightIntensity, setPointLightIntensity] = React.useState(1.0);
    const [directionslLightIntensity, setDirectionslLightIntensity] =
        React.useState(1.0);

    let lights = {} as LightsType;

    if (headLight) {
        lights = { ...lights, headLight: { intensity: headLightIntensity } };
    }
    if (ambientLight) {
        lights = {
            ...lights,
            ambientLight: { intensity: ambientLightIntensity },
        };
    }

    if (pointLight) {
        lights = {
            ...lights,
            pointLights: [
                {
                    intensity: pointLightIntensity,
                    position: [-50, -50, -50],
                    color: [0, 255, 0],
                },
            ],
        };
    }

    if (directionalLight) {
        lights = {
            ...lights,
            directionalLights: [
                {
                    intensity: directionslLightIntensity,
                    direction: [-1, 0, -1],
                    color: [255, 0, 0],
                },
            ],
        };
    }

    const props = {
        lights,
        ...args,
    };

    return (
        <Root>
            <Stack direction={"row"} alignItems={"center"} spacing={10}>
                <Stack>
                    <Stack direction={"row"} alignItems={"center"}>
                        <label>{"Head Light "}</label>
                        <Switch
                            onClick={() => {
                                setHeadLight(!headLight);
                            }}
                        />
                    </Stack>
                    <Slider
                        defaultValue={100}
                        valueLabelDisplay={"auto"}
                        onChange={(_event: Event, value: number | number[]) => {
                            setHeadLightIntensity((value as number) / 100);
                        }}
                    />
                </Stack>

                <Stack>
                    <Stack direction={"row"} alignItems={"center"}>
                        <label>{"Ambient Light "}</label>
                        <Switch
                            onClick={() => {
                                setAmbientLight(!ambientLight);
                            }}
                        />
                    </Stack>
                    <Slider
                        defaultValue={100}
                        valueLabelDisplay={"auto"}
                        onChange={(_event: Event, value: number | number[]) => {
                            setAmbientLightIntensity((value as number) / 100);
                        }}
                    />
                </Stack>

                <Stack>
                    <Stack direction={"row"} alignItems={"center"}>
                        <label>{"Point Light "}</label>
                        <Switch
                            onClick={() => {
                                setPointLight(!pointLight);
                            }}
                        />
                    </Stack>
                    <Slider
                        defaultValue={100}
                        valueLabelDisplay={"auto"}
                        onChange={(_event: Event, value: number | number[]) => {
                            setPointLightIntensity((value as number) / 100);
                        }}
                    />
                </Stack>

                <Stack>
                    <Stack direction={"row"} alignItems={"center"}>
                        <label>{"Directional Light "}</label>
                        <Switch
                            onClick={() => {
                                setDirectionalLight(!directionalLight);
                            }}
                        />
                    </Stack>
                    <Slider
                        defaultValue={100}
                        valueLabelDisplay={"auto"}
                        onChange={(_event: Event, value: number | number[]) => {
                            setDirectionslLightIntensity(
                                (value as number) / 100
                            );
                        }}
                    />
                </Stack>
            </Stack>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
        </Root>
    );
};

LightsStory.args = {
    id: "DeckGL-Map",
    bounds: [-100, -100, 50, 50],
    layers: [
        new AxesLayer({
            id: "polyhedral-cells-axes",
            bounds: [-100, -50, -50, 50, 50, 50],
        }),
        new SimpleMeshLayer({
            id: "sphere",
            data: [{}],
            mesh: new SphereGeometry({
                nlat: 100,
                nlong: 100,
                radius: 30,
            }),
            wireframe: false,
            getPosition: [-75, 0, 0],
            getColor: [255, 255, 255],
            material: true,
        }),
        new Grid3DLayer({
            id: "Grid3DLayer",
            material: true,
            colorMapFunction: () => [255, 255, 255],
            pointsData: SnubCubePoints.map((v) => 35 * v),
            polysData: SnubCubeFaces,
            propertiesData: Array(SnubCubeVertexCount).fill(0),
        }),
    ],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

LightsStory.parameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
        description: {
            story: "Using different light sources",
        },
    },
};

const zoomBox3D: BoundingBox3D = [-325, -450, -25, 125, 150, 125];
//const zoomBox3D: BoundingBox3D = [-100, -100, -100,  100, 100, 100];

export const AutoZoomToBoxStory = (args: SubsurfaceViewerProps) => {
    const [rotX, setRotX] = React.useState(0);
    const [rotZ, setRotZ] = React.useState(0);

    const cameraPosition: ViewStateType = {
        rotationX: rotX,
        rotationOrbit: rotZ,
        zoom: zoomBox3D,
        target: [0, 0, 0],
    };

    const props = {
        ...args,
        cameraPosition,
    };

    return (
        <Root>
            <label>{"Rotation X Axis "}</label>
            <Slider
                defaultValue={50}
                valueLabelDisplay={"auto"}
                onChange={(_event: Event, value: number | number[]) => {
                    const angle = 2 * ((value as number) / 100 - 0.5) * 90;
                    setRotX(angle);
                }}
            />
            <label>{"Rotation Z Axis "}</label>
            <Slider
                defaultValue={50}
                valueLabelDisplay={"auto"}
                onChange={(_event: Event, value: number | number[]) => {
                    const angle = 2 * ((value as number) / 100 - 0.5) * 180;
                    setRotZ(angle);
                }}
            />
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
        </Root>
    );
};

AutoZoomToBoxStory.args = {
    id: "DeckGL-Map",
    layers: [
        new AxesLayer({
            id: "polyhedral-cells-axes",
            bounds: zoomBox3D,
            ZIncreasingDownwards: false,
        }),
        new SimpleMeshLayer({
            id: "sphere",
            data: [{}],
            mesh: new SphereGeometry({
                nlat: 100,
                nlong: 100,
                radius: 10,
            }),
            wireframe: false,
            getPosition: [0, 0, 0],
            getColor: [255, 255, 255],
            material: true,
        }),
    ],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

AutoZoomToBoxStory.parameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
        description: {
            story: "",
        },
    },
};

AutoZoomToBoxStory.tags = ["screenshot-test"];
