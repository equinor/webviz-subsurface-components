import React from "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { fireEvent, userEvent } from "storybook/test";

import { all, create } from "mathjs";

import type { Color, Layer, PickingInfo } from "@deck.gl/core";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer, { TGrid3DColoringMode } from "../../SubsurfaceViewer";
import Grid3DLayer from "../../layers/grid3d/grid3dLayer";

import { argTypes } from "../sharedDoc";
import type { EditedDataTemplate } from "../sharedSettings";
import {
    Root,
    classes,
    colormapLayer,
    customLayerWithPolygonData,
    customLayerWithPolylineData,
    customLayerWithTextData,
    default2DViews,
    default3DViews,
    defaultStoryParameters,
    hugin25mKhNetmapMapLayerPng,
    hugin2DBounds,
    subsufaceProps,
    volveWellsBounds,
} from "../sharedSettings";

import {
    Faces as SnubCubeFaces,
    Points as SnubCubePoints,
    VertexCount as SnubCubeVertexCount,
} from "../../layers/grid3d/test_data/TruncatedSnubCube";

import {
    Faces as ToroidFaces,
    Points as ToroidPoints,
    VertexCount as ToroidVertexCount,
} from "../../layers/grid3d/test_data/PentagonalToroid";
import type { WellMarkerDataT } from "../../layers/well_markers/wellMarkersLayer";

import volveWellsJson from "../../../../../../example-data/volve_wells.json";
import { clamp } from "lodash";
import type {
    WellFeature,
    WellFeatureCollection,
    WellsPickInfo,
} from "../../layers/wells/types";
import { WellMarkersLayer, WellsLayer } from "../../layers";
import {
    getAziAndInclForSegment,
    getLineStringGeometry,
    getSegmentIndicesForMd,
} from "../../layers/wells/utils/trajectory";
import { TextLayer } from "@deck.gl/layers";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples",
    tags: ["no-dom-test"],
    argTypes: argTypes,
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};

export default stories;

// Layers data for storybook example 1
const layersData1 = [
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Layers data for storybook example 2
const layersData2 = [
    colormapLayer,
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Storybook example 1
export const Default: StoryObj<typeof EditedDataTemplate> = {
    args: subsufaceProps,
};

// Minimal map example.
export const Minimal: StoryObj = {
    parameters: {
        docs: {
            description: {
                story: "An example showing the minimal required arguments, which will give an empty map viewer.",
            },
        },
    },
    render: () => <SubsurfaceViewer id={"deckgl-map"} bounds={[0, 0, 1, 1]} />,
};

//Material property may take these values:
//          true  = default material. See deck.gl documentation for what that is. This is default property value.
//          false = no material.
//          Full spec:
//                {
//                    ambient: 0.35,
//                    diffuse: 0.6,
//                    shininess: 32,
//                    specularColor: [255, 255, 255],
//                }
const material = {
    ambient: 0.35,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [255, 255, 255],
};

export const MapMaterial: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "material",
        layers: [{ ...hugin25mKhNetmapMapLayerPng, material }],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "An example showing example usage of Map3D material property.",
            },
        },
    },
};

// Exapmple of using "colorMapClampColor" property.
// Clamps colormap to this color at ends.
// Given as array of three values (r,g,b) e.g: [255, 0, 0]
// If not set (undefined) or set to true, it will clamp to color map min and max values.
// If set to false the clamp color will be completely transparent.
const propertyValueRange = [-1870, 41000];
const colorMapRange = [100, 20000];
const colorMapClampColor = [255, 255, 0]; // a color e.g. [0, 255, 0],  false, true or undefined.

export const MapClampColor: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "clampcolor",
        layers: [
            {
                ...hugin25mKhNetmapMapLayerPng,
                propertyValueRange,
                colorMapRange,
                colorMapClampColor,
            },
        ],
        bounds: hugin2DBounds,
        views: default2DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: 'An example usage of map property `"colorMapClampColor"',
            },
        },
    },
};

