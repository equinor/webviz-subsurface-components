import { removeConsecutiveDuplicates, splineRefine } from "./spline";
import type { Position3D } from "../../utils/layerTools";
import type {
    FeatureCollection,
    GeometryCollection,
    LineString,
} from "geojson";

const testWell: FeatureCollection<GeometryCollection> = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [0, 0, 0],
                            [0, 0, -100],
                            [0, 0, -200],
                            [0, 0, -300],
                            [0, 0, -400],
                            [0, 0, -500],
                            [0, 0, -600],
                            [0, 0, -700],
                            [0, 0, -800],
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

describe("remove duplicates", () => {
    const coords: Position3D[] = [
        [1, 2, 3],
        [1, 2, 3],
        [4, 5, 6],
    ];

    const coordsRes: Position3D[] = [
        [1, 2, 3],
        [4, 5, 6],
    ];

    const mds = [0, 1, 2];
    const mdsRes = [1, 2];

    const coordsEmpty: Position3D[] = [];
    const mdsEmpty: number[] = [];

    it("should remove duplicate", () => {
        expect(removeConsecutiveDuplicates(coords, mds).length).toBe(2);
        expect(removeConsecutiveDuplicates(coords, mds)[0]).not.toBe(coords);
        expect(removeConsecutiveDuplicates(coords, mds)[0]).toStrictEqual(
            coordsRes
        );
    });

    it("should remove corresponding md's", () => {
        expect(removeConsecutiveDuplicates(coords, mds)[1]).toStrictEqual(
            mdsRes
        );
    });

    it("should handle empty input (coords)", () => {
        expect(
            removeConsecutiveDuplicates(coordsEmpty, mdsEmpty)[0]
        ).toStrictEqual(coordsEmpty);
    });

    it("should handle empty input (md's)", () => {
        expect(
            removeConsecutiveDuplicates(coordsEmpty, mdsEmpty)[1]
        ).toStrictEqual(mdsEmpty);
    });

    // Test splineRefine functions
    it("should not refine if given invalid input", () => {
        const refined = splineRefine(testWell, 0);
        const geometry = refined.features[0].geometry
            .geometries[1] as LineString;
        expect(geometry.coordinates.length).toStrictEqual(9);
    });

    it("should refine and output more vertices if given valid input", () => {
        let refined = splineRefine(testWell);
        let geometry = refined.features[0].geometry.geometries[1] as LineString;
        expect(geometry.coordinates.length).toStrictEqual(33);

        refined = splineRefine(testWell, 10);
        geometry = refined.features[0].geometry.geometries[1] as LineString;
        expect(geometry.coordinates.length).toStrictEqual(63);
    });
});
