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
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getLineColor: (d) => d.properties.color,
    getFillColor: getColor,
};

export type FaultLinesLayerProps<D> = GeoJsonLayerProps<D>;
export default class FaultLinesLayer extends GeoJsonLayer<
    unknown,
    GeoJsonLayerProps<unknown>
> {}

FaultLinesLayer.layerName = "FaultLinesLayer";
FaultLinesLayer.defaultProps = defaultProps;
