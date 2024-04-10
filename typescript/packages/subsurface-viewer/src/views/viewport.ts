import React from "react";

/**
 * Viewport type.
 */
export interface ViewportType {
    /**
     * Viewport id
     */
    id: string;

    /**
     * Viewport name
     */
    name?: string;

    /**
     * If true, displays map in 3D view, default is 2D view (false)
     */
    show3D?: boolean;

    /**
     * Layers to be displayed on viewport
     */
    layerIds?: string[];

    target?: [number, number];
    zoom?: number;
    rotationX?: number;
    rotationOrbit?: number;

    /** A vertical scale factor, used to scale items in the viewport vertically */
    verticalScale?: number;

    isSync?: boolean;
}

export const useVerticalScale = (viewports: ViewportType[] | undefined) => {
    return React.useMemo(() => {
        if (!viewports) {
            return 1;
        }
        return viewports.find((item) => !!item.verticalScale)?.verticalScale;
    }, [viewports]);
};
