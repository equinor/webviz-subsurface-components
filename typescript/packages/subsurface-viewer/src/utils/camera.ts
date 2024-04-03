import _ from "lodash";
import React from "react";
import type { ViewStateType, ViewportType } from "../components/Map";

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
