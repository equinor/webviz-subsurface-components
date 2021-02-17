import { GeoJsonLayer } from "@deck.gl/layers";

const defaultProps = {
    pickable: true,
    pointRadiusMinPixels: 7,
    pointRadiusMaxPixels: 13,
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 2,
};

export default class WellsLayer extends GeoJsonLayer {}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
