import { getLayersWithDefaultProps } from "../layers/utils/layerTools";

// eslint-disable-next-line
const exampleData = require("../../../../demo/example-data/deckgl-map.json")

const demoData = exampleData[0].layers;
const layers = getLayersWithDefaultProps(demoData);
export const testState = { layers: layers };
