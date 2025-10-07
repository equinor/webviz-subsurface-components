import type {
    Feature,
    FeatureCollection,
    GeoJsonProperties,
    Geometry,
    GeometryCollection,
    LineString,
    Point,
    Position,
} from "geojson";
import { cloneDeep, zip } from "lodash";
import { distance } from "mathjs";

export type AbscissaTransform = <
    TFeatureCollection extends FeatureCollection<GeometryCollection>,
>(
    featureCollection: TFeatureCollection
) => TFeatureCollection;

function computeUnfoldedPath(
    worldCoordinates: Position[],
    reverse = false
): {
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

    if (reverse) {
        a.forEach((v, i) => {
            a[i] = maxAbscissa - v;
        });
    }

    const vAbscissa = zip(a, z, new Array(a.length).fill(0));
    return { vAbscissa: vAbscissa as Position[], maxAbscissa };
}

function shouldReverseFirstWellbore(
    wellbores: FeatureCollection<GeometryCollection<Geometry>>
): boolean {
    const firstWellbore = wellbores.features[0];
    if (!firstWellbore) {
        return false;
    }

    let nearestForwardDistance = Infinity;
    let nearestReverseDistance = Infinity;

    // Find the distance to the nearest wellbore
    for (let i = 1; i < wellbores.features.length; i++) {
        const { gap } = calculateTrajectoryOmniGap(
            firstWellbore,
            wellbores.features[i]
        );

        if (gap < nearestForwardDistance) {
            nearestForwardDistance = gap;
        }
    }

    const firstWellboreReversed: Feature<GeometryCollection<Geometry>> = {
        ...firstWellbore,
        geometry: {
            type: "GeometryCollection",
            geometries: firstWellbore.geometry.geometries.map((geometry) => {
                if (geometry.type === "LineString") {
                    return {
                        ...geometry,
                        coordinates: [...geometry.coordinates].reverse(),
                    };
                }
                return geometry;
            }),
        },
    };

    for (let i = 1; i < wellbores.features.length; i++) {
        const { gap } = calculateTrajectoryOmniGap(
            firstWellboreReversed,
            wellbores.features[i]
        );

        if (gap < nearestReverseDistance) {
            nearestReverseDistance = gap;
        }
    }

    // Placeholder for logic to determine if the first wellbore should be reversed.
    // This could be based on metadata or other criteria.
    return nearestReverseDistance < nearestForwardDistance;
}

/**
 * Get the first geometry of a given type
 */
function getGeometry(
    feature: Feature<GeometryCollection<Geometry>, GeoJsonProperties>,
    type: string
) {
    return feature.geometry.geometries.find((value) => value.type === type);
}

export function getWellboreGeometry(
    feature: Feature<GeometryCollection<Geometry>, GeoJsonProperties>
) {
    return getGeometry(feature, "LineString") as LineString;
}

