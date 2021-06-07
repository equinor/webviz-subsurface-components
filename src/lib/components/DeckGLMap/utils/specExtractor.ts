/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty } from "lodash";
import { DrawMode } from "../redux/types";

export const getLayerVisibility = (
    spec: Record<string, unknown>
): Record<string, boolean> => {
    return !isEmpty(spec) && "layers" in spec
        ? (spec.layers as any[]).reduce(
              (acc, current) => ({
                  ...acc,
                  [current.id]:
                      current.visible === undefined || current.visible,
              }),
              {}
          )
        : {};
};

export const getDrawMode = (
    spec: Record<string, unknown>,
    layerId: string
): DrawMode | null => {
    if (isEmpty(spec) || !("layers" in spec)) return null;
    const layer = (spec.layers as any[]).find((l) => l.id === layerId);
    if (!layer || layer["@@type"] !== "DrawingLayer") return null;
    return layer.mode;
};
