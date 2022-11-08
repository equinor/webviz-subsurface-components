import { BitmapLayer, BitmapLayerProps } from "@deck.gl/layers/typed";
import { PickingInfo } from "@deck.gl/core/typed";
import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/webgl";

import { LayerPickInfo } from "../../layers/utils/layerTools";
import { decoder } from "../shader_modules";
import { decodeRGB, ValueDecoder } from "../utils/propertyMapTools";
import { getModelMatrix, colorMapFunctionType } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import fsColormap from "./colormap.fs.glsl";
import { DeckGLLayerContext } from "../../components/Map";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { getRgbData } from "@emerson-eps/color-tables";
import { ContinuousLegendDataType } from "../../components/ColorLegend";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

function getImageData(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction?: colorMapFunctionType,
    breakpoint?: number[],
    isLog?: boolean,
) {
    const isColorMapFunctionDefined = typeof colorMapFunction !== "undefined";

    const data = new Uint8Array(256 * 3);

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = isColorMapFunctionDefined
            ? (colorMapFunction as colorMapFunctionType)(i / 255)
            : // Passing argument "breakpoint" is temporary solution for now since the colortable does not save the edited breakpoints
              // When save functionality of breakpoint is done, prop "breakpoint" will be removed from here
              getRgbData(value, colorMapName, colorTables, breakpoint, isLog);
        let color: number[] = [];
        if (rgb != undefined) {
            if (Array.isArray(rgb)) {
                color = rgb;
            } else {
                color = [rgb.r, rgb.g, rgb.b];
            }
        }

        data[3 * i + 0] = color[0];
        data[3 * i + 1] = color[1];
        data[3 * i + 2] = color[2];
    }

    return data;
}

// Most props are inherited from DeckGL's BitmapLayer. For a full list, see
// https://deck.gl/docs/api-reference/layers/bitmap-layer
//
// The property map is encoded in an image and sent in the `image` prop of the BitmapLayer.
// The same approach is used in DeckGL's TerrainLayer: https://deck.gl/docs/api-reference/geo-layers/terrain-layer
//
// The image format is based on Tizen's terrain format and Mapbox's TerrainRGB:
// https://github.com/tilezen/joerd/blob/master/docs/formats.md
// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
//
// The main idea is that property values (floats) are encoded in the R G and B channels of an image.
// We parametrize decoding, so we can support both Tizen and Mapbox terrains by adapting
// the valueDecoder for each format.
// We also support and use by default a format that optimizes for precision.
// By default, the value decoder will map RGB(0, 0, 0) to the minimum value in valueRange
// and RGB(255, 255, 255) to the maximum value in valueRange, thus giving us the full
// > 16mil possible values for any property value range.
// We also support property maps with an alpha channel. See colormap.fs.glsl for more details.
export interface ColormapLayerProps extends BitmapLayerProps {
    // Name of color map.
    colorMapName: string;

    // Optional function property.
    // If defined this function will override the color map.
    // Takes a value in the range [0,1] and returns a color.
    colorMapFunction?: colorMapFunctionType;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // See ValueDecoder in propertyMapTools.ts
    valueDecoder: ValueDecoder;

    // Rotates image around bounds upper left corner counterclockwise in degrees.
    rotDeg: number;

    // user defined domains
    breakPoint?: number[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReportedBoundingBox?: any;

    // check for logarithmic values
    isLog?: boolean;
}

const defaultProps = layersDefaultProps["ColormapLayer"] as ColormapLayerProps;

export default class ColormapLayer extends BitmapLayer<ColormapLayerProps> {
    initializeState(): void {
        this.setState({
            isLoaded: false,
        });
        super.initializeState();
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms, context }: any): void {
        if (!this.state["isLoaded"]) {
            this.setState({
                isLoaded: true,
            });

            if (typeof this.props.setReportedBoundingBox !== "undefined") {
                const xMin = this.props.bounds[0];
                const yMin = this.props.bounds[1];
                const zMin = 1;
                const xMax = this.props.bounds[2];
                const yMax = this.props.bounds[3];
                const zMax = -1;
                const bbox = [xMin, yMin, zMin, xMax, yMax, zMax];

                this.props.setReportedBoundingBox(bbox);
            }
        }

        const mergedModuleParams = {
            ...moduleParameters,
            valueDecoder: {
                // The prop objects are not merged with the defaultProps by default.
                // See https://github.com/facebook/react/issues/2568
                ...defaultProps.valueDecoder,
                ...moduleParameters.valueDecoder,
            },
            modelMatrix: getModelMatrix(
                this.props.rotDeg,
                this.props.bounds[0] as number, // Rotate around upper left corner of bounds
                this.props.bounds[3] as number
            ),
        };
        super.setModuleParameters(mergedModuleParams);

        const valueRangeMin = this.props.valueRange[0] ?? 0.0;
        const valueRangeMax = this.props.valueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        super.draw({
            uniforms: {
                ...uniforms,
                // Send the colormap texture to the shader.
                colormap: new Texture2D(context.gl, {
                    width: 256,
                    height: 1,
                    format: GL.RGB,
                    data: getImageData(
                        this.props.colorMapName,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.colorMapFunction,
                        this.props.breakPoint,
                        this.props.isLog
                    ),
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,
            },
            moduleParameters: mergedModuleParams,
        });
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    getShaders(): any {
        const parentShaders = super.getShaders();
        // Overwrite the BitmapLayer's default fragment shader with ours, that does colormapping.
        parentShaders.fs = fsColormap;
        // Add the decoder shader module to our colormap shader, so we can use the decoder function from our shader.
        parentShaders.modules.push(decoder);
        return parentShaders;
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (this.state["pickingDisabled"] || !info.color) {
            return info;
        }

        const mergedDecoder = {
            ...defaultProps.valueDecoder,
            ...this.props.valueDecoder,
        };
        // The picked color is the one in raw image, not the one after colormapping.
        // We just need to decode that RGB color into a property float value.
        const val = decodeRGB(info.color, mergedDecoder, this.props.valueRange);

        return {
            ...info,
            // Picking color doesn't represent object index in this layer.
            // For more details, see https://deck.gl/docs/developer-guide/custom-layers/picking
            index: 0,
            propertyValue: val,
        };
    }

    getLegendData(): ContinuousLegendDataType {
        const valueRangeMin = this.props.valueRange[0] ?? 0.0;
        const valueRangeMax = this.props.valueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const min = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const max = this.props.colorMapRange?.[1] ?? valueRangeMax;

        return {
            discrete: false,
            valueRange: [min, max],
            colorName: this.props.colorMapName,
            title: "PropertyMapLayer",
            colorMapFunction: this.props.colorMapFunction,
        };
    }
}

ColormapLayer.layerName = "ColormapLayer";
ColormapLayer.defaultProps = defaultProps;
