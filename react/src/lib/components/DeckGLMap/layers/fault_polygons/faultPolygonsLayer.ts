import { COORDINATE_SYSTEM, Color, CompositeLayer } from "@deck.gl/core/typed";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { Feature } from "geojson";
import { layersDefaultProps } from "../layersDefaultProps";

const getColor = (d: Feature): Color => {
    const c: Color = d?.properties?.["color"];
    const r = c[0] ?? 0;
    const g = c[1] ?? 0;
    const b = c[2] ?? 0;
    return [r, g, b, 30]; // make fill color transparent
};

export type FaultPolygonsLayerProps = GeoJsonLayerProps;
export default class FaultPolygonsLayer extends CompositeLayer<FaultPolygonsLayerProps> {
    renderLayers(): GeoJsonLayer<Feature>[] {
        const layer = new GeoJsonLayer<Feature>(
            this.getSubLayerProps({
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
] as FaultPolygonsLayerProps;
