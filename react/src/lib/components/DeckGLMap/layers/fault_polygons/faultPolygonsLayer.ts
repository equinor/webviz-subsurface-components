import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { Feature } from "geojson";

const getColor = (d: Feature): RGBAColor => {
    const c: RGBAColor = d?.properties?.color;
    const r = c[0] ?? 0;
    const g = c[1] ?? 0;
    const b = c[2] ?? 0;
    return [r, g, b, 30]; // make fill color transparent
};

const defaultProps = {
    pickable: true,
    filled: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getLineColor: (d: Feature) => d?.properties?.color ?? [0, 0, 0, 255],
    getFillColor: getColor,
};

export type FaultPolygonsLayerProps<D> = GeoJsonLayerProps<D>;
export default class FaultPolygonsLayer extends GeoJsonLayer<
    unknown,
    GeoJsonLayerProps<unknown>
> {}

FaultPolygonsLayer.layerName = "FaultPolygonsLayer";
FaultPolygonsLayer.defaultProps = defaultProps;
