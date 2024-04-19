import type {
    FeatureCollection,
    GeometryCollection,
    LineString,
    Point,
} from "geojson";
import { abscissaTransform } from "./abscissaTransform";

const MOCK_WELL: FeatureCollection<GeometryCollection> = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [50, 50, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 0, 0],
                            [1500, 1000, -1000],
                            [2500, 2000, -2000],
                        ],
                    },
                ],
            },
            properties: {
                name: "wl6",
                color: [255, 255, 0, 255],
                md: [[0, 1, 2, 3, 4, 5, 8, 9]],
            },
        },
    ],
};

describe("Transform well trajectory", () => {
    it("Empty well", () => {
        const emptyWell: FeatureCollection<GeometryCollection> = {
            type: "FeatureCollection",
            features: [],
        };
        const transformedWell = abscissaTransform(emptyWell);
        expect(transformedWell).toStrictEqual(emptyWell);
    });

    it("Unfold trajectory", () => {
        const transformedWell = abscissaTransform(MOCK_WELL);
        const wellHead = transformedWell.features[0].geometry
            .geometries[0] as Point;
        const trajectory = transformedWell.features[0].geometry
            .geometries[1] as LineString;

        // Check well head projection
        expect(wellHead.coordinates).toEqual([0, 0, 0]);

        // Checke unfolded trajectory
        expect(trajectory.coordinates[0]).toStrictEqual([0, 0, 0]);
        expect(trajectory.coordinates[1][0]).toBeCloseTo(1414.2135);
        expect(trajectory.coordinates[1][1]).toStrictEqual(-1000);
        expect(trajectory.coordinates[2][0]).toBeCloseTo(2828.4271);
    });

});
