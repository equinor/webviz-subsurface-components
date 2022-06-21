import { GeoJsonLayer, GeoJsonLayerProps, PathLayer } from "@deck.gl/layers";
import { Feature, FeatureCollection } from "geojson";
import { LineString } from "geojson";
import { zip } from "lodash";
import { distance } from "mathjs";

interface UnfoldedGeoJsonLayerProps<D> extends GeoJsonLayerProps<D> {
    isIntersectionView?: boolean;
}

function getUnfoldedPath(object: Feature) {
    const worldCoordinates = (object.geometry as LineString).coordinates;
    const z = worldCoordinates.map((v) => v[2]);
    const delta = worldCoordinates.map((v, i, coordinates) => {
        const prev = coordinates[i - 1] || v;
        return distance([prev[0], prev[1]], [v[0], v[1]]);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a: any[] = [];
    delta.forEach((d) => {
        const prev = a.at(-1) || 0;
        a.push(d + prev);
    });
    const planeY = 2000;
    const vAbscissa = zip(a, [...a].fill(planeY), z);

    return vAbscissa;
}

export default class UnfoldedGeoJsonLayer<
    D = FeatureCollection
> extends GeoJsonLayer<D, UnfoldedGeoJsonLayerProps<D>> {
    renderLayers(): [PathLayer<D>] {
        const layers = super.renderLayers();
        // const is_intersection_view =
        //     this.context.viewport.constructor.name === "IntersectionViewport";
        // if (is_intersection_view) {
        const path_layer_id = layers.findIndex(
            (layer) => layer?.[1].constructor.name == "PathLayer"
        );
        const pathLayer = layers[path_layer_id]?.[1];
        const unfoldedPathLayer = pathLayer.clone({
            getPath: getUnfoldedPath,
        });
        return [unfoldedPathLayer];
    }
}

UnfoldedGeoJsonLayer.layerName = "UnfoldedGeoJsonLayer";
UnfoldedGeoJsonLayer.defaultProps = {
    isIntersectionView: false,
};
