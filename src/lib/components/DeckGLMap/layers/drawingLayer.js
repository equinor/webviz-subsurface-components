import { EditableGeoJsonLayer } from "nebula.gl";

const defaultProps = {};

export default class DrawingLayer extends EditableGeoJsonLayer {}

DrawingLayer.layerName = "DrawingLayer";
DrawingLayer.defaultProps = defaultProps;
