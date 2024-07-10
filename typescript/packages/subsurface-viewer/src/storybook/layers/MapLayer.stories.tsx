import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { View } from "@deck.gl/core/typed";
import { ClipExtension } from "@deck.gl/extensions/typed";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import InfoCard from "../../components/InfoCard";
import type {
    BoundingBox2D,
    BoundingBox3D,
    ViewsType,
} from "../../components/Map";
import { useHoverInfo } from "../../components/Map";

import { ViewFooter } from "../../components/ViewFooter";
import AxesLayer from "../../layers/axes/axesLayer";
import MapLayer from "../../layers/map/mapLayer";
import NorthArrow3DLayer from "../../layers/northarrow/northArrow3DLayer";
import type { colorMapFunctionType } from "../../layers/utils/layerTools";

import {
    default2DViews,
    default3DViews,
    defaultStoryParameters,
    hugin25mKhNetmapMapLayer,
    hugin25mKhNetmapMapLayerPng,
    hugin2DBounds,
    hugin5mKhNetmapMapLayer,
    huginAxes3DLayer,
    northArrowLayer,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map Layer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },

    // Disable automatic tests for stories using the "no-test" tag.
    tags: ["no-test"],
};
export default stories;

// Small test map. 4 by 5 cells. One inactive node => 4 inactive cells.
// property values and depth values both from 0 to 29.
// Useful for debugging.
const smallLayer = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "small_depths.float32",
    frame: {
        origin: [459840.7, 5929826.1],
        count: [5, 6],
        increment: [175, 150],
        rotDeg: 0,
    },
    propertiesUrl: "small_properties.float32",
    gridLines: true,
    material: false,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
    colorMapRange: [0, 29],
    colorMapClampColor: [255, 0, 0],
};

const artefactsMapLayer = {
    "@@type": "MapLayer",
    id: "artefacts-map-layer",
    meshData: "ArtefactsMap/points.bin",
    frame: {
        origin: [1134, 9317.966796875],
        count: [81, 92],
        increment: [101.04595712679287, -100.58940471369598],

        rotDeg: 0.10652954894901544,
    },
    propertiesData: "ArtefactsMap/properties.bin",
    gridLines: false,
    material: false,
    // black to white colors.
    colorMapFunction: [0, 0, 0],
    colorMapRange: [-0.01, 33], // actual range is [0, 34.764503479003906]
    colorMapClampColor: [0, 255, 0],
};

// This layer has as many property values as depth values hence each cell will be interpolated in color.
const nodeCenteredPropertiesLayer = {
    "@@type": "MapLayer",
    id: "node-centered-layer",

    meshUrl:
        "data:text/plain;base64,zczMP5qZ2T9mZuY/MzPzP5qZmT9mZqY/MzOzPwAAwD/NzEw/ZmZmPwAAgD/NzIw/zczMPgAAAD+amRk/MzMzPwAAAIDNzMw9zcxMPpqZmT4=",
    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },
    propertiesUrl:
        "data:text/plain;base64,ZmYmQM3MLEAzMzNAmpk5QM3MDEAzMxNAmpkZQAAAIEBmZuY/MzPzPwAAAEBmZgZAMzOzPwAAwD/NzMw/mpnZPwAAgD/NzIw/mpmZP2Zmpj8=",
    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
};

const nodeCenteredPropertiesLayerWithArrayInput = {
    "@@type": "MapLayer",
    id: "node-centered-layer",
    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },
    meshData: Array.from(Array(20)).map(() => Math.random()), // Array of 20 random numbers
    propertiesData: Array.from(Array(20)).map(() => Math.random()),
    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
};

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const cellCenteredPropertiesLayer = {
    "@@type": "MapLayer",
    id: "cell-centered-layer",

    /*eslint-disable */
    // One depth pr node
    meshData: [
        1.6, 1.7, 1.8, 1.9, 1.2, 1.3, 1.4, 1.5, 0.8, 0.9, 1.0, 1.1, 0.4, 0.5,
        0.6, 0.7, 0.0, 0.1, 0.2, 0.3,
    ],

    // One property pr cell.
    propertiesData: [
        0.9,
        1.0,
        1.1,
        0.6,
        undefined,
        0.8,
        0.3,
        0.4,
        0.5,
        0.0,
        0.1,
        0.2,
    ],
    /*eslint-enable */

    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },

    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
    smoothShading: true,
};

