import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";

const defaultProps = {
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getLineColor: (d) => d.properties.color,
};

export type FaultLinesLayerProps<D> = GeoJsonLayerProps<D>;
export default class FaultLinesLayer extends GeoJsonLayer<
    unknown,
    GeoJsonLayerProps<unknown>
> {}

FaultLinesLayer.layerName = "FaultLinesLayer";
FaultLinesLayer.defaultProps = defaultProps;
