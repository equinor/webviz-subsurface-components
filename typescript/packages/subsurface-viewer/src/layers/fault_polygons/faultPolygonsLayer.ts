import type { Color } from "@deck.gl/core";
import { COORDINATE_SYSTEM, CompositeLayer } from "@deck.gl/core";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { Feature } from "geojson";

const getColor = (d: Feature): Color => {
    const c: Color = d?.properties?.["color"];
    const r = c[0] ?? 0;
    const g = c[1] ?? 0;
    const b = c[2] ?? 0;
    return [r, g, b, 30]; // make fill color transparent
};

export interface FaultPolygonsLayerProps extends GeoJsonLayerProps {
    // Enable/disable depth testing when rendering layer. Default true.
    depthTest: boolean;
}

const defaultProps = {
    "@@type": "FaultPolygonsLayer",
    name: "Fault polygons",
    id: "fault-polygons-layer",
    pickable: true,
    visible: true,
    filled: true,
    lineWidthMinPixels: 2,
    depthTest: true,
};

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
                parameters: {
                    depthTest: this.props.depthTest,
                },
            })
        );
        return [layer];
    }
}

FaultPolygonsLayer.layerName = "FaultPolygonsLayer";
FaultPolygonsLayer.defaultProps = defaultProps;
