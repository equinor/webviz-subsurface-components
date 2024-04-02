import _ from "lodash";
import React from "react";
import type { ViewStateType, ViewportType } from "../components/Map";

/** Scale zoom vertically */
const scaleZoom = (verticalFactor: number, zoom: number) => {
    const scaledZoom: [number, number] = [
        zoom,
        zoom / Math.sqrt(Math.max(verticalFactor || 0, 0) || 1),
    ];

    return scaledZoom;
};

export const getZoom = (viewport: ViewportType, fb_zoom: number) => {
    const zoom = viewport.zoom ?? fb_zoom;
    return viewport.verticalScale
        ? scaleZoom(viewport.verticalScale, zoom)
        : zoom;
};

export const useLateralZoom = (viewState: Record<string, ViewStateType>) => {
    return React.useMemo(() => {
        const zoom = _.find(viewState)?.zoom;

        if (_.isArray(zoom)) {
            return zoom[0];
        } else {
            return zoom ?? -5;
        }
    }, [viewState]);
};

/** Apply vertical scale factor to camera in orthographic views. */
export const scaleCameraZoom = (
    camera: ViewStateType,
    verticalScale: number,
    is3D: boolean
) => {
    if (is3D || typeof camera.zoom !== "number") {
        return camera;
    }
    camera.zoom = scaleZoom(verticalScale, camera.zoom);
    return camera;
};
