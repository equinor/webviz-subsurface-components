import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import type { Layer } from "@deck.gl/core";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers/typed";
import { SphereGeometry } from "@luma.gl/engine";

import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { SubsurfaceViewerProps, LightsType } from "../../SubsurfaceViewer";
import { AxesLayer, Grid3DLayer } from "../../layers";
import {
    Points as SnubCubePoints,
    Faces as SnubCubeFaces,
    VertexCount as SnubCubeVertexCount,
} from "../../layers/grid3d/test_data/TruncatedSnubCube";

import {
    mainStyle as defaultmainStyle,
    default3DViews,
    huginMapDepthPropLayerPng,
    huginMeshMapLayerPng,
    volveWellsLayer,
    hugin2DBounds,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/Rendering",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

const classes = {
    main: "default-main",
    mainWithButton: "main-with-button",
};

const Root = styled("div")({
    ...defaultmainStyle,
    [`& .${classes.mainWithButton}`]: {
        height: 500,
        border: "1px solid black",
        background: "azure",
        position: "relative",
    },
});

const volveWellsNoDepthTestLayer = {
    ...volveWellsLayer,
    id: "wells-layer-no-depth-test",
    depthTest: false,
};

export const DepthTest: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "DepthTest",
        layers: [
            huginMapDepthPropLayerPng,
            volveWellsLayer,
            volveWellsNoDepthTestLayer,
        ],
        views: {
            layout: [1, 2],
            viewports: [
                {
                    id: "view_1",
                    layerIds: [
                        huginMapDepthPropLayerPng.id,
                        volveWellsLayer.id,
                    ],
                    show3D: false,
                    isSync: true,
                },
                {
                    id: "view_2",
                    layerIds: [
                        huginMapDepthPropLayerPng.id,
                        volveWellsNoDepthTestLayer.id,
                    ],
                    show3D: false,
                    isSync: true,
                },
            ],
        },
    },
    parameters: {
        docs: {
            description: {
                story: "Example using the depthTest property. If this is set to false it will disable depth testing for the layer",
            },
        },
    },
    render: (args) => (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...args} />
            </div>
            <h4>
                View on the right depthTest for the wells layer property is set
                to false and wells layer is given last so that it will be
                painted on top. On the left parts of the wells are hidden
                beneath the surface.
            </h4>
        </Root>
    ),
};

const IsRenderedComponent: React.FC<SubsurfaceViewerProps> = (
    props: SubsurfaceViewerProps
) => {
    const [layers, setLayers] = React.useState<Record<string, unknown>[]>([
        volveWellsLayer,
    ]);
    const [label, setLabel] = React.useState("");

    const handleChange = () => {
        if (layers.length === 1) {
            setLayers([volveWellsLayer, huginMeshMapLayerPng]);
        } else if (layers.length === 2) {
            setLayers([]);
        } else {
            setLayers([volveWellsLayer]);
        }
    };

    const props2 = {
        ...props,
        onRenderedProgress: (progress: number) => {
            console.log("onRenderedProgress", progress);
            setLabel(progress === 100 ? "LOADED" : `${progress} %`);
        },
        layers,
    };

    return (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props2} />
            </div>
            <label>{"Add big map layer "}</label>
            <button onClick={handleChange}>Change layers</button>
            <label>State from onRenderedProgress: {label}</label>
        </Root>
    );
};

export const IsRenderedCallback: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "DeckGL-Map",
        layers: [huginMeshMapLayerPng, volveWellsLayer],
        bounds: hugin2DBounds,
        views: {
            layout: [1, 1],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
    },
    parameters: {
        docs: {
            inlineStories: false,
            iframeHeight: 500,
            description: {
                story: "IsRenderedCallback will report in console when triggered",
            },
        },
    },
    render: (args) => <IsRenderedComponent {...args} />,
};

const LightsStoryComponent: React.FC<SubsurfaceViewerProps> = (
    args: SubsurfaceViewerProps
) => {
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
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props} />
            </div>
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
        </Root>
    );
};

export const LightsStory: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "DeckGL-Map",
        bounds: [-100, -100, 50, 50],
        layers: [
            new AxesLayer({
                id: "polyhedral-cells-axes",
                bounds: [-100, -50, -50, 50, 50, 50],
            }),
            // unfortunately, SimpleMeshLayer can not be specified as a Record<string, any> :(
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
            }) as Layer<Record<string, never>>,
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            inlineStories: false,
            iframeHeight: 500,
            description: {
                story: "Using different light sources",
            },
        },
    },
    render: (args) => <LightsStoryComponent {...args} />,
};
