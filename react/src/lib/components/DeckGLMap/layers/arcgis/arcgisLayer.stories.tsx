import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import ArcGisLayer from "./arcgisLayer";

type defaultPropsType = {
    fillColor?: any;
    baseMap?: string;
    layerURL: string;
    zoom?: number;
};

const url =
    "https://factmaps.npd.no/arcgis/rest/services/FactMaps/3_0/MapServer/502/query?where=fldName+%3D+%27HEIDRUN%27&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&featureEncoding=esriDefault&f=pjson";

const url2 =
    "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / ArcGIS",
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof ArcGisLayer> = (
    args: defaultPropsType
) => {
    return <ArcGisLayer {...args} />;
};

export const Heidrun = Template.bind({});
Heidrun.args = {
    layerURL: url,
    baseMap: "topo-vector",
    fillColor: [234, 243, 221],
    zoom: 9,
};
