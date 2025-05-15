import "jest";

import type { Point3D } from "./Point3D";
import { add } from "./Point3D";

describe("Point3D", () => {
    it("add() returns the correct sum of two 3D points", () => {
        const a: Point3D = [1, 2, 3];
        const b: Point3D = [4, 5, 6];
        expect(add(a, b)).toEqual([5, 7, 9]);
    });

    it("add() works with negative numbers", () => {
        const a: Point3D = [-1, -2, -3];
        const b: Point3D = [1, 2, 3];
        expect(add(a, b)).toEqual([0, 0, 0]);
    });

    it("add() works with zeros", () => {
        const a: Point3D = [0, 0, 0];
        const b: Point3D = [0, 0, 0];
        expect(add(a, b)).toEqual([0, 0, 0]);
    });
});
