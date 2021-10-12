import { scaleSequential, interpolateViridis, ScaleSequential } from "d3";

export function interpolatorContinous(): ScaleSequential<string, never> {
    return scaleSequential(interpolateViridis);
}