// Example rotated layer
const meshMapLayerRotated = {
    ...hugin25mKhNetmapMapLayer,
    id: "rotated-mesh-layer",
    frame: {
        ...hugin25mKhNetmapMapLayer.frame,
        rotDeg: 30,
        //rotPoint: [436000, 6478000],
    },
    material: false,
};

export const MapLayer3dPng: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            huginAxes3DLayer,
            hugin25mKhNetmapMapLayerPng,
            northArrowLayer,
        ],

        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using png as mesh and properties data.",
            },
        },
    },
};

export const MapLayer3dPngNoBounds: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            huginAxes3DLayer,
            hugin25mKhNetmapMapLayerPng,
            northArrowLayer,
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "If no bounds are specified will results in automatically calcultated camera. Will look at center of bounding box of the data",
            },
        },
    },
};

const axesLayer2D = {
    "@@type": "Axes2DLayer",
    id: "axesLayer2D",
    backgroundColor: [0, 255, 255],
};

export const MapLayer2d: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [hugin25mKhNetmapMapLayer, axesLayer2D],
        bounds: hugin2DBounds,
        views: default2DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using png as mesh and properties data.",
            },
        },
    },
};

const white = [255, 255, 255, 255];

export const MapLayer2dDarkMode: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            { ...huginAxes3DLayer, labelColor: white, axisColor: white },
            {
                ...hugin25mKhNetmapMapLayer,
                material: false,
                gridLines: false,
            },
            { ...northArrowLayer, color: white },
        ],
        bounds: hugin2DBounds,
        scale: {
            visible: true,
            cssStyle: { color: "white" },
        },
        views: default2DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using png as mesh and properties data.",
            },
        },
        backgrounds: { default: "dark" },
    },
};

export const Rotated: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [huginAxes3DLayer, meshMapLayerRotated, northArrowLayer],
        bounds: hugin2DBounds,
        views: default2DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using png as mesh and properties data.",
            },
        },
    },
};

export const BigMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [huginAxes3DLayer, hugin5mKhNetmapMapLayer, northArrowLayer],
        bounds: hugin2DBounds,
    },
};

export const BigMap3d: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [huginAxes3DLayer, hugin5mKhNetmapMapLayer, northArrowLayer],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using large map with approx. 1400x1400 cells.",
            },
        },
    },
};

const axes_small = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [459790, 5929776, 0, 460590, 5930626, 30],
};

const axes_artefact_map = {
    "@@type": "AxesLayer",
    id: "axes_artefact_map",
    bounds: [0, 0, 0, 10000, 10000, 30],
};

export const SmallMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axes_small, smallLayer, northArrowLayer],
        bounds: [459840.7, 5929826.1, 460540.7, 5930576.1] as BoundingBox2D,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "4x5 cells.",
            },
        },
    },
};

export const MapWithArtefacts: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "artefacts-map",
        layers: [axes_artefact_map, artefactsMapLayer],
        bounds: [0, 0, 10000, 10000] as BoundingBox2D,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Map with color artefacts.",
            },
        },
    },
};

const axes_lite = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-1, -1, 0, 4, 5, 3],
};

//-- CellCenteredPropMap --
export const CellCenteredPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axes_lite, cellCenteredPropertiesLayer, northArrowLayer],
        bounds: [-1, -1, 4, 5] as BoundingBox2D,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "A small map with properties given at cell centers. Each cell will be constant colored",
            },
        },
    },
};

//-- NodeCenteredPropMap --
export const NodeCenteredPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axes_lite, nodeCenteredPropertiesLayer, northArrowLayer],
        bounds: [-1, -1, 4, 5] as BoundingBox2D,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "A small map with properties given at nodes. Each cell will be interpolated in color.",
            },
        },
    },
};

//-- NodeCenteredPropMap  with native javascript arrays as input --
export const NodeCenteredPropMapWithArrayInput: StoryObj<
    typeof SubsurfaceViewer
> = {
    args: {
        id: "map",
        layers: [
            axes_lite,
            nodeCenteredPropertiesLayerWithArrayInput,
            northArrowLayer,
        ],
        bounds: [-1, -1, 4, 5] as BoundingBox2D,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
            },
        },
    },
    tags: ["no-test"],
};

