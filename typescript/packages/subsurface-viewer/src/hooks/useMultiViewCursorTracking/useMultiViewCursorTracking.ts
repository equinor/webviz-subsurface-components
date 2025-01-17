import React from "react";
import { v4 } from "uuid";
import { CrosshairLayer } from "../../layers";

import type { CrosshairLayerProps } from "../../layers";
import type { ViewportType } from "../../views/viewport";
import type { TLayerDefinition } from "../../SubsurfaceViewer";

export type UseMultiViewCursorTrackingProps = {
    worldCoordinates: number[] | null;
    crosshairProps?: Omit<CrosshairLayerProps, "id" | "worldCoordinates">;
    viewports: ViewportType[];
    layers: TLayerDefinition[];
    activeViewportId: string;
};

export type UseMultiViewCursorTrackingReturnType = {
    viewports: ViewportType[];
    layers: TLayerDefinition[];
};

export function useMultiViewCursorTracking(
    props: UseMultiViewCursorTrackingProps
): UseMultiViewCursorTrackingReturnType {
    const id = React.useRef<string>(`crosshair-${v4()}`);

    let worldCoordinates: [number, number, number] | null = null;
    if (props.worldCoordinates?.length === 3) {
        worldCoordinates = props.worldCoordinates as [number, number, number];
    }
    if (props.worldCoordinates?.length === 2) {
        worldCoordinates = [...props.worldCoordinates, 0] as [
            number,
            number,
            number,
        ];
    }

    const crosshairLayer = new CrosshairLayer({
        id: id.current,
        worldCoordinates,
        ...props.crosshairProps,
    });

    const layers = [...props.layers, crosshairLayer];

    const viewports = props.viewports.map((viewport) => {
        if (viewport.id !== props.activeViewportId) {
            return {
                ...viewport,
                layerIds: [...(viewport.layerIds ?? []), id.current],
            };
        }

        return viewport;
    });

    return {
        viewports,
        layers,
    };
}
