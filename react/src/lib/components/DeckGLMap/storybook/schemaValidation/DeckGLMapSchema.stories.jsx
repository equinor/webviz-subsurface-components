import React from "react";
import DeckGLMap from "../../DeckGLMap";
import {
    sampleLogData,
    sampleWellsData,
    samplePieData,
    sampleGridData,
} from "./sampleData";
import exampleData from "../../../../../demo/example-data/deckgl-map.json";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/SchemaValidation",
};

// Template for when edited data needs to be captured.
const DeckGLMapTemplate = (args) => {
    return <DeckGLMap {...args} />;
};

export const WellsLayerValidation = DeckGLMapTemplate.bind();
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

export const PieLayerValidation = DeckGLMapTemplate.bind();
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

export const GridLayerValidation = DeckGLMapTemplate.bind();
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
