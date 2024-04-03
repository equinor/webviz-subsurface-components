import "jest";

import { renderHook } from "@testing-library/react";
import type { ViewStateType, ViewportType } from "../components/Map";
import { getZoom, scaleCameraZoom, useLateralZoom } from "./camera";

describe("Test camera zoom scaling", () => {
    const defaultCamera = {
        zoom: 1,
        target: [],
        rotationX: 0,
        rotationOrbit: 0,
    };

    it("Test no changes in 3D", () => {
        const is3D = true;
        const verticalScale = 1;
        const camera = scaleCameraZoom(defaultCamera, verticalScale, is3D);
        expect(camera).toBe(defaultCamera);
    });

    it("Test no scaling", () => {
        const is3D = false;
        const verticalScale = 1;
        const camera = scaleCameraZoom(defaultCamera, verticalScale, is3D);
        expect(camera).toBe(defaultCamera);
    });

    it("Test scaling", () => {
        const is3D = false;
        const verticalScale = 4;
        const camera = scaleCameraZoom(defaultCamera, verticalScale, is3D);
        console.log(camera);
        expect(camera).toEqual({ ...defaultCamera, zoom: [1, 2] });
    });

    it("Test negative scaling", () => {
        const is3D = false;
        const verticalScale = -1;
        const camera = scaleCameraZoom(defaultCamera, verticalScale, is3D);
        expect(camera).toBe(defaultCamera);
    });

    it("Test NaN", () => {
        const is3D = false;
        const verticalScale = NaN;
        const camera = scaleCameraZoom(defaultCamera, verticalScale, is3D);
        expect(camera).toBe(defaultCamera);
    });
});

describe("Test zoom", () => {
    const defaultZoom = 3;

    it("Test default zoom", () => {
        const viewport: ViewportType = { id: "" };
        const zoom = getZoom(viewport, defaultZoom);
        expect(zoom).toEqual(defaultZoom);
    });

    it("Test zoom override", () => {
        const viewport: ViewportType = { id: "", zoom: 10 };
        const zoom = getZoom(viewport, defaultZoom);
        expect(zoom).toEqual(viewport.zoom);
    });

    it("Test vertical scale", () => {
        const viewport: ViewportType = { id: "", zoom: 10, verticalScale: 4 };
        const zoom = getZoom(viewport, defaultZoom);
        expect(zoom).toEqual([viewport.zoom, 20]);
    });

    it("Test zero scale", () => {
        const viewport: ViewportType = { id: "", zoom: 10, verticalScale: 0 };
        const zoom = getZoom(viewport, defaultZoom);
        expect(zoom).toEqual(viewport.zoom);
    });

    it("Test negative scale", () => {
        const viewport: ViewportType = { id: "", zoom: 10, verticalScale: -1 };
        const zoom = getZoom(viewport, defaultZoom);
        expect(zoom).toEqual([viewport.zoom, 10]);
    });
});

describe("Test lateral zoom hook", () => {
    it("Test no zoom", () => {
        const viewState: Record<string, ViewStateType> = {};

        const { result } = renderHook(() => useLateralZoom(viewState));

        expect(result.current).toEqual(-5);
    });

    it("Test zero zoom", () => {
        const viewState: Record<string, ViewStateType> = {
            a: { zoom: 0, target: [0, 0], rotationX: 0, rotationOrbit: 0 },
        };

        const { result } = renderHook(() => useLateralZoom(viewState));

        expect(result.current).toEqual(viewState["a"].zoom);
    });

    it("Test scaled zoom", () => {
        const viewState: Record<string, ViewStateType> = {
            a: { zoom: [5, 6], target: [0, 0], rotationX: 0, rotationOrbit: 0 },
        };

        const { result } = renderHook(() => useLateralZoom(viewState));

        expect(result.current).toEqual(5);
    });
});