// Example using "colorMapFunction" property.
const layer = {
    ...hugin25mKhNetmapMapLayerPng,
    isContoursDepth: true,
    colorMapFunction: (x: number) => [255 - x * 100, 255 - x * 100, 255 * x], // If defined this function will override the colormap.
};
export const ColormapFunction: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "ColormapFunction",
        layers: [
            // map layer
            layer,
            // colormap layer
            {
                ...colormapLayer,
                image: "propertyMap.png",
                colorMapFunction: (x: number) => [
                    255 - x * 100,
                    255 - x * 100,
                    255 * x,
                ], // If defined this function will override the colormap.
            },
        ],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
};

export const MultiPicking: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "MultiPicking",
        pickingRadius: 30,
        pickingDepth: 3,
        layers: [
            // map layer
            hugin25mKhNetmapMapLayerPng,
            {
                "@@type": "WellsLayer",
                id: "volve-wells",
                data: "./volve_wells.json",
                ZIncreasingDownwards: false,
            },
        ],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
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

        const pos = {
            x: canvas.clientLeft + canvas.clientWidth * 0.5,
            y: canvas.clientTop + canvas.clientHeight * 0.5,
        };

        await userEvent.hover(canvas, { delay });

        await fireEvent.mouseMove(canvas, { clientX: 0, clientY: 0, delay });
        await fireEvent.mouseMove(canvas, {
            clientX: pos.x,
            clientY: pos.y,
            delay,
        });
    },
};

// custom layer example
export const UserDefinedLayer1: StoryObj<typeof EditedDataTemplate> = {
    args: {
        id: subsufaceProps.id,
        bounds: subsufaceProps.bounds,
        layers: layersData1,
    },
};

// custom layer with colormap
export const UserDefinedLayer2: StoryObj<typeof EditedDataTemplate> = {
    args: {
        id: subsufaceProps.id,
        resources: subsufaceProps.resources,
        bounds: subsufaceProps.bounds,
        layers: layersData2,
    },
};

// ---------Selectable GeoJson Layer example--------------- //
const SelectableFeatureComponent: React.FC<SubsurfaceViewerProps> = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <div>
            <SubsurfaceViewer
                {...args}
                editedData={editedData}
                setProps={(updatedProps) => {
                    setEditedData(
                        updatedProps["editedData"] as Record<string, unknown>
                    );
                }}
            />
            <pre>{JSON.stringify(editedData, null, 2)}</pre>
        </div>
    );
};

const polylineUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolylineData,
    "@@type": "SelectableGeoJsonLayer",
};

const polygonUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolygonData,
    "@@type": "SelectableGeoJsonLayer",
};

export const SelectableFeatureExample: StoryObj<
    typeof SelectableFeatureComponent
> = {
    args: {
        id: "DeckGL-Map",
        bounds: [432205, 6475078, 437720, 6481113],
        layers: [
            polylineUsingSelectableGeoJsonLayer,
            polygonUsingSelectableGeoJsonLayer,
        ],
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing selectable feature example from the map.",
            },
        },
    },
    render: (args) => <SelectableFeatureComponent {...args} />,
};

export const MapInContainer: StoryObj<typeof SubsurfaceViewer> = {
    args: subsufaceProps,
    render: (args) => (
        <Root className={classes.main}>
            <SubsurfaceViewer {...args} />
        </Root>
    ),
};

const math = create(all, { randomSeed: "1984" });
const randomFunc = math?.random ? math.random : Math.random;

const snubCubePoints = SnubCubePoints.map((v) => 10 * v);
const snubCubeProperties = Array(SnubCubeVertexCount)
    .fill(0)
    .map(() => randomFunc() * 50);

const toroidPoints = ToroidPoints.map((v) => 10 * v).map((v, index) =>
    index % 3 === 0 ? v + 30 : v
);
const toroidProperties = Array(ToroidVertexCount)
    .fill(0)
    .map(() => randomFunc() * 10);

const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    gridLines: true,
    material: true,
    colorMapName: "Rainbow",
    ZIncreasingDownwards: false,
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [453150, 5925800, -2000, 469400, 5939500, 0],
    ZIncreasingDownwards: false,
};

const parameters = {
    docs: {
        ...defaultStoryParameters,
        description: {
            story: "Demonstrates mixed ways of layer creation.",
        },
    },
};

