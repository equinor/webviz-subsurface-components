import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import {
    sampleLogData,
    sampleWellsData,
    samplePieData,
    sampleGridData,
    sampleColorTable,
    sampleFaultPolygonsData,
} from "./sampleData";
import exampleData from "../../../../../../example-data/deckgl-map.json";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/SchemaValidation",
};

// Template for when edited data needs to be captured.
// @ts-expect-error TS7006
const StoryTemplate = (args) => {
    return <SubsurfaceViewer {...args} />;
};

// @ts-expect-error TS2555
export const WellsLayerValidation = StoryTemplate.bind();
// @ts-expect-error TS2339
WellsLayerValidation.args = {
    ...exampleData[0],
    layers: [
        {
            ...exampleData[0].layers[4],
            data: sampleWellsData,
            logData: sampleLogData,
        },
        {
            ...exampleData[0].layers[6],
        },
    ],
    legend: {
        visible: false,
    },
    checkDatafileSchema: true,
};

// @ts-expect-error TS2555
export const PieLayerValidation = StoryTemplate.bind();
// @ts-expect-error TS2339
PieLayerValidation.args = {
    ...exampleData[0],
    layers: [
        {
            "@@type": "PieChartLayer",
            data: samplePieData,
        },
    ],
    checkDatafileSchema: true,
};

// @ts-expect-error TS2555
export const GridLayerValidation = StoryTemplate.bind();
// @ts-expect-error TS2339
GridLayerValidation.args = {
    ...exampleData[0],
    layers: [
        {
            ...exampleData[0].layers[2],
            data: sampleGridData,
            visible: true,
        },
    ],
    checkDatafileSchema: true,
};

// @ts-expect-error TS2555
export const FaultPolygonsValidation = StoryTemplate.bind();
// @ts-expect-error TS2339
FaultPolygonsValidation.args = {
    ...exampleData[0],
    layers: [
        {
            "@@type": "FaultPolygonsLayer",
            data: sampleFaultPolygonsData,
        },
    ],
    checkDatafileSchema: true,
};

// @ts-expect-error TS2555
export const ColorTableValidation = StoryTemplate.bind();
// @ts-expect-error TS2339
ColorTableValidation.args = {
    ...exampleData[0],
    layers: [
        {
            ...exampleData[0].layers[4],
            logColor: "Colors_set_5",
            logRadius: 15,
        },
    ],
    colorTables: sampleColorTable,
    checkDatafileSchema: true,
};
