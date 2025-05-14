import type { BitmapLayerPickingInfo, BitmapLayerProps } from "@deck.gl/layers";
import { BitmapLayer } from "@deck.gl/layers";
import type { LayerProps, PickingInfo } from "@deck.gl/core";

import type {
    LayerPickInfo,
    TypeAndNameLayerProps,
} from "../../layers/utils/layerTools";
import { decodeRGB, type ValueDecoder } from "../utils/propertyMapTools";
import type { ColorMapFunctionType } from "../utils/layerTools";
import { getModelMatrix } from "../utils/layerTools";
import fsColormap from "./colormap.fs.glsl";
import type {
    DeckGLLayerContext,
    ReportBoundingBoxAction,
} from "../../components/Map";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import { getRgbData } from "@emerson-eps/color-tables";
import type { ContinuousLegendDataType } from "../../components/ColorLegend";
import type { ShaderModule } from "@luma.gl/shadertools";
import type { Model } from "@luma.gl/engine";
import { project32 } from "@deck.gl/core";

function getImageData(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction?: ColorMapFunctionType
) {
    const isColorMapFunctionDefined = typeof colorMapFunction !== "undefined";

    const data = new Uint8Array(256 * 3);

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = isColorMapFunctionDefined
            ? (colorMapFunction as ColorMapFunctionType)(i / 255)
            : getRgbData(value, colorMapName, colorTables);
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
export interface ColormapLayerProps
    extends BitmapLayerProps,
        TypeAndNameLayerProps {
    // Name of color map.
    colorMapName: string;

    // Optional function property.
    // If defined this function will override the color map.
    // Takes a value in the range [0,1] and returns a color.
    colorMapFunction?: ColorMapFunctionType;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // See ValueDecoder in propertyMapTools.ts
    valueDecoder: ValueDecoder;

    // Rotates image around bounds upper left corner counterclockwise in degrees.
    rotDeg: number;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "ColormapLayer",
    name: "Property map",
    id: "colormap-layer",
    pickable: true,
    visible: true,
    valueRange: { type: "array", value: [0, 1] },
    colorMapRange: { type: "array" },
    valueDecoder: {
        rgbScaler: [1, 1, 1],
        // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
        floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
        offset: 0,
        step: 0,
    },
    rotDeg: 0,
    colorMapName: "Rainbow",
};

export default class ColormapLayer extends BitmapLayer<ColormapLayerProps> {
    initializeState(): void {
        super.initializeState();
    }

    setShaderModuleProps(
        ...props: Parameters<Model["shaderInputs"]["setProps"]>
    ): void {
        if (!this.isLoaded) {
            if (typeof this.props.reportBoundingBox !== "undefined") {
                const xMin = this.props.bounds[0] as number;
                const yMin = this.props.bounds[1] as number;
                const zMin = 1;
                const xMax = this.props.bounds[2] as number;
                const yMax = this.props.bounds[3] as number;
                const zMax = -1;

                this.props.reportBoundingBox({
                    layerBoundingBox: [xMin, yMin, zMin, xMax, yMax, zMax],
                });
            }
        }

        // Set property for modelMatrix.
        const m = getModelMatrix(
            this.props.rotDeg,
            this.props.bounds[0] as number, // Rotate around upper left corner of bounds
            this.props.bounds[3] as number
        );
        for (const model of this.getModels()) {
            const isDefined =
                (props[0] as { project?: { modelMatrix?: unknown } })?.project
                    ?.modelMatrix !== undefined;
            if (isDefined) {
                (props[0]["project"] as { modelMatrix?: unknown }).modelMatrix =
                    m;
            }

            model.shaderInputs.setProps(...props);
        }

        // Properties for local shader module.
        const valueRangeMin = this.props.valueRange[0] ?? 0.0;
        const valueRangeMax = this.props.valueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        const colormap = this.context.device.createTexture({
            width: 256,
            height: 1,
            format: "rgb8unorm-webgl",
            data: getImageData(
                this.props.colorMapName,
                (this.context as DeckGLLayerContext).userData.colorTables,
                this.props.colorMapFunction
            ),
        });

        this.state.model?.setBindings({ colormap });

        super.setShaderModuleProps({
            map: {
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,

                rgbScaler: this.props.valueDecoder.rgbScaler,
                floatScaler: this.props.valueDecoder.floatScaler,
                offset: this.props.valueDecoder.offset,
                step: this.props.valueDecoder.step,
            },
        });
    }

    getShaders() {
        const parentShaders = super.getShaders();
        // use object.assign to make sure we don't overwrite existing fields like `vs`, `modules`...
        return Object.assign({}, parentShaders, {
            fs: fsColormap,
            modules: [...parentShaders.modules, project32, map2DUniforms],
        });
    }

    getPickingInfo({
        info,
    }: {
        info: PickingInfo;
    }): BitmapLayerPickingInfo & LayerPickInfo {
        if (!info.color) {
            return info as BitmapLayerPickingInfo;
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
        } as unknown as BitmapLayerPickingInfo;
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

// local shader module for the uniforms
const map2DUniformsBlock = /*glsl*/ `\
uniform mapUniforms {
    float valueRangeMin;
    float valueRangeMax;
    float colorMapRangeMin;
    float colorMapRangeMax;

    vec3 rgbScaler;    // r, g and b multipliers
    float floatScaler; // value multiplier
    float offset;      // translation of the r, g, b sum
    float step;        // discretize the value in a number of
} map;

float decode_rgb2float(vec3 rgb) {
  rgb *= map.rgbScaler * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
  float value = (rgb.r + rgb.g + rgb.b + map.offset) * map.floatScaler;

  // Value must be in [0, 1] and step in (0, 1]
  if (map.step > 0.0) {
    value = floor(value / map.step + 0.5) * map.step;
  }

  // If colorMapRangeMin/Max specified, color map will span this interval.
  float x  = value * (map.valueRangeMax - map.valueRangeMin) + map.valueRangeMin;
  x = (x - map.colorMapRangeMin) / (map.colorMapRangeMax - map.colorMapRangeMin);
  x = max(0.0, x);
  x = min(1.0, x);

  return x;
}
`;

type Map2DUniformsType = {
    valueRangeMin: number;
    valueRangeMax: number;
    colorMapRangeMin: number;
    colorMapRangeMax: number;

    rgbScaler: [number, number, number];
    floatScaler: number;
    offset: number;
    step: number;
};

// NOTE: this must exactly the same name as in the uniform block
const map2DUniforms = {
    name: "map",
    vs: map2DUniformsBlock,
    fs: map2DUniformsBlock,
    uniformTypes: {
        valueRangeMin: "f32",
        valueRangeMax: "f32",
        colorMapRangeMin: "f32",
        colorMapRangeMax: "f32",

        rgbScaler: "vec3<f32>",
        floatScaler: "f32",
        offset: "f32",
        step: "f32",
    },
} as const satisfies ShaderModule<LayerProps, Map2DUniformsType>;
