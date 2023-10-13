import { removeConsecutiveDuplicates, splineRefine } from "./spline";
import type { Position3D } from "../../utils/layerTools";
import { generateSyntheticWell } from "./generateSyntheticWell";
import type { FeatureCollection } from "geojson";

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
        const well = generateSyntheticWell() as unknown as FeatureCollection;
        expect(
            splineRefine(well, 0).features[0].geometry.geometries[1].coordinates.length // eslint-disable-line
        ).toStrictEqual(9);
    });

    it("should refine and output more vertices if given valid input", () => {
        const well = generateSyntheticWell();
        expect(
            splineRefine(well as unknown as FeatureCollection).features[0].geometry.geometries[1].coordinates.length // eslint-disable-line
        ).toStrictEqual(33);

        expect(
            splineRefine(well as unknown as FeatureCollection, 10).features[0].geometry.geometries[1].coordinates.length // eslint-disable-line
        ).toStrictEqual(63);
    });
});
