import React from "react";
import type { ViewTypeType } from "../components/Map";

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
     * @deprecated Use "viewType" instead.
     */
    show3D?: boolean;

    /**
     * Type of viewport.
     * Use "OrbitView" for 3D
     * Use "OrthographicView" for 2D (default)
     * Use "SectionView" for unfolded 2D
     */
    viewType?: ViewTypeType;

    /**
     * Layers to be displayed on viewport
     */
    layerIds?: string[];

    target?: [number, number];
    zoom?: number;
    rotationX?: number;
    rotationOrbit?: number;

    /** @deprecated Please use top-level verticalScale instead for 3D and cameraPosition.zoom for 2D.
     * A vertical scale factor, used to scale items in the viewport vertically. */
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
