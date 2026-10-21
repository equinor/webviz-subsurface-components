import { find } from "lodash";

import React from "react";

import type { ViewportType } from "../views/viewport";

import type { BoundingBox3D } from "../utils/BoundingBox3D";
import type { Point2D } from "../utils/BoundingBox2D";
import type { Point3D } from "../utils/Point3D";

export interface ViewStateType {
    /**
     * Camera target position.
     */
    target: Point2D | Point3D | undefined;
    /**
     * Zoom level or bounding box to fit in the view.
     * - When a number: Represents the zoom level of the camera.
     * - When a tuple [number, number]: Represents independent zoom levels along the horizontal and vertical axes.
     * - When a BoundingBox3D: Represents the camera position computed to fit (zoom in) the entire box.
     */
    zoom: number | [number, number] | BoundingBox3D | undefined;
    /**
     * Rotation around the X axis in degrees. Only for 3D view.
     */
    rotationX: number;
    /**
     * Rotation around the orbit in degrees. Only for 3D view.
     */
    rotationOrbit: number;
    /**
     * Minimum zoom level.
     * Constrains how far out the user can zoom. Lower values allow viewing a larger area.
     */
    minZoom?: number;
    /**
     * Maximum zoom level.
     * Constrains how far in the user can zoom. Higher values allow closer inspection.
     */
    maxZoom?: number;
    /**
     *  Animation transition duration in milliseconds.
     */
    transitionDuration?: number;
    /**
     * Viewport width in pixels.
     */
    width?: number;
    /**
     * Viewport height in pixels.
     */
    height?: number;
    /**
     * Minimum rotation around the X axis in degrees. Only for 3D view.
     * Constrains the minimum tilt angle of the camera (e.g., 0° = horizontal view).
     */
    minRotationX?: number;
    /**
     * Maximum rotation around the X axis in degrees. Only for 3D view.
     * Constrains the maximum tilt angle of the camera (e.g., 90° = top-down view).
     */
    maxRotationX?: number;
}

/** Grows a dimension proportionally to a scale factor. */
export const proportionalZoom = (zoom: number, scaleFactor: number) => {
    return zoom * Math.sqrt(Math.max(scaleFactor || 0, 0) || 1);
};

/** Scale zoom vertically */
export const scaleZoom = (verticalFactor: number, zoom: number) => {
    const scaledZoom: [number, number] = [
        zoom,
        proportionalZoom(zoom, verticalFactor),
    ];

    return scaledZoom;
};

export const getZoom = (viewport: ViewportType, fb_zoom: number) => {
    const zoom = viewport.zoom ?? fb_zoom;

    if (viewport.show3D) {
        return zoom;
    }

    return viewport.verticalScale
        ? scaleZoom(viewport.verticalScale, zoom)
        : zoom;
};

export const useLateralZoom = (viewState: Record<string, ViewStateType>) => {
    return React.useMemo(() => {
        const zoom = find(viewState)?.zoom;

        if (Array.isArray(zoom)) {
            return zoom[0];
        } else {
            return zoom ?? -5;
        }
    }, [viewState]);
};