export function getWellHeadGeometry(
    feature: Feature<GeometryCollection<Geometry>, GeoJsonProperties>
) {
    return getGeometry(feature, "Point") as Point;
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
 * Omni directional version of calculateTrajectoryGap.
 * @param feature1 The first wellbore feature
 * @param feature2 The second wellbore feature
 * @param reverse Whether to consider the first wellbore as reversed
 * @returns The lateral gap and whether reversing the second wellbore gives the shortest
 * gap.
 */
export function calculateTrajectoryOmniGap(
    feature1: { geometry: GeometryCollection },
    feature2: { geometry: GeometryCollection },
    reverse = false
): { gap: number; reverse: boolean } {
    const start1 = getStartPoint(feature1);
    const end1 = getEndPoint(feature1);
    const start2 = getStartPoint(feature2);
    const end2 = getEndPoint(feature2);

    if (!end1 || !start2 || !end2 || !start1) {
        return { gap: 0, reverse: false }; // Default gap if we can't find end/start points
    }

    const startPoint1 = reverse ? start1 : end1;

    // Calculate euclidean distance between end of previous and start of next
    const distStart = distance(
        [startPoint1[0], startPoint1[1]],
        [start2[0], start2[1]]
    ) as number;
    const distEnd = distance(
        [startPoint1[0], startPoint1[1]],
        [end2[0], end2[1]]
    ) as number;

    return { gap: Math.min(distStart, distEnd), reverse: distEnd < distStart };
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

function unfoldWell(
    well: Feature<GeometryCollection<Geometry>>,
    reverse: boolean,
    abscissaOffset: number
): number {
    // Get well geometry
    const wellboreGeometry = getWellboreGeometry(well);
    const wellHeadGeometry = getWellHeadGeometry(well);

    if (!wellboreGeometry) {
        return 0;
    }

    const wellboreProjection = computeUnfoldedPath(
        wellboreGeometry.coordinates,
        reverse
    );

    const projectedCoordinates = new Array<Position>(
        wellboreGeometry.coordinates.length
    );

    // Translate abscissae next to previous well
    for (let i = 0; i < projectedCoordinates.length; i++) {
        const projectionCoordinates = wellboreProjection.vAbscissa[i];
        projectedCoordinates[i] = [
            projectionCoordinates[0] + abscissaOffset,
            projectionCoordinates[1],
            projectionCoordinates[2],
        ];
    }

    wellboreGeometry.coordinates = projectedCoordinates;

    wellHeadGeometry.coordinates = [
        reverse
            ? abscissaOffset + wellboreProjection.maxAbscissa
            : abscissaOffset,
        wellHeadGeometry.coordinates[2],
        0,
    ];

    return wellboreProjection.maxAbscissa;
}

/**
 * Projects well trajectories onto an abscissa, z plane using a nearest neighbor approach.
 * @param features
 * @returns
 */
export function nearestNeighborAbscissaTransform<
    TFeatureCollection extends FeatureCollection<GeometryCollection>,
>(
    features: TFeatureCollection
): { features: TFeatureCollection; path: Position[] } {
    if (features.features.length === 0) {
        return { features, path: [] };
    }

    const featuresCopy = cloneDeep(features);

    const path = [];

    // Start with the first feature at abscissa 0
    let currentAbscissa = 0;
    const visited = new Set<number>();
    visited.add(0);
    let lastVisitedIndex = 0;

    const transformedFeatures: typeof features.features = [];
    transformedFeatures.push(cloneDeep(features.features[0]));

    // Get well geometry
    const wellHeadGeometry = getWellHeadGeometry(transformedFeatures[0]);
    const wellboreGeometry = getWellboreGeometry(transformedFeatures[0]);

    // Check if reversing the first wellbore gives a shorter gap to the
    // next well
    const reverseFirstWellbore = shouldReverseFirstWellbore(features);

    // Record the path of the section in world coordinates
    path.push(
        ...(reverseFirstWellbore
            ? [...wellboreGeometry.coordinates].reverse()
            : wellboreGeometry.coordinates)
    );

    // Transform the first wellbore
    const wellboreProjection = computeUnfoldedPath(
        wellboreGeometry.coordinates,
        reverseFirstWellbore
    );
    wellboreGeometry.coordinates = [...wellboreProjection.vAbscissa];

    // Transform the first well head
    wellHeadGeometry.coordinates = [
        reverseFirstWellbore
            ? currentAbscissa + wellboreProjection.maxAbscissa
            : currentAbscissa,
        wellHeadGeometry.coordinates[2],
        0,
    ];

    currentAbscissa += wellboreProjection.maxAbscissa;

    let previousReverse = reverseFirstWellbore;

    while (visited.size < features.features.length) {
        let nearestIndex = -1;
        let nearestDistance = Infinity;
        let nearestReverse = false;

        const lastFeature = features.features[lastVisitedIndex];

        // Find the nearest unvisited feature
        for (let i = 0; i < features.features.length; i++) {
            if (visited.has(i)) continue;

            const { gap, reverse } = calculateTrajectoryOmniGap(
                lastFeature,
                features.features[i],
                previousReverse
            );

            if (gap < nearestDistance) {
                nearestDistance = gap;
                nearestIndex = i;
                nearestReverse = reverse;
            }
        }

        previousReverse = nearestReverse;

        if (nearestIndex === -1) break; // No more unvisited features

        visited.add(nearestIndex);
        const nextFeature = cloneDeep(features.features[nearestIndex]);
        transformedFeatures.push(nextFeature);

        // Record the path of the section
        path.push(
            ...(nearestReverse
                ? [...getWellboreGeometry(nextFeature).coordinates].reverse()
                : getWellboreGeometry(nextFeature).coordinates)
        );

        lastVisitedIndex = nearestIndex;

        currentAbscissa += nearestDistance;

        // Unfold well geometry
        currentAbscissa += unfoldWell(
            nextFeature,
            nearestReverse,
            currentAbscissa
        );
    }

    featuresCopy.features = transformedFeatures;

    return { features: featuresCopy, path };
}
