import { scaleSequential, interpolateViridis, ScaleSequential } from "d3";

export function interpolatorContinuous(): ScaleSequential<string, never> {
    return scaleSequential(interpolateViridis);
}