export const MixedLayerDefinitions: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        bounds: [-25, -25, 50, 30],
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "grid-3d-polyhedral-cell-typed-input",
        layers: [
            undefined,
            {
                ...axes,
                id: "polyhedral-cells-axes-typed-input",
                bounds: [-15, -15, -15, 40, 20, 15],
            },
            null,
            {
                ...grid3dLayer,
                id: "polyhedral1-typed-input",
                "@@typedArraySupport": true,
                coloringMode: TGrid3DColoringMode.Y,
                pickable: true,
                pointsData: new Float32Array(snubCubePoints),
                polysData: new Uint32Array(SnubCubeFaces),
                propertiesData: new Float32Array(snubCubeProperties),
                colorMapRange: [-8, 8],
                colorMapClampColor: [200, 200, 200],
                colorMapName: "Seismic",
            },
            false,
            new Grid3DLayer({
                gridLines: true,
                material: true,
                colorMapName: "Rainbow",
                ZIncreasingDownwards: false,
                id: "polyhedral2-typed-input",
                pickable: true,
                pointsData: new Float32Array(toroidPoints),
                polysData: new Uint32Array(ToroidFaces),
                propertiesData: new Float32Array(toroidProperties),
                coloringMode: TGrid3DColoringMode.Property,
            }) as unknown as Layer,
        ],
    },
    parameters: parameters,
};

type MarkerDataWithMd = WellMarkerDataT & { md: number };
type MarkersAlongWellPath = SubsurfaceViewerProps & {
    wellIdx: number;
    applyModelMatrix: boolean;
};
export const MarkersAlongWellPath: StoryObj<MarkersAlongWellPath> = {
    args: {
        id: "markers_along_path",
        verticalScale: 5,
        wellIdx: 12,
        applyModelMatrix: false,
        cameraPosition: {
            rotationOrbit: -18,
            rotationX: 42,
            zoom: -4,
            target: [436063, 6477373, -1447],
        },
        bounds: volveWellsBounds,
        pickingRadius: 12,
        views: default3DViews,
    },
    argTypes: {
        wellIdx: {
            control: "number",
            min: 0,
            max: 20,
            step: 1,
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Showcases placing WellMarkers layers along a well track",
            },
        },
    },
    render: function ReadoutBugComp(props: MarkersAlongWellPath) {
        const [hoveredMd, setHoveredMd] = React.useState<null | number>(null);
        const [hoveredId, setHoveredId] = React.useState<null | string>(null);

        const safeWellIdx = clamp(
            props.wellIdx,
            0,
            volveWellsJson.features.length - 1
        );

        const partialVolveWells = React.useMemo(() => {
            return {
                ...volveWellsJson,
                features: [volveWellsJson.features[safeWellIdx ?? 0]],
            } as unknown as WellFeatureCollection;
        }, [safeWellIdx]);

        const mdSteps = React.useMemo(() => {
            const firstWell = partialVolveWells.features[0];
            const mdArray = firstWell.properties.md[0];
            const stepSize = Math.floor((mdArray.length - 1) / 4);
            return [0, 1, 2, 3, 4].map((i) => mdArray[i * stepSize]);
        }, [partialVolveWells.features]);

        const fixedHoverMarkers = React.useMemo<MarkerDataWithMd[]>(() => {
            const firstWell = partialVolveWells.features[0];

            return mdSteps.map((md) => getMarkerDataAtMd(firstWell, md));
        }, [mdSteps, partialVolveWells.features]);

        const hoverMarkerData = React.useMemo<WellMarkerDataT>(() => {
            if (hoveredId == null || hoveredMd == null)
                return {
                    position: [-1, -1, -1],
                    size: 20,
                    azimuth: 0,
                    inclination: 0,
                    color: [0, 0, 0, 0],
                    outlineColor: [0, 0, 0, 0],
                };

            const hoveredWell = partialVolveWells.features.find(
                (f) => f.properties.name === hoveredId
            )!;
            return getMarkerDataAtMd(hoveredWell, hoveredMd, {
                overrideColor: [255, 0, 0],
            });
        }, [hoveredId, hoveredMd, partialVolveWells.features]);

        const layers = React.useMemo(
            () => [
                new WellsLayer({
                    id: "volve_wells",
                    data: partialVolveWells,
                    refine: false,
                    ZIncreasingDownwards: false,
                    pickable: true,
                    autoHighlight: true,
                    outline: true,
                    onHover(pickingInfo) {
                        if (!isWellsPickInfo(pickingInfo)) {
                            setHoveredId(null);
                            setHoveredMd(null);
                        } else {
                            const wellFeature = pickingInfo.object;
                            const pickProperties = pickingInfo.properties ?? [];

                            const pickedId = wellFeature?.properties.name;
                            const pickedMd = pickProperties?.find((prop) =>
                                prop.name.startsWith("MD ")
                            )?.value;

                            setHoveredId(pickedId ?? null);
                            setHoveredMd(Number(pickedMd) ?? null);
                        }
                    },
                }),

                new WellMarkersLayer({
                    id: "volve_wells_markers_static",
                    name: "Well Markers",
                    data: fixedHoverMarkers,
                    applyModelMatrix: props.applyModelMatrix,
                    shape: "circle",
                    sizeUnits: "meters",
                    ZIncreasingDownwards: false,
                }),

                new TextLayer({
                    id: "markers_label",
                    data: fixedHoverMarkers,
                    getTextAnchor: "start",
                    getPixelOffset: [24, 0],
                    getSize: 16,
                    getText: (d: MarkerDataWithMd) => `MD: ${d.md.toFixed(1)}`,
                }),

                new WellMarkersLayer({
                    id: "volve_wells_markers",
                    name: "Well Markers",
                    // Updating data each render is bad practice; we instead have a dummy object, and instead just provide all info directly in the getters
                    data: ["DUMMY"],
                    shape: "circle",
                    sizeUnits: "meters",
                    applyModelMatrix: props.applyModelMatrix,
                    ZIncreasingDownwards: false,
                    getPosition: hoverMarkerData.position,
                    getSize: hoverMarkerData.size,
                    getAzimuth: hoverMarkerData.azimuth,
                    getInclination: hoverMarkerData.inclination,
                    getColor: hoverMarkerData.color,
                    getOutlineColor: hoverMarkerData.outlineColor,
                }),
            ],
            [
                fixedHoverMarkers,
                hoverMarkerData.azimuth,
                hoverMarkerData.color,
                hoverMarkerData.inclination,
                hoverMarkerData.outlineColor,
                hoverMarkerData.position,
                hoverMarkerData.size,
                partialVolveWells,
                props.applyModelMatrix,
            ]
        );

        return <SubsurfaceViewer {...props} layers={layers} />;
    },
};

