import "jest";

import { distToSegmentSquared, isPointAwayFromLineEnd } from "./measurement";
import type { Position } from "geojson";

describe("measurement utils", () => {
    describe("distToSegmentSquared", () => {
        it("should calculate distance for a point", () => {
            const v: Position = [0, 0];
            const w: Position = [10, 0];
            const p: Position = [5, 3];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(9);
        });

        it("should calculate distance for a point when line length is zero", () => {
            const v: Position = [5, 5];
            const w: Position = [5, 5];
            const p: Position = [8, 9];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(25);
        });

        it("should return 0 when point is on the segment", () => {
            const v: Position = [0, 0];
            const w: Position = [10, 0];
            const p1: Position = [3, 0];
            const p2: Position = [5, 0];

            const result1 = distToSegmentSquared(v, w, p1);
            expect(result1).toBe(0);

            const result2 = distToSegmentSquared(v, w, p2);
            expect(result2).toBe(0);
        });

        it("should calculate distance to segment start when point is perpendicular to start", () => {
            const v: Position = [0, 0];
            const w: Position = [10, 0];
            const p: Position = [0, 5];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(25);
        });

        it("should calculate distance to segment end when point is perpendicular to end", () => {
            const v: Position = [0, 0];
            const w: Position = [10, 0];
            const p: Position = [10, 5];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(25);
        });

        it("should calculate distance when point is beyond segment end", () => {
            const v: Position = [0, 0];
            const w: Position = [10, 0];
            const p: Position = [15, 0];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(25);
        });

        it("should calculate distance when point is before segment start", () => {
            const v: Position = [5, 5];
            const w: Position = [10, 5];
            const p: Position = [0, 5];

            const result = distToSegmentSquared(v, w, p);

            expect(result).toBe(25);
        });
    });

    describe("isPointAwayFromLineEnd", () => {
        it("should return true when point has moved beyond line end", () => {
            const lineStart: Position = [0, 0];
            const lineEnd: Position = [10, 0];
            const point: Position = [15, 0];

            const result = isPointAwayFromLineEnd(point, [lineStart, lineEnd]);

            expect(result).toBe(true);
        });

        it("should return false when point is before line end", () => {
            const lineStart: Position = [0, 0];
            const lineEnd: Position = [10, 0];
            const point: Position = [5, 0];

            const result = isPointAwayFromLineEnd(point, [lineStart, lineEnd]);

            expect(result).toBe(false);
        });

        it("should return false when point is at line end", () => {
            const lineStart: Position = [0, 0];
            const lineEnd: Position = [10, 0];
            const point: Position = [10, 0];

            const result = isPointAwayFromLineEnd(point, [lineStart, lineEnd]);

            expect(result).toBe(false);
        });

        it("should return false when point is perpendicular to line", () => {
            const lineStart: Position = [0, 0];
            const lineEnd: Position = [10, 0];
            const point: Position = [5, 5];

            const result = isPointAwayFromLineEnd(point, [lineStart, lineEnd]);

            expect(result).toBe(false);
        });
    });
});
