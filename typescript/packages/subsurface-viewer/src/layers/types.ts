import type { Color } from "@deck.gl/core";
import type { Feature } from "geojson";

export type NumberPair = [number, number];

type StyleData = NumberPair | Color | number;

export type StyleAccessorFunction = (
    object: Feature,
    objectInfo?: Record<string, unknown>
) => StyleData;
