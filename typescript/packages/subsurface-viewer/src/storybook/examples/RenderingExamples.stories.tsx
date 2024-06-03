import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import type { Layer } from "@deck.gl/core";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers/typed";
import { SphereGeometry } from "@luma.gl/engine";

import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
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
    mainStyle,
    default3DViews,
    defaultStoryParameters,
    hugin25mDepthMapLayer,
    hugin25mKhNetmapMapLayerPng,
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
    ...mainStyle,
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
            hugin25mDepthMapLayer,
            volveWellsLayer,
            volveWellsNoDepthTestLayer,
        ],
        views: {
            layout: [1, 2],
            viewports: [
                {
                    id: "view_1",
                    layerIds: [hugin25mDepthMapLayer.id, volveWellsLayer.id],
                    show3D: false,
                    isSync: true,
                },
                {
                    id: "view_2",
                    layerIds: [
                        hugin25mDepthMapLayer.id,
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
            setLayers([volveWellsLayer, hugin25mKhNetmapMapLayerPng]);
        } else if (layers.length === 2) {
            setLayers([]);
        } else {
            setLayers([volveWellsLayer]);
        }
    };

    const props2 = {
        ...props,
        onRenderingProgress: (progress: number) => {
            console.log("onRenderingProgress", progress);
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
            <label>State from onRenderingProgress: {label}</label>
        </Root>
    );
};

export const IsRenderedCallback: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "DeckGL-Map",
        layers: [hugin25mKhNetmapMapLayerPng, volveWellsLayer],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "IsRenderedCallback will report in console when triggered",
            },
        },
    },
    render: (args) => <IsRenderedComponent {...args} />,
};

interface ICoordinates {
    x: number;
    y: number;
    z: number;
}

type IColor = [number, number, number];

interface ILight {
    active: boolean;
    label: string;
    intensity: number;
    color: IColor;
    coordinates?: ICoordinates;
}

interface CoordInputProps {
    label: string;
    value: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: any;
}

function CoordField({ label, value, setValue: setCoord }: CoordInputProps) {
    const handleChange = (event) => {
        const { value } = event.target;
        // Allow only valid float numbers with up to two decimal places
        if (/^-?\d*\.?\d{0,2}$/.test(value)) {
            setCoord(value);
        }
    };

    return (
        <TextField
            label={label}
            value={value}
            onChange={handleChange}
            inputProps={{
                inputMode: "decimal",
                pattern: "^-?d*.?d{0,2}$",
            }}
            size="small"
            style={{ width: 80 }}
        />
    );
}

interface CoordinatesEditorProps {
    label: string;
    coordinates: ICoordinates;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCoordinates: any;
}

function CoordinatesEditor({
    label,
    coordinates,
    setCoordinates,
}: CoordinatesEditorProps) {
    return (
        <>
            <label>{label}</label>
            <CoordField
                label="X"
                value={coordinates.x}
                setValue={(val) => setCoordinates({ ...coordinates, x: val })}
            />
            <CoordField
                label="Y"
                value={coordinates.y}
                setValue={(val) => setCoordinates({ ...coordinates, y: val })}
            />
            <CoordField
                label="Z"
                value={coordinates.z}
                setValue={(val) => setCoordinates({ ...coordinates, z: val })}
            />
        </>
    );
}

