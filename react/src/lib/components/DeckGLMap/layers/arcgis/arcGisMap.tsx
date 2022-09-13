/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/prop-types */
import React from "react";
import DeckGL from "@deck.gl/react";
import { BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";

/* Types Definitions */
type coordinates = { west:number, south:number, east:number, north:number }
type getCoordinatesFunction = (url:string) => coordinates


/* Constants Definitions */
// square
const URL_1 = "https://ndgishub.nd.gov/arcgis/services/All_Transportation/MapServer/WMSServer?bbox=-180,-90,180,90&format=image/png&height=512&layers=Airports,Roads&request=GetMap&service=WMS&srs=EPSG:4326&styles=&version=1.1.1&width=512";

// map
const URL_2 = "https://c.tile.openstreetmap.org/0/0/0.png"

// npd w/ argis
const URL_3 = "https://factmaps.npd.no/arcgis/services/FactMaps_ogc/3_0_WGS84_z32/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=1"

const URL_4 = "https://map.bgs.ac.uk/arcgis/rest/services/GeoIndex_Onshore/hydrogeology/MapServer//export?dpi=96&transparent=true&format=png&layers=show:0&bbox=-18.57711821048096,49.844261145603,12.61594729098715,58.66349271362658&bboxSR=4326&imageSR=27700&size=1680,914&f=image"

const URL_5 = "https://factmaps.npd.no/arcgis/services/FactMaps_ogc/3_0_ED50_z32/MapServer/WmsServer?version=1.3.0%26service=WMS%26request=GetSchemaExtension"

/* Supporting Functions */
const getCoordinates: getCoordinatesFunction = (url) => {
  const substringQuery:string = url.substring(url.indexOf("bbox=")+5, url.indexOf("&"));
  const coordinates = substringQuery.split(",").map(coordinate => Number(coordinate));
  return {
    west: coordinates[0],
    south: coordinates[1],
    east: coordinates[2],
    north: coordinates[3],
  }
}

export default function ArcGisMap( {viewstate, URL, zoom} ) {

  // const coordinates: coordinates = getCoordinates(URL)

  const layer = new TileLayer({
    id: "TileLayer",
    data: URL,
    // minZoom: zoom | 0,
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    
    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north},
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        // zoom: zoom | 0,
        bounds: [west, south, east, north]
      });
    }
  });

  return <DeckGL viewState={viewstate} layers={[layer]} style={{width:"100%", height: "100vh"}} />;
}
