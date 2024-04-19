import type { FeatureCollection, GeometryCollection, Position } from "geojson";
import { cloneDeep, zip } from "lodash";
import { distance } from "mathjs";

function computeUnfoldedPath(worldCoordinates: Position[]): Position[] {
    const z = worldCoordinates.map((v) => v[2]);
    const delta = worldCoordinates.map((v, i, coordinates) => {
        const prev = coordinates[i - 1] || v;
        return distance([prev[0], prev[1]], [v[0], v[1]]);
    });
    const a: number[] = [];
    delta.forEach((d) => {
        const prev = a.at(-1) || 0;
        a.push((d as number) + prev);
    });
    const vAbscissa = zip(a, z, [...a].fill(0));

    return vAbscissa as Position[];
}

/** Projects well trajectories unfolded onto an XY plane.  */
export function abscissaTransform(
    featureCollection: FeatureCollection<GeometryCollection>
) {
    const featureCollectionCopy = cloneDeep(featureCollection);
    for (const feature of featureCollectionCopy.features) {
        const geometryCollection = feature.geometry;
        for (const geometry of geometryCollection.geometries) {
            if ("LineString" === geometry.type) {
                const transformedCoordinates = computeUnfoldedPath(
                    geometry.coordinates
                );
                geometry.coordinates = transformedCoordinates;
            } else if ("Point" === geometry.type) {
                const coordinates = geometry.coordinates;
                geometry.coordinates = [0, coordinates[2], 0];
            }
        }
    }

    return featureCollectionCopy;
}