interface LightEditorProps {
    lightName: string;
    light: ILight | ILight[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLight: any;
}

function LightEditor({ lightName, light, setLight }: LightEditorProps) {
    if (!Array.isArray(light)) {
        return (
            <Stack>
                <Stack direction={"row"} alignItems={"center"}>
                    <label>{lightName}</label>
                    <Switch
                        value={true}
                        onClick={() => {
                            setLight({ ...light, active: !light.active });
                        }}
                    />
                </Stack>
                <Slider
                    defaultValue={100 * light.intensity}
                    min={0}
                    max={100}
                    valueLabelDisplay={"auto"}
                    onChange={(_event: Event, value: number | number[]) => {
                        setLight({
                            ...light,
                            intensity: (value as number) / 100,
                        });
                    }}
                />
                {light.coordinates && <p>COORDINATES</p>}
            </Stack>
        );
    }
    return (
        <Stack>
            <label>{lightName}</label>
            {light.map((l, i) => (
                <div key={i}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <label>{`Light # ${i}`}</label>
                        <Switch
                            value={true}
                            onClick={() => {
                                setLight(
                                    light.map((l, li) =>
                                        li === i
                                            ? { ...l, active: !l.active }
                                            : l
                                    )
                                );
                            }}
                        />
                    </Stack>
                    <Slider
                        defaultValue={100 * light[i].intensity}
                        min={0}
                        max={100}
                        valueLabelDisplay={"auto"}
                        onChange={(_event: Event, value: number | number[]) => {
                            setLight(
                                light.map((l, li) =>
                                    li === i
                                        ? {
                                              ...l,
                                              intensity:
                                                  (value as number) / 100,
                                          }
                                        : l
                                )
                            );
                        }}
                    />
                    {light[i].coordinates && (
                        <CoordinatesEditor
                            coordinates={light[i].coordinates}
                            setCoordinates={(coords: ICoordinates) => {
                                setLight(
                                    light.map((l, li) =>
                                        li === i
                                            ? {
                                                  ...l,
                                                  coordinates: coords,
                                              }
                                            : l
                                    )
                                );
                            }}
                        />
                    )}
                </div>
            ))}
        </Stack>
    );
}

/*
                    

*/

const defaultAmbient: ILight = {
    label: "Ambient Light",
    active: false,
    intensity: 1,
    color: [255, 255, 255],
};
const defaultHeadLight: ILight = {
    label: "Head Light",
    active: false,
    intensity: 0.6,
    color: [255, 255, 255],
};
const defaultPointLights: ILight[] = [
    {
        label: "Point Light 1",
        active: false,
        intensity: 0.5,
        color: [0, 255, 0],
        coordinates: { x: -50, y: -50, z: -50 },
    },
    {
        label: "Point Light 2",
        active: false,
        intensity: 0.5,
        color: [0, 255, 255],
        coordinates: { x: -50, y: -50, z: 50 },
    },
];
const defaultDirectionalLights: ILight[] = [
    {
        label: "Directional Light 1",
        active: false,
        intensity: 1.0,
        color: [255, 255, 255],
        coordinates: { x: -1, y: 3, z: -1 },
    },
    {
        label: "Directional Light 2",
        active: false,
        intensity: 0.9,
        color: [255, 255, 255],
        coordinates: { x: 1, y: -8, z: -2.5 },
    },
];

const LightsStoryComponent: React.FC<SubsurfaceViewerProps> = (
    args: SubsurfaceViewerProps
) => {
    const [ambientLight, setAmbientLight] = React.useState<ILight>(
        () => defaultAmbient
    );
    const [headLight, setHeadLight] = React.useState<ILight>(
        () => defaultHeadLight
    );
    const [pointLights, setPointLights] = React.useState<ILight[]>(
        () => defaultPointLights
    );
    const [directionalLights, setDirectionalLights] = React.useState<ILight[]>(
        () => defaultDirectionalLights
    );

    let lights = {} as LightsType;

    if (ambientLight.active) {
        lights = {
            ...lights,
            ambientLight: {
                intensity: ambientLight.intensity,
                color: ambientLight.color,
            },
        };
    }
    if (headLight.active) {
        lights = {
            ...lights,
            headLight: {
                intensity: headLight.intensity,
                color: headLight.color,
            },
        };
    }

    if (pointLights) {
        lights = {
            ...lights,
            pointLights: pointLights
                .filter((l) => l.active)
                .map((l) => {
                    return {
                        intensity: l.intensity,
                        color: l.color,
                        position: [
                            l.coordinates?.x ?? 0,
                            l.coordinates?.y ?? 0,
                            l.coordinates?.z ?? 0,
                        ],
                    };
                }),
        };
    }

    if (directionalLights) {
        lights = {
            ...lights,
            directionalLights: directionalLights
                .filter((l) => l.active)
                .map((l) => {
                    return {
                        intensity: l.intensity,
                        color: l.color,
                        direction: [
                            l.coordinates?.x ?? 0,
                            l.coordinates?.y ?? 0,
                            l.coordinates?.z ?? 0,
                        ],
                    };
                }),
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
            <Stack direction={"row"} alignItems={"top"} spacing={10}>
                <LightEditor
                    lightName="AmbientLight"
                    light={ambientLight}
                    setLight={setAmbientLight}
                />
                <LightEditor
                    lightName="HeadLight"
                    light={headLight}
                    setLight={setHeadLight}
                />
                {
                    <LightEditor
                        lightName="Point Lights"
                        light={pointLights}
                        setLight={setPointLights}
                    />
                }
                {
                    <LightEditor
                        lightName="DirectionalLights"
                        light={directionalLights}
                        setLight={setDirectionalLights}
                    />
                }
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
            ...defaultStoryParameters.docs,
            description: {
                story: "Using different light sources",
            },
        },
    },
    render: (args) => <LightsStoryComponent {...args} />,
};
