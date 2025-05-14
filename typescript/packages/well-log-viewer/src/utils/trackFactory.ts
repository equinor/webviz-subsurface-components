/**
 * Utilities for instantiating different types of videx-tracks for well log visualization
 */

import type { StackedTrackOptions } from "@equinor/videx-wellog";
import type {
    GraphTrackOptions,
    PlotFactory,
} from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import {
    DualScaleTrack,
    GraphTrack,
    ScaleTrack,
    StackedTrack,
    createPlotType,
    defaultPlotFactory,
    graphLegendConfig,
} from "@equinor/videx-wellog";

import GradientFillPlot from "./gradientfill-plot";
import { scaleLegendConfig } from "./stack/scale-legend";

/**
 * Creates a new GraphTrack with default options and custom configuration.
 *
 * @param options - Configuration options for the graph track
 * @returns A new GraphTrack instance with generated ID
 */
export function newGraphTrack(
    /* should contain:
        title: string,
        data: [number, number][][],
        plots: PlotConfig[]
    */
    // ? Should we enforce this with an extended type? (@anders2303)
    options: GraphTrackOptions
): GraphTrack {
    const gradientFillPlotFactory: PlotFactory = {
        ...defaultPlotFactory,
        gradientfill: createPlotType(GradientFillPlot),
    };

    const defaultGraphTrackOptions: GraphTrackOptions = {
        legendConfig: graphLegendConfig,
        plotFactory: gradientFillPlotFactory,
    };

    // ! Explicitly passing undefined so videx generates a random ID
    return new GraphTrack(undefined as unknown as number, {
        ...defaultGraphTrackOptions,
        ...options,
    });
}

/**
 * Creates a new StackedTrack with the provided options.
 *
 * @param options - Configuration options for the stacked track
 * @returns A new StackedTrack instance with generated ID
 */
export function newStackedTrack(options: StackedTrackOptions): StackedTrack {
    // ! Explicitly passing undefined so videx generates a random ID
    return new StackedTrack(undefined as unknown as number, options);
}

/**
 * Creates a new ScaleTrack with the specified title and optional abbreviation and units.
 *
 * @param title - The title of the scale track
 * @param abbr - Optional abbreviation, defaults to title if not provided
 * @param units - Optional units, defaults to empty string if not provided
 * @returns A new ScaleTrack instance with generated ID and default configuration
 */
export function newScaleTrack(
    title: string,
    abbr?: string | null,
    units?: string | null
): ScaleTrack {
    // ! Explicitly passing undefined so videx generates a random ID
    return new ScaleTrack(undefined as unknown as number, {
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

/**
 * Creates a new DualScaleTrack with the specified mode, title and optional abbreviation and units.
 *
 * @param mode - The mode number for the dual scale track
 * @param title - The title of the dual scale track
 * @param abbr - Optional abbreviation, defaults to title if not provided
 * @param units - Optional units, defaults to empty string if not provided
 * @returns A new DualScaleTrack instance with generated ID and default configuration
 */
export function newDualScaleTrack(
    mode: number,
    title: string,
    abbr?: string | null,
    units?: string | null
): DualScaleTrack {
    // ! Explicitly passing undefined so videx generates a random ID
    return new DualScaleTrack(undefined as unknown as number, {
        mode: mode,
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}
