import type { Meta, StoryObj } from "@storybook/react-webpack5";

import type { ColorTable } from "@emerson-eps/color-tables";

import SubsurfaceViewer, {
    type SubsurfaceViewerProps,
} from "../../SubsurfaceViewer";
import {
    sampleLogData,
    sampleWellsData,
    samplePieData,
    sampleGridData,
    sampleColorTable,
    sampleFaultPolygonsData,
} from "./sampleData";
import exampleDataJson from "../../../../../../example-data/deckgl-map.json";

const exampleData = exampleDataJson as unknown as SubsurfaceViewerProps[];

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/SchemaValidation",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

export const WellsLayerValidation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...exampleData[0],
        layers: [
            {
                ...exampleData[0]?.layers?.[4],
                data: sampleWellsData,
                logData: sampleLogData,
            },
            {
                ...exampleData[0]?.layers?.[6],
            },
        ],
        checkDatafileSchema: true,
    },
};

export const PieLayerValidation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...exampleData[0],
        layers: [
            {
                "@@type": "PieChartLayer",
                data: samplePieData,
            },
        ],
        checkDatafileSchema: true,
    },
};

export const GridLayerValidation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...exampleData[0],
        layers: [
            {
                ...exampleData[0].layers?.[2],
                data: sampleGridData,
                visible: true,
            },
        ],
        checkDatafileSchema: true,
    },
};

export const FaultPolygonsValidation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...exampleData[0],
        layers: [
            {
                "@@type": "FaultPolygonsLayer",
                data: sampleFaultPolygonsData,
            },
        ],
        checkDatafileSchema: true,
    },
};

export const ColorTableValidation: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...exampleData[0],
        layers: [
            {
                ...exampleData[0].layers?.[4],
                logColor: "Colors_set_5",
                logRadius: 15,
            },
        ],
        colorTables: sampleColorTable as unknown as ColorTable[],
        checkDatafileSchema: true,
    },
};
