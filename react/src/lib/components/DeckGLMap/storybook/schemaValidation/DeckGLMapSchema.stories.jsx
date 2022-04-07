import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { sampleLogData, sampleWellsData, samplePieData } from "./sampleData";
import exampleData from "../../../../../demo/example-data/deckgl-map.json";

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
};

// Template for when edited data needs to be captured.
const EditDataTemplate = (args) => {
    return <DeckGLMap {...args} />;
};

export const mapValidator = EditDataTemplate.bind();
mapValidator.args = {
    ...exampleData[0],
    layers: [
        {
            ...exampleData[0].layers[4],
            data: sampleWellsData,
            logData: sampleLogData,
        },
        {
            "@@type": "PieChartLayer",
            data: samplePieData,
        },
    ],
    legend: {
        visible: false,
    },
    checkDatafileSchema: true,
};
