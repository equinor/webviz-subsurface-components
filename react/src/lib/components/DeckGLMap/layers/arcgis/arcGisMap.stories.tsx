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
  west: -180,
  south: -90,
  east: 180,
  north: 90
}