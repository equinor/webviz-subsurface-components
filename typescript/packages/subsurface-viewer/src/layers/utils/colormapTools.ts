import type { Color } from "@deck.gl/core";

import type { SamplerProps, Texture, TextureProps } from "@luma.gl/core";

import type {
    colorTablesArray,
    createColorMapFunction as createColormapFunction,
} from "@emerson-eps/color-tables/";
import { rgbValues } from "@emerson-eps/color-tables/";
import { createDefaultContinuousColorScale } from "@emerson-eps/color-tables/dist/component/Utils/legendCommonFunction";

import type { DeckGLLayerContext } from "./layerTools";

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
}

/**
 * Colormap definition used for mapping data values to colors.
 *
 * @property colorTables - An array or collection of color tables from which to select the colormap.
 */
export interface ColorTableDef extends ColorTableProps {
    colorTables: colorTablesArray;
}

export type ColormapProps = ColorMapFunctionType | Uint8Array | ColorTableProps;

/**
 * Represents the possible types that can be used as colormap properties.
 *
 * - `ColormapFunctionType`: A function converting a value to a color.
 * - `Uint8Array`: A typed array containing color data.
 * - `ColorTableDef`: An object representing a color table.
 */
export type TColormapDef = ColormapFunctionType | Uint8Array | ColorTableDef;

/**
 * Creates an array of colors as RGB triplets in range [0, 1] using the colormap definition.
 * @param colormapDef Definition of the colormap.
 * @param colormapSize Number of colors in the color map.
 * @param discreteColormapFunction If true, the color map function is targeting indices ranging from 0 to colormapSize.
 * @returns Array of colors.
 */
export function getImageData(
    colormapDef: TColormapDef,
    colormapSize: number = 256,
    discreteColormapFunction: boolean = false
): Uint8Array {
    type funcType = (x: number) => Color;

    if (colormapDef instanceof Uint8Array) {
        // If colorMapProps is a Uint8Array, return it directly
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

    return data ? data : new Uint8Array([0, 0, 0]);
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
    colormap: TColormapDef,
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
