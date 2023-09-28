import { removeConsecutiveDuplicates } from "./spline";
import type { Position3D } from "../../utils/layerTools";

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
});
