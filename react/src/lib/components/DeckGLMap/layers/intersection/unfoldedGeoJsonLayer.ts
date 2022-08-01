import { Layer, Position3D, Viewport } from "deck.gl";
import { GeoJsonLayer, GeoJsonLayerProps, PathLayer } from "@deck.gl/layers";
import { Feature, FeatureCollection } from "geojson";
import { LineString } from "geojson";
import { zip } from "lodash";
import { distance } from "mathjs";
import AxesLayer from "../axes/axesLayer";

const planeY = 2000;

function getUnfoldedPath(object: Feature): Position3D[] {
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
    const vAbscissa = zip(a, [...a].fill(planeY), z);

    return vAbscissa as Position3D[];
}

function getBoundingBox(
    coordinates: Position3D[]
): [number, number, number, number, number, number] {
    const x_min = 0;
    const y_min = planeY;
    const y_max = planeY;

    const x_max = Math.max.apply(
        null,
        coordinates.map(function (i) {
            return i[0];
        })
    );
    const z_min = Math.min.apply(
        null,
        coordinates.map(function (i) {
            return i[2];
        })
    );
    const z_max = Math.max.apply(
        null,
        coordinates.map(function (i) {
            return i[2];
        })
    );

    return [x_min, y_min, z_min, x_max, y_max, z_max];
}

export default class UnfoldedGeoJsonLayer<
    D = FeatureCollection
> extends GeoJsonLayer<D, GeoJsonLayerProps<D>> {
    renderLayers(): PathLayer<D>[] {
        const layers = super.renderLayers();

        const pathLayer = layers
            .flat()
            .find((layer) => layer?.constructor.name === "PathLayer");
        if (pathLayer == undefined) return layers;

        const unfoldedPathLayer = pathLayer.clone({
            id: pathLayer.id + "-for-intersection-view",
            getPath: getUnfoldedPath,
        });
        // add a new unfolded sub layer and render it only in Intersection view
        layers.push(unfoldedPathLayer);

        const axes = new AxesLayer({
            name: "Axes",
            id: pathLayer.id + "-axes-for-intersection-view",
            bounds: getBoundingBox(
                getUnfoldedPath(unfoldedPathLayer.props.data[0])
            ),
        });
        layers.push(axes);

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
            return layer.id.search("-for-intersection-view") != -1;
        }
        return layer.id.search("-for-intersection-view") == -1;
    }
}

UnfoldedGeoJsonLayer.layerName = "UnfoldedGeoJsonLayer";
