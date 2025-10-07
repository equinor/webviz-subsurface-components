import React from "react";
import type { Position } from "geojson";
import type { AbscissaTransform } from "../utils/abscissaTransform";
import { nearestNeighborAbscissaTransform } from "../utils/abscissaTransform";

/**
 * Custom React hook that provides an abscissa transform function for well data
 * @returns An object containing the abscissa transform function and the path used for
 * the projection.
 */
export const useAbscissaTransform = () => {
    const [path, setPath] = React.useState<Position[]>([]);

    const transform = React.useCallback<AbscissaTransform>(
        (wells) => {
            const { features, path } = nearestNeighborAbscissaTransform(wells);

            setPath(path);

            return features;
        },
        [setPath]
    );

    return { transform, path };
};
