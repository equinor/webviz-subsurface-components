import { all, create } from "mathjs";

import type {
    SubsurfaceViewerProps,
    TLayerDefinition,
} from "../SubsurfaceViewer";
//import SubsurfaceViewer from "../../SubsurfaceViewer";

/**
 * Helper function to replace non-json arguments in the layers of the SubsurfaceViewerProps.
 * Storybook controls do not support non-json data: when editing controls, the non-json data
 * gets corrupted, leading to undefined behavior or possible crashes.
 * This this function is used to replace the possibly corrupted layers' non-json data controls
 * with the initial data.
 * @param args storybook controls arguments.
 * @param nonJsonLayerProps structure storing non json data to inject into the layers.
 * @returns the initial and updated storybook controls arguments.
 */
export function replaceNonJsonArgs(
    args: SubsurfaceViewerProps,
    nonJsonLayerProps: Record<string, unknown>
) {
    args.layers?.forEach((layer: TLayerDefinition) => {
        replaceLayerNonJson(layer, nonJsonLayerProps);
    });
    return args;
}

function replaceLayerNonJson(
    layer: TLayerDefinition,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nonJsonLayerProps: Record<string, any>
) {
    const localLayer = layer as Record<string, unknown>;
    const layerId = localLayer["id"] as string | undefined;
    if (layer && layerId && layerId) {
        for (const nonJsonKey in nonJsonLayerProps) {
            if (nonJsonKey === layerId) {
                for (const key of Object.keys(nonJsonLayerProps[nonJsonKey])) {
                    localLayer[key] = nonJsonLayerProps[nonJsonKey][key];
                }
            }
        }
    }
}

/**
 * Creates a MathJs instance with the given seed to allow for deterministic random number generation.
 * @param seed seed to create a MathJs instance.
 * @returns a MathJs instance with the given seed.
 */
export function createMathWithSeed(seed: string) {
    return create(all, { randomSeed: seed });
}