function makeGaussian(amplitude, x0, y0, stdX, stdY) {
    return function (amplitude, x0, y0, stdX, stdY, x, y) {
        const exponent = -(
            Math.pow(x - x0, 2) / (2 * Math.pow(stdX, 2)) +
            Math.pow(y - y0, 2) / (2 * Math.pow(stdY, 2))
        );
        return amplitude * Math.pow(Math.E, exponent);
    }.bind(null, amplitude, x0, y0, stdX, stdY);
}

function makeData(n: number, amplitude: number): Float32Array {
    const X0 = 0;
    const Y0 = 0;
    const stdX = 75;
    const stdY = 50;
    const f = makeGaussian(amplitude, X0, Y0, stdX, stdY);

    const data = new Float32Array(n * n).map((val, index) => {
        const x = (index % n) - n / 2;
        const y = Math.floor(index / n) - n / 2;
        return f(x, y); // keep + 0.3 * Math.random();
    });

    return data;
}

function nearestColorMap(x: number) {
    if (x > 0.5) return [100, 255, 255];
    else if (x > 0.1) return [255, 100, 255];
    return [255, 255, 100];
}

//-- MapLayer with native javascript arrays as input --
const TypedArrayInputComponent: React.FC<{
    triggerHome: number;
    dimension: number;
}> = (args) => {
    const subsurfaceViewerArgs = {
        id: "map",
        layers: [
            {
                "@@type": "MapLayer",
                "@@typedArraySupport": true,
                id: "mesh-layer-typed-input",
                frame: {
                    origin: [-args.dimension / 2, -args.dimension / 2],
                    count: [args.dimension, args.dimension],
                    increment: [1, 1],
                    rotDeg: 0,
                },
                meshData: makeData(args.dimension, 99),
                propertiesData: makeData(args.dimension, 1),
                gridLines: false,
                material: true,
                ZIncreasingDownwards: false,
                contours: [0, 5],
                colorMapFunction: nearestColorMap as colorMapFunctionType,
            },
            {
                "@@type": "AxesLayer",
                id: "axes-typed-input",
                ZIncreasingDownwards: false,
                bounds: [
                    -args.dimension / 2,
                    -args.dimension / 2,
                    -10,
                    args.dimension / 2,
                    args.dimension / 2,
                    60,
                ],
            },
        ],
        cameraPosition: {
            rotationOrbit: 45,
            rotationX: 45,
            zoom: [-100, -100, -10, 100, 100, 60] as BoundingBox3D,
            target: [],
        },
        views: default3DViews,
        triggerHome: args.triggerHome,
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const TypedArrayInput: StoryObj<typeof TypedArrayInputComponent> = {
    args: {
        dimension: 300,
    },
    argTypes: {
        dimension: {
            control: { type: "range", min: 150, max: 300, step: 1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Both mesh and property data given as typed arrays arrays (as opposed to URL).",
            },
        },
    },
    render: (args) => <TypedArrayInputComponent {...args} />,
};

const ReadoutComponent: React.FC = () => {
    const [hoverInfo, hoverCallback] = useHoverInfo();

    const args = React.useMemo(() => {
        return {
            id: "readout",
            bounds: hugin2DBounds,
            layers: [{ ...hugin25mKhNetmapMapLayer, material: false }],
            coords: {
                visible: false,
            },
            onMouseEvent: hoverCallback,
        };
    }, [hoverCallback]);

    return (
        <>
            <SubsurfaceViewer {...args} />
            {hoverInfo && <InfoCard pickInfos={hoverInfo} />}
        </>
    );
};

export const Readout: StoryObj<typeof ReadoutComponent> = {
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Readout example.",
            },
        },
    },
    render: () => <ReadoutComponent />,
};

const BigMapWithHoleComponent: React.FC = () => {
    const [hoverInfo, hoverCallback] = useHoverInfo();

    const args = React.useMemo(() => {
        return {
            id: "readout",
            bounds: hugin2DBounds,
            layers: [
                {
                    ...hugin5mKhNetmapMapLayer,
                    meshUrl: "hugin_depth_5_m_w_hole.float32",
                    gridLines: false,
                    material: false,
                },
            ],
            coords: {
                visible: false,
            },
            onMouseEvent: hoverCallback,
        };
    }, [hoverCallback]);

    return (
        <>
            <SubsurfaceViewer {...args} />
            {hoverInfo && <InfoCard pickInfos={hoverInfo} />}
        </>
    );
};

