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
import exampleData from "../../../../../demo/example-data/deckgl-map.json";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/SchemaValidation",
};

// Template for when edited data needs to be captured.
const StoryTemplate = (args) => {
    return <SubsurfaceViewer {...args} />;
};

export const WellsLayerValidation = StoryTemplate.bind();
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

export const PieLayerValidation = StoryTemplate.bind();
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

export const GridLayerValidation = StoryTemplate.bind();
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

export const FaultPolygonsValidation = StoryTemplate.bind();
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

export const ColorTableValidation = StoryTemplate.bind();
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
