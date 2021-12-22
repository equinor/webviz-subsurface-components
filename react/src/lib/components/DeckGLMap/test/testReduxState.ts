import { getLayersWithDefaultProps } from "../layers/utils/layerTools";

// eslint-disable-next-line
const exampleData = require("../../../../demo/example-data/deckgl-map.json")

const demoData = exampleData[0].layers;
const view3d = false;
const layers = getLayersWithDefaultProps(demoData, view3d);
export const testState = layers;
