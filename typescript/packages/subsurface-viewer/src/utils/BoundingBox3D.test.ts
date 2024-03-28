import "jest";

import type { BoundingBox3D } from "./BoundingBox3D";
import { boxCenter, boxUnion, isEmpty } from "./BoundingBox3D";

describe("Test BoundingBox3D", () => {
    it("boxUnion default box", () => {
        const unitBox: BoundingBox3D = [0, 0, 0, 1, 1, 1];
        const defaultBox: BoundingBox3D = [-1, -1, -1, 1, 1, 1];
        const box1: BoundingBox3D = [0, 1, 2, 5, 6, 7];
        const box2: BoundingBox3D = [1, 2, 3, 4, 5, 6];
        expect(boxUnion(undefined, undefined)).toEqual(unitBox);
        expect(boxUnion(undefined, undefined, defaultBox)).toEqual(defaultBox);
        expect(boxUnion(box1, undefined, defaultBox)).toEqual(box1);
        expect(boxUnion(undefined, box2, defaultBox)).toEqual(box2);
        expect(boxUnion(box1, box2, defaultBox)).toEqual(box1);
    });

    it("boxUnion without default box", () => {
        const box1: BoundingBox3D = [0, 1, 2, 5, 6, 7];
        const box2: BoundingBox3D = [1, 2, 3, 4, 5, 6];
        const box3: BoundingBox3D = [1, 2, 3, 6, 7, 8];
        expect(boxUnion(box1, undefined)).toEqual(box1);
        expect(boxUnion(undefined, box2)).toEqual(box2);
        expect(boxUnion(box1, box2)).toEqual(box1);
        expect(boxUnion(box1, box3)).toEqual([0, 1, 2, 6, 7, 8]);
    });

    it("boxCenter", () => {
        const box1: BoundingBox3D = [0, 1, 2, 5, 6, 7];
        const box2: BoundingBox3D = [1, 2, 3, 4, 5, 6];
        const box3: BoundingBox3D = [1, 2, 3, 6, 7, 8];
        expect(boxCenter(box1)).toEqual([2.5, 3.5, 4.5]);
        expect(boxCenter(box2)).toEqual([2.5, 3.5, 4.5]);
        expect(boxCenter(box3)).toEqual([3.5, 4.5, 5.5]);
    });

    it("isEmpty", () => {
        const box1: BoundingBox3D = [0, 0, 0, 0, 0, 0];
        const box2: BoundingBox3D = [1, 2, 3, 4, 5, 3];
        const box3: BoundingBox3D = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            -Number.POSITIVE_INFINITY,
            -Number.POSITIVE_INFINITY,
            -Number.POSITIVE_INFINITY,
        ];
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty(box1)).toBe(true);
        expect(isEmpty(box2)).toBe(true);
        expect(isEmpty(box3)).toBe(true);

        const box4: BoundingBox3D = [1, 2, 3, 4, 5, 6];
        expect(isEmpty(box4)).toBe(false);
    });
});
