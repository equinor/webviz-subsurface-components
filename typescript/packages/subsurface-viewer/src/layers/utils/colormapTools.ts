import type { SamplerProps, Texture, TextureProps } from "@luma.gl/core";

import type {
    colorTablesArray,
    createColorMapFunction as createColormapFunction,
} from "@emerson-eps/color-tables/";
import { rgbValues } from "@emerson-eps/color-tables/";
import { createDefaultContinuousColorScale } from "@emerson-eps/color-tables/dist/component/Utils/legendCommonFunction";

import type { DeckGLLayerContext } from "./layerTools";

import type { Color } from "../../utils/Color";

/** Type of functions returning a color from a value in the [0,1] range. */
export type ColormapFunctionType = ReturnType<typeof createColormapFunction>;
/** @deprecated Use ColormapFunctionType instead. */
export type colorMapFunctionType = ColormapFunctionType;
/** @deprecated Use ColormapFunctionType instead. */
export type ColorMapFunctionType = ColormapFunctionType;

export interface IColormapHints {
    discreteData: boolean;
    colormapSize: number;
}

/**
 * Colormap definition, taken from the application color tables,
 * used for mapping data values to colors.
 *
 * @property colormapName - The name of the colormap.
 */
export interface ColorTableProps {
    colormapName: string;
    colorTables?: colorTablesArray;
}

/**
 * Represents the possible types of colormap inputs that can be used in the subsurface viewer.
 *
 * - `ColormapFunctionType`: A function that returns a color from a property value.
 * - `Uint8Array`: A raw array of color values, typically representing RGBA or RGB data.
 * - `ColorTableProps`: An object describing a color table with additional properties.
 *
 * This union type allows flexibility in specifying how colormaps are provided to components or utilities.
 */
export type ColormapProps = ColormapFunctionType | Uint8Array | ColorTableProps;

/**
 * Configuration options for setting up a colormap.
 */
export interface ColormapSetup {
    /**
     * Minimum and maximum value range, used to map values to the the colormap colors.
     * Values outside of this range will be displayed with either the clamp color if activated,
     * or with the color of the corresponding colormap end color.
     */
    valueRange?: [number, number];
    /**
     * Range specifying the minimum and maximum values to clamp the data.
     * If it is undefined or not provided, the colormap range will be used.
     * If it is null, no clamping will be applied.
     */
    clampRange?: [number, number] | null;
    /**
     * Color or pair of colors used for clamped values.
     * If a single color is provided, it is used for both ends of the range.
     * If it is undefined or not provided, the default clamp color will be used.
     * If it is null, no clamping will be applied.
     */
    clampColor?: Color | [Color, Color] | null;
    /** Value used to represent undefined data. */
    undefinedValue?: number;
    /** Color used for undefined data. */
    undefinedColor?: Color;
    /** Control used to apply or not smoothing to the display of the property.  */
    smooth?: boolean;
}

/**
 * Creates an array of colors as RGB triplets in range [0, 1] using the colormap definition.
 * @param colormapDef Definition of the colormap.
 * @param colormapSize Number of colors in the color map.
 * @param discreteColormapFunction If true, the color map function is targeting indices ranging from 0 to colormapSize.
 * @returns Array of colors.
 */
export function getImageData(
    colormapDef: ColormapProps,
    colormapSize: number = 256,
    discreteColormapFunction: boolean = false
): Uint8Array {
    type funcType = (x: number) => Color;

    if (colormapDef instanceof Uint8Array) {
        // If colormapProps is a Uint8Array, return it directly
        return colormapDef;
    }

    const isFunctionDefined = colormapDef !== undefined;
    const isColorTableDef =
        "colormapName" in colormapDef &&
        "colorTables" in colormapDef &&
        !!colormapDef.colorTables;

    let colormap = createDefaultContinuousColorScale() as unknown as funcType;

    if (isColorTableDef) {
        if (colormapDef.colormapName) {
            colormap = (value: number) =>
                rgbValues(
                    value,
                    colormapDef.colormapName,
                    colormapDef.colorTables
                );
        }
    } else if (isFunctionDefined) {
        colormap =
            typeof colormapDef === "function"
                ? (colormapDef as funcType)
                : ((() => colormapDef) as unknown as funcType);
    }

    const data = new Uint8Array(colormapSize * 3);

    const scaling = discreteColormapFunction
        ? 1
        : 1 / Math.max(colormapSize - 1, 1);
    for (let i = 0; i < colormapSize; i++) {
        const color = colormap ? colormap(scaling * i) : [1, 0, 0];
        if (color) {
            data[3 * i + 0] = color[0];
            data[3 * i + 1] = color[1];
            data[3 * i + 2] = color[2];
        }
    }

    return data;
}

const DEFAULT_TEXTURE_PARAMETERS: SamplerProps = {
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    minFilter: "linear",
    magFilter: "linear",
};

const DISCRETE_TEXTURE_PARAMETERS: SamplerProps = {
    minFilter: "nearest",
    magFilter: "nearest",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
};
export function createColormapTexture(
    colormap: ColormapProps,
    context: DeckGLLayerContext,
    colormapHints: IColormapHints
): Texture {
    const textureProps: TextureProps = {
        sampler: DEFAULT_TEXTURE_PARAMETERS,
        width: 256,
        height: 1,
        format: "rgb8unorm-webgl",
    };

    if (colormapHints.discreteData) {
        if (colormapHints.colormapSize === 0) {
            const colormapTexture = context.device.createTexture({
                ...textureProps,
                sampler: DISCRETE_TEXTURE_PARAMETERS,
                width: colormapHints.colormapSize,
                data: new Uint8Array([0, 0, 0, 0, 0, 0]),
            });
            return colormapTexture;
        }

        const colormapData =
            colormap instanceof Uint8Array
                ? colormap
                : getImageData(
                      colormap,
                      colormapHints.colormapSize,
                      colormapHints.discreteData
                  );

        const colormapTexture = context.device.createTexture({
            ...textureProps,
            sampler: DISCRETE_TEXTURE_PARAMETERS,
            width: colormapHints.colormapSize,
            data: colormapData,
        });

        return colormapTexture;
    }

    const data = getImageData(colormap);

    const colormapTexture = context.device.createTexture({
        ...textureProps,
        data: data,
    });
    return colormapTexture;
}
