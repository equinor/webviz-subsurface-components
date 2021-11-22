import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { Feature } from "geojson";
import { layersDefaultProps } from "../layersDefaultProps";

const getColor = (d: Feature): RGBAColor => {
    const c: RGBAColor = d?.properties?.["color"];
    const r = c[0] ?? 0;
    const g = c[1] ?? 0;
    const b = c[2] ?? 0;
    return [r, g, b, 30]; // make fill color transparent
};

export type FaultPolygonsLayerProps<D> = GeoJsonLayerProps<D>;
export default class FaultPolygonsLayer extends CompositeLayer<
    unknown,
    FaultPolygonsLayerProps<unknown>
> {
    renderLayers(): GeoJsonLayer<unknown>[] {
        const layer = new GeoJsonLayer<unknown>(
            this.getSubLayerProps<unknown, GeoJsonLayer<unknown>>({
                id: this.props.id,
                data: this.props.data,
                pickable: this.props.pickable,
                visible: this.props.visible,
                filled: this.props.filled,
                lineWidthMinPixels: this.props.lineWidthMinPixels,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                getLineColor: (d: Feature) =>
                    d?.properties?.["color"] ?? [0, 0, 0, 255],
                getFillColor: getColor,
            })
        );
        return [layer];
    }
}

FaultPolygonsLayer.layerName = "FaultPolygonsLayer";
FaultPolygonsLayer.defaultProps = layersDefaultProps[
    "FaultPolygonsLayer"
] as FaultPolygonsLayerProps<unknown>;
