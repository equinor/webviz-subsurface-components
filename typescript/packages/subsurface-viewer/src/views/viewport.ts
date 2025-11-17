import React from "react";
import type { ViewTypeType } from "../components/Map";
import type { Controller } from "@deck.gl/core";
import type { ConstructorOf } from "@deck.gl/core/dist/types/types";
import type { ControllerOptions } from "@deck.gl/core/dist/controllers/controller";
import type { IViewState } from "@deck.gl/core/dist/controllers/view-state";

export type ControllerOpts = boolean | null | ControllerOptions;

export const DEFAULT_CONTROLLER_OPTIONS: ControllerOptions = {
    doubleClickZoom: false,
    inertia: 300,
    scrollZoom: {
        speed: 0.008,
        smooth: false,
    },
};

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
     * Layers to be displayed on the viewport. if left undefined, all layers are displayed. if it's an empty array, no layers are displayed.
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

    /**
     * Options for viewport interactivity.
     *
     * If `true` or `undefined`, enables interactivity with default options.
     *
     * If `false` or `null`, disables interactivity.
     *
     * If it is a ControllerOptions `object`, enables interactivity with the specified options (default options are merged with the specified options).
     */
    controller?: ControllerOpts;
}

export const useVerticalScale = (viewports: ViewportType[] | undefined) => {
    return React.useMemo(() => {
        if (!viewports) {
            return 1;
        }
        return viewports.find((item) => !!item.verticalScale)?.verticalScale;
    }, [viewports]);
};

export const defineController = <
    ControllerState extends IViewState<ControllerState>,
>(
    controllerClass: ConstructorOf<Controller<ControllerState>>,
    controllerProps?: ControllerOpts
) => {
    if (controllerProps === null || controllerProps === false) {
        return controllerProps;
    }
    if (controllerProps === undefined || controllerProps === true) {
        return {
            type: controllerClass,
            ...DEFAULT_CONTROLLER_OPTIONS,
        };
    }
    return {
        type: controllerClass,
        ...DEFAULT_CONTROLLER_OPTIONS,
        ...controllerProps,
    };
};