function isWellsPickInfo(obj: PickingInfo): obj is WellsPickInfo {
    if (!obj || !obj.object) return false;

    const wellFeature = obj.object as WellFeature;
    return Boolean(
        wellFeature && wellFeature.properties && wellFeature.properties.md
    );
}

function getMarkerDataAtMd(
    well: WellFeature,
    md: number,
    args: {
        overrideColor?: Color;
        colorAlpha?: number;
    } = {}
): MarkerDataWithMd {
    const wellMds = well.properties.md[0];
    const wellTrajectory = getLineStringGeometry(well)!.coordinates;

    const [segmentStart, segmentEnd, lengthAlong] = getSegmentIndicesForMd(
        wellMds,
        md
    );

    const segStartPos = [...wellTrajectory[segmentStart]];
    const segEndPos = [...wellTrajectory[segmentEnd]];

    const position = [
        segStartPos[0] + (segEndPos[0] - segStartPos[0]) * lengthAlong,
        segStartPos[1] + (segEndPos[1] - segStartPos[1]) * lengthAlong,
        segStartPos[2] + (segEndPos[2] - segStartPos[2]) * lengthAlong,
    ] as const;

    const { azimuth, inclination } = getAziAndInclForSegment(
        segStartPos,
        segEndPos
    );

    const color = args.overrideColor ?? well.properties.color ?? [255, 0, 0];

    return {
        position: position,
        azimuth: azimuth,
        inclination: inclination,
        md: md,
        size: 20,
        // Set alpha regardless of other color
        color: [color[0], color[1], color[2], args.colorAlpha ?? 115],
        outlineColor: [0, 0, 0, args.colorAlpha ?? 115],
    };
}
