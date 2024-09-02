import type { Meta, StoryObj } from "@storybook/react";
import { userEvent } from "@storybook/test";
import React from "react";

import { SimpleMeshLayer } from "@deck.gl/mesh-layers";
import { SphereGeometry } from "@luma.gl/engine";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { BoundingBox3D, ViewStateType } from "../../components/Map";
import { Axes2DLayer, AxesLayer } from "../../layers";

import { GeoJsonLayer } from "@deck.gl/layers";
import {
    customLayerWithPolygonDataProps,
    default2DViews,
    default3DViews,
    defaultStoryParameters,
    hugin25mDepthMapLayer,
    hugin25mKhNetmapMapLayer,
    hugin25mKhNetmapMapLayerPng,
    hugin3DBounds,
    huginAxes3DLayer,
    mainStyle,
    northArrowLayer,
    volveWellsBounds,
    volveWellsLayer,
    volveWellsWithLogsLayer,
} from "../sharedSettings";

import { scaleZoom } from "../..";
import { useScaleFactor } from "../../utils/event";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/Camera",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

const classes = {
    main: "default-main",
    mainWithButton: "mian-with-button",
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

const CAMERA_POSITION: ViewStateType = {
    target: [435800, 6478000, -2000],
    zoom: -3.5,
    rotationX: 90,
    rotationOrbit: 0,
};

const SIDE_CAMERA = {
    rotationX: 0,
    target: [435800, 6478000, -4000],
    rotationOrbit: 90,
    zoom: -3.3,
};

const SQUARE = {
    type: "Feature",
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [-5, -5, 0],
                [-5, 5, 0],
                [5, 5, 0],
                [5, -5, 0],
                [-5, -5, 0],
            ],
        ],
    },
};

const SQUARE_GEOMETRY_LAYER = new GeoJsonLayer({
    ...customLayerWithPolygonDataProps,
    // @ts-expect-error TS2322
    data: SQUARE,
});

const AXES2D = new Axes2DLayer({
    id: "axes",
    backgroundColor: [0, 155, 155],
});

const DEFAULT_PROPS = {
    id: "default",
    layers: [huginAxes3DLayer, hugin25mDepthMapLayer],
    views: default3DViews,
};

const DisplayCameraPositionComponent: React.FC<SubsurfaceViewerProps> = (
    args
) => {
    const [cameraState, setCameraState] = React.useState(args.cameraPosition);

    const getCameraPosition = React.useCallback((input: ViewStateType) => {
        setCameraState(input);
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
                <div>zoom: {cameraState?.zoom}</div>
                <div>rotationX: {cameraState?.rotationX}</div>
                <div>rotationOrbit: {cameraState?.rotationOrbit}</div>
                <div>targetX: {cameraState?.target[0]}</div>
                <div>targetY: {cameraState?.target[1]}</div>
            </div>
        </>
    );
};

export const DisplayCameraState: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "volve-wells",
        bounds: volveWellsBounds,
        layers: [volveWellsLayer],
        cameraPosition: CAMERA_POSITION,
    },
    render: (args) => <DisplayCameraPositionComponent {...args} />,
};

const SyncedMultiViewComponent = (args: {
    show3d: boolean;
    sync: string[];
}) => {
    const subsurfaceViewerArgs: SubsurfaceViewerProps = {
        id: "view_state_synchronization",
        layers: [
            hugin25mKhNetmapMapLayer,
            hugin25mDepthMapLayer,
            volveWellsLayer,
        ],
        views: {
            layout: [2, 2] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    layerIds: [hugin25mDepthMapLayer.id],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_1"),
                },
                {
                    id: "view_2",
                    layerIds: [hugin25mKhNetmapMapLayer.id],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_2"),
                },
                {
                    id: "view_3",
                    layerIds: [volveWellsLayer.id],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_3"),
                },
                {
                    id: "view_4",
                    layerIds: [volveWellsLayer.id, hugin25mDepthMapLayer.id],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_4"),
                },
            ],
        },
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const SyncedMultiView: StoryObj<typeof SyncedMultiViewComponent> = {
    args: {
        show3d: false,
        sync: ["view_1", "view_2", "view_3", "view_4"],
    },

    argTypes: {
        sync: {
            options: ["view_1", "view_2", "view_3", "view_4"],
            control: "check",
        },
    },
    render: (args) => <SyncedMultiViewComponent {...args} />,
};

type SyncedCameraSettingsProps = SubsurfaceViewerProps & {
    syncViewers: boolean;
};

const SyncedCameraSettingsComponent = (args: SyncedCameraSettingsProps) => {
    const [cameraPosition, setCameraPosition] = React.useState(
        args.cameraPosition
    );

    const updateCamera = React.useCallback(
        (camera: ViewStateType) => {
            if (args.syncViewers) {
                setCameraPosition(camera);
            }
        },
        [args.syncViewers]
    );

    React.useEffect(() => {
        if (args.cameraPosition) {
            setCameraPosition({ ...args.cameraPosition });
        }
    }, [args.cameraPosition]);

    const props = {
        ...args,
        cameraPosition,
        getCameraPosition: updateCamera,
    };

    return (
        <div
            style={{
                height: "96vh",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
            }}
        >
            <div
                style={{
                    position: "relative",
                }}
            >
                <SubsurfaceViewer {...props} id="left" />
            </div>
            <div
                style={{
                    position: "relative",
                }}
            >
                <SubsurfaceViewer {...props} id="right" />
            </div>
        </div>
    );
};

