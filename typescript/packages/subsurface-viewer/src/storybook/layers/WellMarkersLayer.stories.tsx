import React from "react";

import type { Color, PickingInfo } from "@deck.gl/core";
import { TextLayer } from "@deck.gl/layers";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { clamp } from "lodash";
import { all, create } from "mathjs";

import volveWellsJson from "../../../../../../example-data/volve_wells.json";
import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { WellMarkersLayer, WellsLayer } from "../../layers";
import type { WellMarkerDataT } from "../../layers/well_markers/wellMarkersLayer";
import type {
    WellFeature,
    WellFeatureCollection,
    WellsPickInfo,
} from "../../layers/wells/types";
import {
    getAziAndInclForSegment,
    getLineStringGeometry,
    getSegmentIndicesForMd,
} from "../../layers/wells/utils/trajectory";
import { getPropsInjectorComponent } from "../sharedHelperComponents";
import {
    default3DViews,
    defaultStoryParameters,
    volveWellsBounds,
    volveWellsCameraPosition3D,
} from "../sharedSettings";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Well Markers Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
const math = create(all, { randomSeed: "1984" });

type TRandomNumberFunc = (max: number) => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math?.random) {
        return (max: number) => {
            return math.random(max);
        };
    }
    return (max: number) => Math.random() * max;
})();

const generateMarkers = (): WellMarkerDataT[] => {
    const N = 40;
    const M = 40;

    const dN = (2 * Math.PI) / N;
    const dM = (5 * Math.PI) / M;

    const res: WellMarkerDataT[] = [];

    for (let i = 0; i < N; ++i) {
        for (let j = 0; j < M; ++j) {
            const x = -N / 2 + i;
            const y = -M / 2 + j;
            const az = dN * i;
            const incl = dM * j;

            const z = 5 * (Math.sin(incl) * Math.cos(az));
            res.push({
                position: [x, y, z],
                azimuth: (az * 180) / Math.PI,
                inclination: (Math.asin(Math.cos(incl)) * 180) / Math.PI,
                color: [randomFunc(255), randomFunc(255), randomFunc(255), 100],
                outlineColor: [0, 0, 100, 255],
                size: 0.02 * Math.sqrt(x * x + y * y),
            });
        }
    }
    return res;
};

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const wellMarkersLayerId = "typedData_surface_layer";

const injectedProps = {
    [wellMarkersLayerId]: {
        data: generateMarkers(),
    },
};

function getInjectedProps() {
    return injectedProps;
}

export const WellMarkers: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        bounds: [-30, -30, 30, 30],
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "well-markers-tttt",
        layers: [
            {
                "@@type": "AxesLayer",
                id: "well-markers-axes",
                bounds: [-25, -25, -25, 25, 25, 25],
                ZIncreasingDownwards: false,
            },
            {
                "@@type": "NorthArrow3DLayer",
                id: "north-arrow-layer",
            },
            {
                "@@type": "WellMarkersLayer",
                id: wellMarkersLayerId,
                pickable: true,
                shape: "circle",
                sizeUnits: "common",
                data: "data proxy",
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Well Markers Layer.",
            },
        },
    },
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
        cameraPosition: volveWellsCameraPosition3D,
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
