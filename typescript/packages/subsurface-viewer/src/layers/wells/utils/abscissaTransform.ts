import type { FeatureCollection, GeometryCollection, Position } from "geojson";
import { cloneDeep, zip } from "lodash";
import { distance } from "mathjs";

export type AbscissaTransform = <TFeatureCollection extends FeatureCollection<GeometryCollection>>(
    featureCollection: TFeatureCollection
) => TFeatureCollection;

function computeUnfoldedPath(worldCoordinates: Position[]): {
    vAbscissa: Position[];
    maxAbscissa: number;
} {
    const z = worldCoordinates.map((v) => v[2]);
    const delta = worldCoordinates.map((v, i, coordinates) => {
        const prev = coordinates[i - 1] || v;
        return distance([prev[0], prev[1]], [v[0], v[1]]);
    });

    const a: number[] = [];
    let maxAbscissa = 0;

    for (const d of delta) {
        const prev = a.at(-1) || 0;
        const newA = (d as number) + prev;
        a.push(newA);
        maxAbscissa = Math.max(maxAbscissa, newA);
    }

    const vAbscissa = zip(a, z, new Array(a.length).fill(0));
    return { vAbscissa: vAbscissa as Position[], maxAbscissa };
}

/**
 * Returns the final (last) coordinate of the first LineString with at least one coordinate
 * found inside the supplied GeometryCollection.
 *
 * @param feature Geometry collection feature containing well geometries (Points / LineStrings).
 * @returns The last coordinate (xyz) of the first qualifying LineString, or null if none exist.
 */
export const getEndPoint = (feature: {
    geometry: GeometryCollection;
}): Position | null => {
    for (const geometry of feature.geometry.geometries) {
        if (geometry.type === "LineString" && geometry.coordinates.length > 0) {
            return geometry.coordinates.at(-1) || null;
        }
    }
    return null;
};

/**
 * Returns the starting (first) coordinate of the first LineString with at least one coordinate
 * found inside the supplied GeometryCollection.
 *
 * @param feature Geometry collection feature containing well geometries (Points / LineStrings).
 * @returns The first coordinate (xyz) of the first qualifying LineString, or null if none exist.
 */
export const getStartPoint = (feature: {
    geometry: GeometryCollection;
}): Position | null => {
    for (const geometry of feature.geometry.geometries) {
        if (geometry.type === "LineString" && geometry.coordinates.length > 0) {
            return geometry.coordinates.at(0) || null;
        }
    }
    return null;
};

/**
 * Computes the lateral (XY plane) Euclidean distance between the end of the first available
 * trajectory (LineString) in the first feature and the start of the first available trajectory
 * in the second feature. Z values are ignored in the distance calculation.
 *
 * @param feature1 Feature containing a GeometryCollection (source / previous well trajectory).
 * @param feature2 Feature containing a GeometryCollection (target / next well trajectory).
 * @returns Lateral distance in the same units as the input coordinates, or 0 if either trajectory endpoint is missing.
 */
export function calculateTrajectoryGap(
    feature1: { geometry: GeometryCollection },
    feature2: { geometry: GeometryCollection }
): number {
    const end1 = getEndPoint(feature1);
    const start2 = getStartPoint(feature2);

    if (!end1 || !start2) {
        return 0; // Default gap if we can't find end/start points
    }

    // Calculate euclidean distance between end of previous and start of next
    return distance([end1[0], end1[1]], [start2[0], start2[1]]) as number;
}

/**
 * Projects well trajectories unfolded onto an abscissa, z plane with lateral separation.
 * The distance between trajectories is equal to the lateral component of the euclidean
 * distance between the end of the previous trajectory and the start of the next one.
 */
export function abscissaTransform<
    TFeatureCollection extends FeatureCollection<GeometryCollection>,
>(featureCollection: TFeatureCollection): TFeatureCollection {
    const featureCollectionCopy = cloneDeep(featureCollection);

    // Calculate the maximum trajectory length and gaps needed
    let maxAbscissa = 0;

    // First pass: calculate trajectory lengths and offsets
    for (let i = 0; i < featureCollectionCopy.features.length; i++) {
        const feature = featureCollectionCopy.features[i];
        const geometryCollection = feature.geometry;

        // Find the maximum length of LineString geometries in this feature
        for (const geometry of geometryCollection.geometries) {
            if ("Point" === geometry.type) {
                const coordinates = geometry.coordinates;
                geometry.coordinates = [maxAbscissa, coordinates[2], 0];
            } else if ("LineString" === geometry.type) {
                const projection = computeUnfoldedPath(geometry.coordinates);

                geometry.coordinates = projection.vAbscissa.map((coord) => [
                    coord[0] + maxAbscissa,
                    coord[1],
                    coord[2],
                ]);

                maxAbscissa += projection.maxAbscissa;
            }
        }

        // Add gap equal to lateral euclidean distance between trajectory start points in
        // original world coordinates
        if (i < featureCollection.features.length - 1) {
            const currentTrajectory = featureCollection.features[i];
            const nextTrajectory = featureCollection.features[i + 1];
            const gap = calculateTrajectoryGap(
                currentTrajectory,
                nextTrajectory
            );
            maxAbscissa += gap;
        }
    }

    return featureCollectionCopy;
}

/**
 * Projects well trajectories onto an abscissa, z plane using a nearest neighbor approach.
 * @param features 
 * @returns 
 */
export function nearestNeighborAbscissaTransform<TFeatureCollection extends FeatureCollection<GeometryCollection>>  (
    features: TFeatureCollection):
TFeatureCollection {
    if (features.features.length === 0) {
        return features;
    }

    // Start with the first feature at abscissa 0
    let currentAbscissa = 0;
    const visited = new Set<number>();
    visited.add(0);

    const transformedFeatures: typeof features.features = [];
    transformedFeatures.push(cloneDeep(features.features[0]));

    // Transform the first feature
    for (const geometry of transformedFeatures[0].geometry.geometries) {
        if ("Point" === geometry.type) {
            const coordinates = geometry.coordinates;
            geometry.coordinates = [currentAbscissa, coordinates[2], 0];
        } else if ("LineString" === geometry.type) {
            const projection = computeUnfoldedPath(geometry.coordinates);
            geometry.coordinates = projection.vAbscissa.map((coord) => [
                coord[0] + currentAbscissa,
                coord[1],
                coord[2],
            ]);
            currentAbscissa += projection.maxAbscissa;
        }
    }

    while (visited.size < features.features.length) {
        let nearestIndex = -1;
        let nearestDistance = Infinity;

        const lastFeature = transformedFeatures[transformedFeatures.length - 1];

        for (let i = 0; i < features.features.length; i++) {
            if (visited.has(i)) continue;

            const distance = calculateTrajectoryGap(
                lastFeature,
                features.features[i]
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        if (nearestIndex === -1) break; // No more unvisited features

        visited.add(nearestIndex);
        const nextFeature = cloneDeep(features.features[nearestIndex]);
        transformedFeatures.push(nextFeature);

        // Transform the next feature
        for (const geometry of nextFeature.geometry.geometries) {
            if ("Point" === geometry.type) {
                const coordinates = geometry.coordinates;
                geometry.coordinates = [currentAbscissa, coordinates[2], 0];
            } else if ("LineString" === geometry.type) {
                const projection = computeUnfoldedPath(geometry.coordinates);
                geometry.coordinates = projection.vAbscissa.map((coord) => [
                    coord[0] + currentAbscissa,
                    coord[1],
                    coord[2],
                ]);
                currentAbscissa += projection.maxAbscissa;
            }
        }
    }

    features.features = transformedFeatures;

    return features;
}
