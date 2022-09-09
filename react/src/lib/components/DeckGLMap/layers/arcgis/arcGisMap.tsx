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
const URL = "https://ndgishub.nd.gov/arcgis/services/All_Transportation/MapServer/WMSServer?bbox=-180,-90,180,90&format=image/png&height=512&layers=Airports,Roads&request=GetMap&service=WMS&srs=EPSG:4326&styles=&version=1.1.1&width=512";

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

export default function ArcGisMap( {viewstate} ) {

  const coordinates: coordinates = getCoordinates(URL)

  const layer = new TileLayer({
    data: URL,
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    
    renderSubLayer: props => {
      const {
        bbox: {west, south, east, north},
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });

  return <DeckGL viewState={viewstate} layers={[layer]} />;
}
