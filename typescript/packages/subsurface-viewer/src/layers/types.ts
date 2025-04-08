import type { Color } from "@deck.gl/core";
import type { Feature } from "geojson";

export type NumberPair = [number, number];

type StyleData = NumberPair | Color | number;

export type StyleAccessorFunction<TFeature extends Feature = Feature> = (
    object: TFeature,
    objectInfo?: Record<string, unknown>
) => StyleData;
