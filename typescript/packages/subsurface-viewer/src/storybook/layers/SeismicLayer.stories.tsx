import React from "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { expect, userEvent, waitFor } from "storybook/test";

import { View } from "@deck.gl/core";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import InfoCard from "../../components/InfoCard";
import type { MapMouseEvent } from "../../components/Map";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Seismic Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
const cage = {
    origin: [-2808.4, -6505.9, 1071.3],
    edgeU: [-275.5, 11609.4, 0],
    edgeV: [6234.6, 147.9, 0],
    edgeW: [0, 0, 1303],
};

/*
 Vertices of a section in the seismic data.
 ^  P01  P11
 |
 Y
 |  P00  P10   
 +---X--->

 sectionZ0Vertices= [ P00, P10, P01, P11 ]
 */
/* prettier-ignore */
const sectionZ0Vertices = [
    -2808.4, -6505.9, 1071.3,
     3426.2, -6358,   1071.3,
    -3083.9,  5103.5, 1071.3,
     3150.7,  5251.4, 1071.3,
];
const sectionZ0TexCoords = [0, 0, 1, 0, 0, 1, 1, 1];
const sectionZ0Indices = [0, 1, 2, 3];

const section0Props = {
    topology: "triangle-strip",
    vertices: sectionZ0Vertices,
    vertexIndices: { value: sectionZ0Indices, size: 4 },
};
const section0TexProps = {
    ...section0Props,
    texCoords: sectionZ0TexCoords,
    valueMap: {
        width: 115,
        height: 103,
        values: "seismic_Z0_115_103.float32",
    },
};

const seismicBounds = [-3083.9, -6505.9, -1071.3, 3426.2, 5251.4, -2374.3];

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const seismicCageLayerId = "seismic_cage_layer";
const seismicSectionsLayerId = "seismic_section_layer";

const injectedProps = {
    //     [seismicCageLayerId]: {
    //         polylinePoints: new Float32Array(cagePoints),
    //         startIndices: new Uint32Array(cageStartIndices),
    //     },
};

function getInjectedProps() {
    return injectedProps;
}

// Small example using polylinesLayer.
const seismicCageLayer = {
    "@@type": "SeismicLayer",
    id: seismicCageLayerId,
    cage: {
        ...cage,
        color: [0, 200, 100],
        widthUnits: "pixels",
        lineWidth: 3,
    },
    ZIncreasingDownwards: true,
};

const colormapSetup = {
    valueRange: [-1, 1],
    clampRange: [-1, 1],
    clampColor: [0, 255, 0, 200],
    undefinedColor: [255, 0, 0, 200],
    smooth: false,
};

const seismicSectionsLayer = {
    ...seismicCageLayer,
    id: seismicSectionsLayerId,
    seismicFences: [section0TexProps],
    showMesh: false,
    colormap: { colormapName: "seismic" },
    colormapSetup: colormapSetup,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: seismicBounds,
    ZIncreasingDownwards: false,
};

export const SeismicCage: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "seismic_cage",
        layers: [smallAxesLayer, seismicCageLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
};

export const SeismicSections: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        id: "seismic_sections",
        layers: [smallAxesLayer, seismicSectionsLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
};

const seismicSectionsManualRangeLayer = {
    ...seismicSectionsLayer,
    id: "seismic_sections_manual_range",
    colormapSetup: {
        ...colormapSetup,
        valueRange: [-0.5, 0.5],
        clampRange: [-0.5, 0.5],
    },
};

const SeismicSectionsManualRangeReadout: React.FC = () => {
    const [event, setEvent] = React.useState<MapMouseEvent>({
        type: "hover",
        infos: [],
    });

    return (
        <SubsurfaceViewer
            id="seismic_sections_manual_range"
            layers={[smallAxesLayer, seismicSectionsManualRangeLayer]}
            views={default3DViews}
            showReadout={false}
            pickingDepth={1}
            onMouseEvent={setEvent}
        >
            {/* @ts-expect-error Deck.gl View children are not included in SubsurfaceViewer's child type. */}
            <View id="view_1">
                <InfoCard pickInfos={event.infos} />
            </View>
        </SubsurfaceViewer>
    );
};

export const SeismicSectionsManualColorRange: StoryObj<
    typeof SeismicSectionsManualRangeReadout
> = {
    render: () => <SeismicSectionsManualRangeReadout />,
    play: async ({ canvasElement }) => {
        const deckCanvas = canvasElement.querySelector("canvas");
        if (!deckCanvas) {
            throw new Error("Deck.gl canvas not found");
        }

        const bounds = deckCanvas.getBoundingClientRect();
        const hoverAt = async (x: number, y: number) => {
            await userEvent.pointer({
                target: deckCanvas,
                coords: {
                    clientX: bounds.left + bounds.width * x,
                    clientY: bounds.top + bounds.height * y,
                },
            });
            await new Promise<void>((resolve) =>
                requestAnimationFrame(() => resolve())
            );
        };
        const readPropertyValue = (): number | undefined => {
            const propertyRows = canvasElement.querySelectorAll(
                'table[aria-label="properties"] tr'
            );
            for (const row of propertyRows) {
                const cells = row.querySelectorAll("td");
                if (cells[0]?.textContent?.includes("Property")) {
                    const value = Number.parseFloat(
                        cells[1]?.textContent ?? ""
                    );
                    return Number.isFinite(value) ? value : undefined;
                }
            }
            return undefined;
        };

        let outsideRangePosition: { x: number; y: number } | undefined;
        for (
            let y = 0.35;
            y <= 0.9 && outsideRangePosition === undefined;
            y += 0.05
        ) {
            for (
                let x = 0.4;
                x <= 0.7 && outsideRangePosition === undefined;
                x += 0.05
            ) {
                await hoverAt(x, y);
                const value = readPropertyValue();
                if (value !== undefined && Math.abs(value) > 0.6) {
                    outsideRangePosition = { x, y };
                }
            }
        }

        if (outsideRangePosition === undefined) {
            throw new Error(
                "No sample outside the manual color interval was picked"
            );
        }

        // The readout can lag one pointer event behind, so hover the found
        // sample again and wait until its value is shown; the screenshot
        // captures this final state.
        await hoverAt(outsideRangePosition.x, outsideRangePosition.y);
        await waitFor(() => {
            expect(Math.abs(readPropertyValue() ?? 0)).toBeGreaterThan(0.6);
        });
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "The interaction hovers a seismic sample outside the manual color interval and verifies its value in the readout.",
            },
        },
    },
};

const seismicSectionsWithMaterialLayer = {
    ...seismicSectionsLayer,
    id: "seismic_sections_with_material",
    material: {
        ambient: 0.35,
        diffuse: 0.9,
        shininess: 32,
        specularColor: [38, 38, 38],
    },
};

export const SeismicSectionsWithMaterial: StoryObj<
    typeof SubsurfaceViewerPropsInjector
> = {
    args: {
        id: "seismic_sections",
        layers: [smallAxesLayer, seismicSectionsWithMaterialLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
};
