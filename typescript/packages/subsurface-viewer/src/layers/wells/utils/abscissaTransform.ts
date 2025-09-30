import type { FeatureCollection, GeometryCollection, Position } from "geojson";
import { cloneDeep, zip } from "lodash";
import { distance } from "mathjs";

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

// Find the ending point of the last LineString in feature1
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

// Find the starting point of the first LineString in feature1
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
