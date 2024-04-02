import "jest";

import type { BoundingBox2D } from "./BoundingBox2D";
import { boxCenter, boxUnion, isEmpty } from "./BoundingBox2D";

describe("Test BoundingBox2D", () => {
    it("boxUnion default box", () => {
        const unitBox: BoundingBox2D = [0, 0, 1, 1];
        const defaultBox: BoundingBox2D = [-1, -1, 1, 1];
        const box1: BoundingBox2D = [0, 1, 3, 4];
        const box2: BoundingBox2D = [1, 2, 3, 4];
        expect(boxUnion(undefined, undefined)).toEqual(unitBox);
        expect(boxUnion(undefined, undefined, defaultBox)).toEqual(defaultBox);
        expect(boxUnion(box1, undefined, defaultBox)).toEqual(box1);
        expect(boxUnion(undefined, box2, defaultBox)).toEqual(box2);
        expect(boxUnion(box1, box2, defaultBox)).toEqual(box1);
    });

    it("boxUnion without default box", () => {
        const box1: BoundingBox2D = [0, 1, 3, 4];
        const box2: BoundingBox2D = [1, 2, 3, 4];
        const box3: BoundingBox2D = [1, 2, 5, 6];
        expect(boxUnion(box1, undefined)).toEqual(box1);
        expect(boxUnion(undefined, box2)).toEqual(box2);
        expect(boxUnion(box1, box2)).toEqual(box1);
        expect(boxUnion(box1, box3)).toEqual([0, 1, 5, 6]);
    });

    it("boxCenter", () => {
        const box1: BoundingBox2D = [0, 1, 3, 4];
        const box2: BoundingBox2D = [1, 2, 3, 4];
        const box3: BoundingBox2D = [1, 2, 5, 6];
        expect(boxCenter(box1)).toEqual([1.5, 2.5]);
        expect(boxCenter(box2)).toEqual([2, 3]);
        expect(boxCenter(box3)).toEqual([3, 4]);
    });

    it("isEmpty", () => {
        const box1: BoundingBox2D = [0, 0, 0, 0];
        const box2: BoundingBox2D = [1, 2, 3, 2];
        const box3: BoundingBox2D = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            -Number.POSITIVE_INFINITY,
            -Number.POSITIVE_INFINITY,
        ];
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty(box1)).toBe(true);
        expect(isEmpty(box2)).toBe(true);
        expect(isEmpty(box3)).toBe(true);

        const box4: BoundingBox2D = [1, 2, 3, 4];
        expect(isEmpty(box4)).toBe(false);
    });
});
