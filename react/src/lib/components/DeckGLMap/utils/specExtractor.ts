/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty } from "lodash";
import {
    ToggleTypeProps,
    MenuTypeProps,
    NumericTypeProps,
    SliderTypeProps,
} from "../redux/types";

export const getLayerVisibility = (
    spec: Record<string, unknown>
): Record<string, boolean> => {
    return !isEmpty(spec) && "layers" in spec
        ? (spec["layers"] as any[]).reduce(
              (acc, current) => ({
                  ...acc,
                  [current.id]:
                      current.visible === undefined || current.visible,
              }),
              {}
          )
        : {};
};

// return true if layer props are displayable as defined in ../redux/types.tsx
export const getPropVisibility = (
    spec: Record<string, unknown>,
    layerId: string
): boolean => {
    if (isEmpty(spec) || !("layers" in spec)) return false;
    const layer_props = (spec["layers"] as any[]).find((l) => l.id === layerId);
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
    spec: Record<string, unknown>,
    layerId: string
): Record<string, string> | null => {
    if (isEmpty(spec) || !("layers" in spec)) return null;
    const layer_props = (spec["layers"] as any[]).find((l) => l.id === layerId);
    return isEmpty(layer_props) ? null : layer_props;
};