export const SyncedSubsurfaceViewers: StoryObj<
    typeof SyncedCameraSettingsComponent
> = {
    args: {
        syncViewers: true,
        id: "volve-wells",
        bounds: volveWellsBounds,
        layers: [volveWellsLayer],
        cameraPosition: CAMERA_POSITION,
        views: default2DViews,
    },
    render: (args) => <SyncedCameraSettingsComponent {...args} />,
};

const zoomBox3D: BoundingBox3D = [-325, -450, -25, 125, 150, 125];

const AutoZoomToBox = (args: SubsurfaceViewerProps) => {
    const [rotX, setRotX] = React.useState(0);
    const [rotZ, setRotZ] = React.useState(0);

    const cameraPosition: ViewStateType = {
        rotationX: rotX,
        rotationOrbit: rotZ,
        zoom: zoomBox3D,
        target: [],
    };

    const props = {
        ...args,
        layers: [
            new AxesLayer({
                id: "axes",
                bounds: zoomBox3D,
                ZIncreasingDownwards: false,
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
                getPosition: [0, 0, 0],
                getColor: [255, 255, 255],
                material: true,
            }),
        ],
        cameraPosition,
    };

    return (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props} />
            </div>
            <Box flexDirection={"column"}>
                <label>{"Rotation X Axis "}</label>
                <Slider
                    defaultValue={50}
                    valueLabelDisplay={"auto"}
                    onChange={(_event: Event, value: number | number[]) => {
                        const angle = 2 * ((value as number) / 100 - 0.5) * 90;
                        setRotX(angle);
                    }}
                />
            </Box>
            <Box flexDirection={"column"}>
                <label>{"Rotation Z Axis "}</label>
                <Slider
                    defaultValue={50}
                    valueLabelDisplay={"auto"}
                    onChange={(_event: Event, value: number | number[]) => {
                        const angle = 2 * ((value as number) / 100 - 0.5) * 180;
                        setRotZ(angle);
                    }}
                />
            </Box>
        </Root>
    );
};

export const AutoZoomToBoxStory: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "",
            },
        },
    },
    render: (args) => <AutoZoomToBox {...args} />,
};

const ScaleZComponent: React.FC<SubsurfaceViewerProps> = (args) => {
    const [layers, setLayers] = React.useState([
        huginAxes3DLayer,
        hugin25mKhNetmapMapLayerPng,
        northArrowLayer,
    ]);

    const handleChange = () => {
        setLayers([
            huginAxes3DLayer,
            hugin25mKhNetmapMapLayerPng,
            volveWellsWithLogsLayer,
            northArrowLayer,
        ]);
    };

    const props = {
        ...args,
        layers,
    };

    return (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange}>Add layer</button>
        </Root>
    );
};

export const ScaleZ: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "ScaleZ",
        layers: [
            huginAxes3DLayer,
            hugin25mKhNetmapMapLayerPng,
            volveWellsWithLogsLayer,
            northArrowLayer,
        ],
        bounds: volveWellsBounds,

        views: {
            layout: [1, 2],
            viewports: [
                {
                    id: "view_1",
                    layerIds: [
                        huginAxes3DLayer.id,
                        hugin25mKhNetmapMapLayerPng.id,
                        northArrowLayer.id,
                    ],
                    show3D: true,
                    isSync: true,
                },
                {
                    id: "view_2",
                    layerIds: [
                        huginAxes3DLayer.id,
                        volveWellsWithLogsLayer.id,
                        northArrowLayer.id,
                    ],
                    show3D: true,
                    isSync: true,
                },
            ],
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example scaling in z direction using arrow up/down buttons.",
            },
        },
    },
    render: (args) => <ScaleZComponent {...args} />,
};

const ResetCameraPropertyDefaultCameraPosition = {
    rotationOrbit: 0,
    rotationX: 45,
    target: [435775, 6478650, -2750],
    zoom: -3.8,
};

const ResetCameraComponent: React.FC<SubsurfaceViewerProps> = (args) => {
    const [camera, setCamera] = React.useState(
        () => args.cameraPosition ?? ResetCameraPropertyDefaultCameraPosition
    );

    const handleChange = () => {
        setCamera({
            ...camera,
            rotationOrbit: camera.rotationOrbit + 5,
        });
    };

    const props = {
        ...args,
        cameraPosition: camera,
    };

    return (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange}> Change Camera </button>
        </Root>
    );
};

export const ResetCameraStory: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "ResetCameraProperty",
        layers: [
            huginAxes3DLayer,
            hugin25mKhNetmapMapLayerPng,
            northArrowLayer,
        ],

        bounds: volveWellsBounds,
        cameraPosition: ResetCameraPropertyDefaultCameraPosition,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: `Pressing the button 'Change Camera' does rotate it.`,
            },
        },
    },
    render: (args) => <ResetCameraComponent {...args} />,
};

