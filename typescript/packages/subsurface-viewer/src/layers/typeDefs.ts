import type { AccessorFunction, Color } from "@deck.gl/core";
import type { Feature } from "geojson";

export type NumberPair = [number, number];

type StyleData = NumberPair | Color | number;

export type StyleAccessorFunction<TFeature extends Feature = Feature> =
    AccessorFunction<TFeature, StyleData>;
