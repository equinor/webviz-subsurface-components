import { buildMarkerPath } from "./markers";
import type { Position } from "geojson";

describe("Marker utilities", () => {
    const anchorPoint: Position = [100, 200, 50];
    const angle90 = Math.PI / 2;
    const angle180 = Math.PI;

    describe("buildMarkerPath", () => {
        it("should build perforation marker coordinates correctly", () => {
            const coords = buildMarkerPath("perforation", anchorPoint, 0);

            expect(coords).toHaveLength(4);
            // The spike should be right above the anchor point
            expect(coords[0]).toEqual([100, 225, 50]);
        });

        it("should rotate perforation marker correctly", () => {
            const coords = buildMarkerPath(
                "perforation",
                anchorPoint,
                angle180
            );

            expect(coords).toHaveLength(4);
            // The spike should be rotated 180 degrees
            expect(coords[0]).toEqual([100, 175, 50]);
        });

        it("should build screen markers correctly", () => {
            const startCoords = buildMarkerPath("screen-start", anchorPoint, 0);
            const endCoords = buildMarkerPath("screen-end", anchorPoint, 0);

            expect(startCoords).toHaveLength(3);
            expect(endCoords).toHaveLength(3);

            expect(startCoords[0]).toEqual([103, 210, 50]);
            expect(startCoords[1]).toEqual(anchorPoint);
            expect(endCoords[0]).toEqual([97, 190, 50]);
            expect(endCoords[1]).toEqual(anchorPoint);
        });

        it("should rotate screen markers correctly", () => {
            const startCoords = buildMarkerPath(
                "screen-start",
                anchorPoint,
                angle90
            );
            const endCoords = buildMarkerPath(
                "screen-end",
                anchorPoint,
                angle90
            );

            expect(startCoords).toHaveLength(3);
            expect(endCoords).toHaveLength(3);

            expect(startCoords[0]).toEqual([90, 203, 50]);
            expect(startCoords[1]).toEqual(anchorPoint);
            expect(endCoords[0]).toEqual([110, 197, 50]);
            expect(endCoords[1]).toEqual(anchorPoint);
        });

        it("should throw error for unknown marker type", () => {
            expect(() =>
                // @ts-expect-error -- testing unknown type
                buildMarkerPath("unknown-marker", anchorPoint, 0)
            ).toThrow("Unknown marker type: unknown-marker");
        });
    });
});
