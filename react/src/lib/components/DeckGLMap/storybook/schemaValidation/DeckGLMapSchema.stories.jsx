import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { sampleLogData, sampleWellsData, samplePieData } from "./sampleData";
import exampleData from "../../../../../demo/example-data/deckgl-map.json";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/schemaValidation",
};

// Template for when edited data needs to be captured.
const DeckGLMapTemplate = (args) => {
    return <DeckGLMap {...args} />;
};

export const wellsLayerValidation = DeckGLMapTemplate.bind();
wellsLayerValidation.args = {
    ...exampleData[0],
    layers: [
        {
            ...exampleData[0].layers[4],
            data: sampleWellsData,
            logData: sampleLogData,
        },
    ],
    legend: {
        visible: false,
    },
    checkDatafileSchema: true,
};

export const pieLayerValidation = DeckGLMapTemplate.bind();
pieLayerValidation.args = {
    ...exampleData[0],
    layers: [
        {
            "@@type": "PieChartLayer",
            data: samplePieData,
        },
    ],
    checkDatafileSchema: true,
};
