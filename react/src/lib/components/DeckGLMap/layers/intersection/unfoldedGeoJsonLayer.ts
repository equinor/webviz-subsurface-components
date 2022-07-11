import { Layer, Viewport } from "deck.gl";
import { GeoJsonLayer, GeoJsonLayerProps, PathLayer } from "@deck.gl/layers";
import { Feature, FeatureCollection } from "geojson";
import { LineString } from "geojson";
import { zip } from "lodash";
import { distance } from "mathjs";

function getUnfoldedPath(object: Feature) {
    const worldCoordinates = (object.geometry as LineString).coordinates;
    const first_x = worldCoordinates[0]?.[0];
    const y = worldCoordinates.map((v) => v[1]);
    const z = worldCoordinates.map((v) => v[2]);
    const delta = worldCoordinates.map((v, i, coordinates) => {
        const prev = coordinates[i - 1] || v;
        return distance([prev[0], prev[1]], [v[0], v[1]]);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a: any[] = [];
    delta.forEach((d) => {
        const prev = a.at(-1) || first_x;
        a.push(d + prev);
    });
    const vAbscissa = zip(a, y, z);

    return vAbscissa;
}

export default class UnfoldedGeoJsonLayer<
    D = FeatureCollection
> extends GeoJsonLayer<D, GeoJsonLayerProps<D>> {
    renderLayers(): PathLayer<D>[] {
        const layers = super.renderLayers();
        const path_layer_idx = layers.findIndex(
            (layer) => layer?.[1]?.constructor.name == "PathLayer"
        );

        if (path_layer_idx == -1) return layers;

        const pathLayer = layers[path_layer_idx]?.[1];
        const unfoldedPathLayer = pathLayer.clone({
            id: pathLayer.id + "-unfolded-path",
            getPath: getUnfoldedPath,
        });
        // add a new unfolded sub layer and render it only in Intersection view
        layers.push(unfoldedPathLayer);
        return layers;
    }

    filterSubLayer({
        layer,
        viewport,
    }: {
        layer: Layer<D>;
        viewport: Viewport;
    }): boolean {
        if (viewport.constructor.name === "IntersectionViewport") {
            return layer.id.search("-unfolded-path") != -1;
        }
        return layer.id.search("-unfolded-path") == -1;
    }
}

UnfoldedGeoJsonLayer.layerName = "UnfoldedGeoJsonLayer";
