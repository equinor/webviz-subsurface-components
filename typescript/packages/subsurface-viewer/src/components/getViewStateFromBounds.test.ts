import "jest";
import { describe, expect, it } from "@jest/globals";

import type { ViewportType } from "../views/viewport";
import type { BoundingBox2D, Point3D } from "../utils";
import type { MarginsType, Size } from "./Map";
import { getViewStateFromBounds } from "./Map";

const NO_MARGINS: MarginsType = { left: 0, right: 0, top: 0, bottom: 0 };

const BOUNDS: BoundingBox2D = [0, 0, 1000, 500];
const SIZE: Size = { width: 800, height: 400 };
const ORIGIN: Point3D = [0, 0, 0];

/** A plain 2D viewport, i.e. no target/zoom overrides and no deprecated vertical scale. */
const view2D: ViewportType = { id: "test", show3D: false };

describe("getViewStateFromBounds", () => {
    it("fits the bounds into the viewport when there are no margins", () => {
        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        // The viewport is 800x400 for bounds of 1000x500, so both axes are scaled by 0.8.
        expect(viewState.zoom).toBeCloseTo(Math.log2(0.8), 10);
        expect(viewState.target).toEqual([500, 250, 0]);
        expect(viewState.rotationX).toBe(90);
        expect(viewState.rotationOrbit).toBe(0);
    });

    it("accounts for margins and re-centres the target when they are asymmetric", () => {
        const margins: MarginsType = {
            left: 60,
            right: 0,
            top: 0,
            bottom: 40,
        };

        const viewState = getViewStateFromBounds(
            margins,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        // Margins shrink the usable viewport to 740x360, so the fit is limited by the
        // vertical axis: 360/500 = 0.72.
        expect(viewState.zoom).toBeCloseTo(Math.log2(0.72), 10);

        // With a margin on one side only, the target shifts by half the margin, converted to
        // world units via the bounds-limiting axis (500 / 360 meters per pixel).
        const metersPerPixel = 500 / 360;
        expect(viewState.target?.[0]).toBeCloseTo(
            500 - 0.5 * 60 * metersPerPixel,
            10
        );
        expect(viewState.target?.[1]).toBeCloseTo(
            250 - 0.5 * 40 * metersPerPixel,
            10
        );
    });

    it("does not shift the target when margins are symmetric", () => {
        const margins: MarginsType = {
            left: 50,
            right: 50,
            top: 30,
            bottom: 30,
        };

        const viewState = getViewStateFromBounds(
            margins,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        expect(viewState.target).toEqual([500, 250, 0]);
    });

    it("applies the 2D zoom limits", () => {
        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        expect(viewState.minZoom).toBe(-12);
        expect(viewState.maxZoom).toBe(12);
    });

    it("reduces the maximum 2D zoom for large coordinates", () => {
        // UTM coordinates, where numerical imprecision limits how far one can zoom in.
        const utmBounds: BoundingBox2D = [432205, 6475078, 437720, 6481113];

        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            utmBounds,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        expect(viewState.maxZoom).toBe(3);
    });

    it("accepts a bounds accessor function", () => {
        const fromValue = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );
        const fromAccessor = getViewStateFromBounds(
            NO_MARGINS,
            () => BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        expect(fromAccessor).toEqual(fromValue);
    });

    it("keeps the z component of the supplied target", () => {
        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            [0, 0, 42],
            undefined,
            view2D,
            SIZE
        );

        expect(viewState.target?.[2]).toBe(42);
    });

    it("ignores the viewport size when it is degenerate", () => {
        const viewState = getViewStateFromBounds(
            { left: 60, right: 0, top: 0, bottom: 40 },
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            { width: 0, height: 0 }
        );

        // Falls back to fitting the bounds to themselves, so no scaling and no margin shift.
        expect(viewState.zoom).toBe(0);
        expect(viewState.target).toEqual([500, 250, 0]);
    });

    it("returns a scalar zoom when the viewport has no vertical scale", () => {
        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            ORIGIN,
            undefined,
            view2D,
            SIZE
        );

        expect(typeof viewState.zoom).toBe("number");
    });

    it("lets the viewport override the computed target and zoom", () => {
        const viewState = getViewStateFromBounds(
            NO_MARGINS,
            BOUNDS,
            ORIGIN,
            undefined,
            { ...view2D, target: [1, 2], zoom: 5 },
            SIZE
        );

        expect(viewState.target).toEqual([1, 2]);
        expect(viewState.zoom).toBe(5);
    });
});
