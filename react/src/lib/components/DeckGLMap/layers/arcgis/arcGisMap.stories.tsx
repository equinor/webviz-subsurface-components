/* eslint-disable prettier/prettier */
import React from "react";
import ArcGisMap from "./arcGisMap"

export default {
  title: "DeckGlMap/ArcGis",
  component: "ArcGis",
  argTypes: {}
}

const Template = (args: any): any => (<ArcGisMap {...args} />)

export const Map = Template.bind({})
Map.args = {
  mapURL: "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0",
}