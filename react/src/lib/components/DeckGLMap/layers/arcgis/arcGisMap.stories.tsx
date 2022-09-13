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
  // viewState: {
  //   longitude: -122.4,
  //   latitude: 37.74,
  //   zoom: 11,
  //   maxZoom: 20,
  //   pitch: 30,
  //   bearing: 0
  // },
  // controller: true,
  URL: "https://c.tile.openstreetmap.org/0/0/0.png",
  // zoom: 0,
}