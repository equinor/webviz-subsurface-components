import React from "react";
import LayersButton from "../../../components/settings/LayersButton";
import { getLayersWithDefaultProps } from "../../../../SubsurfaceViewer/layers/utils/layerTools";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);

export default {
    component: LayersButton,
    title: "SubsurfaceViewer/Components/Settings/LayersButton",
};

const Template = (args) => {
    return <LayersButton id={"layers-button"} layers={args.layers} />;
};

export const Default = Template.bind({});
Default.args = {
    layers: layers,
};