const AddLayerComponent: React.FC<SubsurfaceViewerProps> = (args) => {
    const [layers, setLayers] = React.useState([
        huginAxes3DLayer,
        hugin25mKhNetmapMapLayerPng,
        northArrowLayer,
    ]);

    const handleChange = () => {
        setLayers([
            hugin25mKhNetmapMapLayerPng,
            huginAxes3DLayer,
            volveWellsWithLogsLayer,
            northArrowLayer,
        ]);
    };

    const props = {
        ...args,
        layers,
    };

    return (
        <Root>
            <div className={classes.mainWithButton}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange}> Add layer </button>
        </Root>
    );
};

export const AddLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        //bounds: volveWellsBounds,  // Keep this line for future testing.
        cameraPosition: {
            rotationOrbit: 45,
            rotationX: 45,
            zoom: hugin3DBounds,
            target: [],
        },
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: `Example using button to add a layer.`,
            },
        },
    },
    render: (args) => <AddLayerComponent {...args} />,
};

const ScaleYComponent = ({ verticalScale }: { verticalScale: number }) => {
    const viewerProps: SubsurfaceViewerProps = {
        id: "ScaleY",
        bounds: [-10, -10, 10, 10],
        layers: [AXES2D, SQUARE_GEOMETRY_LAYER],
        views: {
            layout: [1, 1],
            viewports: [
                {
                    id: "section",
                    verticalScale,
                    zoom: 2,
                },
            ],
        },
    };
    return <SubsurfaceViewer {...viewerProps} />;
};

export const ScaleY: StoryObj<typeof ScaleYComponent> = {
    args: { verticalScale: 1.5 },
    argTypes: {
        verticalScale: {
            control: { type: "range", min: -1, max: 10, step: 0.1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Vertical scaling example in Orthographic view.",
            },
        },
    },
    render: (args) => <ScaleYComponent {...args} />,
};

const ScaleYWithCameraPositionComponent = ({
    verticalScale,
}: {
    verticalScale: number;
}) => {
    const zoom = 3;
    const xyZoom = scaleZoom(verticalScale, zoom);
    const viewerProps: SubsurfaceViewerProps = {
        id: "ScaleY",
        layers: [AXES2D, SQUARE_GEOMETRY_LAYER],
        cameraPosition: {
            rotationOrbit: 0,
            rotationX: 0,
            zoom: xyZoom,
            target: [1, 1, 1],
        },
    };
    return <SubsurfaceViewer {...viewerProps} />;
};

export const ScaleYWithCameraPosition: StoryObj<
    typeof ScaleYWithCameraPositionComponent
> = {
    args: { verticalScale: 2.5 },
    argTypes: {
        verticalScale: {
            control: { type: "range", min: -1, max: 10, step: 0.1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Orthographic vertical scaling with multiple camera definitions.",
            },
        },
    },
    render: (args) => <ScaleYWithCameraPositionComponent {...args} />,
};

const ScaleVertical3dComponent = ({
    verticalScale,
}: {
    verticalScale: number;
}) => {
    const viewerProps: SubsurfaceViewerProps = {
        ...DEFAULT_PROPS,
        cameraPosition: SIDE_CAMERA,
        verticalScale,
    };
    return <SubsurfaceViewer {...viewerProps} />;
};

export const ScaleVertical3d: StoryObj<typeof ScaleVertical3dComponent> = {
    args: { verticalScale: 1.5 },
    argTypes: {
        verticalScale: {
            control: { type: "range", min: -1, max: 10, step: 0.1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Vertical scaling example in panoramic view.",
            },
        },
    },
    render: (args) => <ScaleVertical3dComponent {...args} />,
};

const ScaleFactorHookComponent = ({
    verticalScale,
}: {
    verticalScale: number;
}) => {
    const { factor: scaleFactor, setFactor, elementRef } = useScaleFactor();

    React.useEffect(() => {
        setFactor(verticalScale);
    }, [setFactor, verticalScale]);

    const viewerProps: SubsurfaceViewerProps = {
        ...DEFAULT_PROPS,
        cameraPosition: SIDE_CAMERA,
        verticalScale: scaleFactor,
        innerRef: elementRef,
    };
    return <SubsurfaceViewer {...viewerProps} />;
};

export const ScaleFactorHook: StoryObj<typeof ScaleFactorHookComponent> = {
    args: { verticalScale: 1.5 },
    argTypes: {
        verticalScale: {
            control: { type: "range", min: -1, max: 10, step: 0.1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Using a hook to control vertical scaling either via props or keyboard shortcuts.",
            },
        },
    },
    render: (args) => <ScaleFactorHookComponent {...args} />,
    play: async () => {
        const delay = 500;
        const canvas = document.querySelector("canvas");

        if (canvas) {
            userEvent.click(canvas);
        }

        await userEvent.keyboard("[ArrowUp]", { delay });
        await userEvent.keyboard("[ArrowDown]", { delay });
        await userEvent.keyboard("[ArrowUp]", { delay });
    },
};