export const BigMapWithHole: StoryObj<typeof BigMapWithHoleComponent> = {
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example of map with a hole.",
            },
        },
    },
    render: () => <BigMapWithHoleComponent />,
};

type ContourLinesComponentProps = {
    syncViewports: boolean;
    show3d: boolean;
    contourOffset: number;
    zContourInterval: number;
    propertyContourInterval: number;
    marginPixels: number;
};

const ContourLinesComponent: React.FC<ContourLinesComponentProps> = (
    props: ContourLinesComponentProps
) => {
    const noContourMapLayer = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "no_contours",
        contours: [-1.0, -1.0],
    });

    const contourMapLayer = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "contours",
        contours: [props.contourOffset, props.zContourInterval],
    });

    const propertyContourMapLayer = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "property_contours",
        contours: [props.contourOffset, props.propertyContourInterval],
        isContoursDepth: false,
    });

    const flatPropertyContourMapLayer = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "flat",
        meshData: undefined as unknown as string,
        contours: [props.contourOffset, props.propertyContourInterval] as [
            number,
            number,
        ],
    });

    const views: ViewsType = {
        layout: [2, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                show3D: props.show3d,
                layerIds: [noContourMapLayer.id],
                isSync: props.syncViewports,
            },
            {
                id: "view_2",
                show3D: props.show3d,
                layerIds: [contourMapLayer.id],
                isSync: props.syncViewports,
            },
            {
                id: "view_3",
                show3D: props.show3d,
                layerIds: [propertyContourMapLayer.id],
                isSync: props.syncViewports,
            },
            {
                id: "view_4",
                show3D: props.show3d,
                layerIds: [flatPropertyContourMapLayer.id],
                isSync: props.syncViewports,
            },
        ],
    };

    return (
        <SubsurfaceViewer
            id={"test"}
            layers={[
                noContourMapLayer,
                contourMapLayer,
                propertyContourMapLayer,
                flatPropertyContourMapLayer,
            ]}
            views={views}
        >
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1">
                    <ViewFooter>Default - no contour lines</ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_2">
                    <ViewFooter>
                        Contour lines enabled - default is Z value
                    </ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_3">
                    <ViewFooter>Contour lines on property value</ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_4">
                    <ViewFooter>
                        Contour lines on flat map - default is property value
                    </ViewFooter>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const ContourLines: StoryObj<typeof ContourLinesComponent> = {
    args: {
        syncViewports: true,
        show3d: false,
        contourOffset: 0,
        zContourInterval: 100,
        propertyContourInterval: 5000,
        marginPixels: 0,
    },
    render: (args) => <ContourLinesComponent {...args} />,
};

const ExtensionsComponent: React.FC<
    SubsurfaceViewerProps & { clipX: number }
> = (args) => {
    const rightClipBounds = [
        args.bounds?.[0] + args.clipX,
        args.bounds?.[1],
        args.bounds?.[2],
        args.bounds?.[3],
    ];
    const leftClipBounds = [
        args.bounds?.[0],
        args.bounds?.[1],
        args.bounds?.[0] + args.clipX,
        args.bounds?.[3],
    ];
    // Can not use Record<string, unknown> because extensions will not be supported
    const leftMap = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "left",
        material: false,
        extensions: [new ClipExtension()],
        clipBounds: leftClipBounds,
        clipByInstance: true,
    });

    const rightMap = new MapLayer({
        ...hugin25mKhNetmapMapLayer,
        id: "right",
        colorMapName: "Physics reverse",
        material: false,
        extensions: [new ClipExtension()],
        clipBounds: rightClipBounds,
        clipByInstance: true,
    });

    const layers = [
        new AxesLayer({ ...huginAxes3DLayer }),
        leftMap,
        rightMap,
        new NorthArrow3DLayer(),
    ];

    return <SubsurfaceViewer {...args} layers={layers}></SubsurfaceViewer>;
};

export const Extensions: StoryObj<typeof ExtensionsComponent> = {
    args: {
        id: "map",
        bounds: hugin2DBounds,
        views: default3DViews,
        clipX: 1000,
    },
    argTypes: {
        clipX: {
            control: { type: "range", min: 0, max: 8000, step: 10 },
        },
    },
    render: (args) => <ExtensionsComponent {...args} />,
};
