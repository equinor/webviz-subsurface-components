/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty } from "lodash";
import { LayerProps } from "@deck.gl/core/lib/layer";
import {
    ToggleTypeProps,
    MenuTypeProps,
    NumericTypeProps,
    SliderTypeProps,
} from "../redux/types";

// return true if layer props are displayable as defined in ../redux/types.tsx
export const getPropVisibility = (
    layers: LayerProps<unknown>[],
    layerId: string
): boolean => {
    if (!layers.length) return false;
    const layer_props = (layers as any[]).find((l) => l.id === layerId);
    if (!layer_props) return false;

    const prop_types = [
        ...MenuTypeProps,
        ...NumericTypeProps,
        ...SliderTypeProps,
        ...ToggleTypeProps,
    ];
    const visibility = prop_types.reduce(
        (acc, current) => acc || current.id in layer_props,
        false
    );
    return visibility;
};

// returns layer properties
export const getLayerProps = (
    layers: LayerProps<unknown>[],
    layerId: string
): Record<string, unknown> | null => {
    if (!layers?.length) return null;
    const layer_props = (layers as any[]).find((l) => l.id === layerId);
    return isEmpty(layer_props) ? null : layer_props;
};
