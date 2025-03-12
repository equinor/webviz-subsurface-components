import type { Position3D } from "../utils/layerTools";
import { simplify } from "./simplify";

describe("simplify", () => {
    it("should return the same points and mds if tolerance is undefined", () => {
        const points: Position3D[] = [
            [0, 0, 0],
            [1, 1, 1],
            [2, 2, 2],
        ];
        const mds = [0, 1, 2];
        const tolerance = undefined;

        const [newPoints, newMds] = simplify(points, mds, tolerance);

        expect(newPoints).toEqual(points);
        expect(newMds).toEqual(mds);
    });

    it("should simplify points based on the given tolerance", () => {
        const points: Position3D[] = [
            [0, 0, 0],
            [0.5, 0.5, 0.5],
            [1, 1, 1],
            [1.5, 1.5, 1.5],
            [2, 2, 2],
        ];
        const mds = [0, 0.5, 1, 1.5, 2];
        const tolerance = 0.5;

        const [newPoints, newMds] = simplify(points, mds, tolerance);

        expect(newPoints).toEqual([
            [0, 0, 0],
            [2, 2, 2],
        ]);
        expect(newMds).toEqual([0, 2]);
    });

    it("should handle an empty array of points", () => {
        const points: Position3D[] = [];
        const mds: number[] = [];
        const tolerance = 1;

        const [newPoints, newMds] = simplify(points, mds, tolerance);

        expect(newPoints).toEqual([]);
        expect(newMds).toEqual([]);
    });

    it("should handle a single point", () => {
        const points: Position3D[] = [[0, 0, 0]];
        const mds: number[] = [0];
        const tolerance = 1;

        const [newPoints, newMds] = simplify(points, mds, tolerance);

        expect(newPoints).toEqual([[0, 0, 0]]);
        expect(newMds).toEqual([0]);
    });
});
