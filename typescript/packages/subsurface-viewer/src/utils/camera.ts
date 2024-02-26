import React from "react";
import type { ViewStateType, ViewportType } from "../components/Map";
import _ from "lodash";

export const getZoom = (viewport: ViewportType, fb_zoom: number) => {
    const zoom = viewport.zoom ?? fb_zoom;
    const scaledZoom: [number, number] = [
        zoom,
        zoom / Math.sqrt(Math.max(viewport.verticalScale || 0, 0) || 1),
    ];

    return viewport.verticalScale ? scaledZoom : zoom;
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
