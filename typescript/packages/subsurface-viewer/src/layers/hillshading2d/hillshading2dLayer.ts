import type { Texture } from "@luma.gl/core";
import { project32, type LayerProps, type PickingInfo } from "@deck.gl/core";
import type { BitmapLayerPickingInfo, BitmapLayerProps } from "@deck.gl/layers";
import { BitmapLayer } from "@deck.gl/layers";

import type { Model } from "@luma.gl/engine";
import type { ShaderModule } from "@luma.gl/shadertools";

import type {
    LayerPickInfo,
    ReportBoundingBoxAction,
} from "../utils/layerTools";
import { getModelMatrix } from "../utils/layerTools";
import type { ValueDecoder } from "../utils/propertyMapTools";
import { decodeRGB } from "../utils/propertyMapTools";

import type { RGBColor } from "../../utils";

import { precisionForTests } from "../shader_modules/test-precision/precisionForTests";

import fsHillshading from "./hillshading2d.fs.glsl";

// Most props are inherited from DeckGL's BitmapLayer. For a full list, see:
// https://deck.gl/docs/api-reference/layers/bitmap-layer
//
// The property map is encoded in an image and sent in the `image` prop of the BitmapLayer.
// For more details on the property map encoding, see colormapLayer.ts
export interface Hillshading2DProps extends BitmapLayerProps {
    // Min and max property values.
    valueRange: [number, number];

    // Direction the light comes from.
    lightDirection: [number, number, number];
    // Intensity of light that is applied to the whole map uniformly.
    ambientLightIntensity: number;
    // Intensity of light that is applied to the lightened potions of the map.
    diffuseLightIntensity: number;

    // Use color map in this range
    colorMapRange: [number, number];

    // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
    valueDecoder: ValueDecoder;

    // Rotates image around bounds upper left corner counterclockwise in degrees.
    rotDeg: number;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "Hillshading2DLayer",
    name: "Hill shading",
    id: "hillshading-layer",
    opacity: 1.0,
    pickable: true,
    visible: true,
    rotDeg: 0,
    valueRange: { type: "array", value: [0, 1] },
    lightDirection: [1, 1, 1],
    ambientLightIntensity: 0.5,
    diffuseLightIntensity: 0.5,
    valueDecoder: {
        rgbScaler: [1, 1, 1],
        // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
        floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
        offset: 0,
        step: 0,
    },
};

export default class Hillshading2DLayer extends BitmapLayer<Hillshading2DProps> {
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

        const valueRangeMin = this.props.valueRange[0] ?? 0.0;
        const valueRangeMax = this.props.valueRange[1] ?? 1.0;
        const colormapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colormapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        const [minVal, maxVal] = this.props.valueRange;

        const bitmapResolution = this.props.image
            ? [
                  (this.props.image as Texture).width,
                  (this.props.image as Texture).height,
              ]
            : [1, 1];
        const valueRangeSize = maxVal - minVal;
        const lightDirection = this.props.lightDirection;
        const ambientLightIntensity = this.props.ambientLightIntensity;
        const diffuseLightIntensity = this.props.diffuseLightIntensity;

        super.setShaderModuleProps({
            map: {
                valueRangeMin,
                valueRangeMax,
                colormapRangeMin,
                colormapRangeMax,

                bitmapResolution,
                valueRangeSize,
                lightDirection,
                ambientLightIntensity,
                diffuseLightIntensity,

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
            fs: fsHillshading,
            modules: [
                ...parentShaders.modules,
                project32,
                map2DUniforms,
                precisionForTests,
            ],
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
        // The picked color is the one in raw image, not the one after hillshading.
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
}

Hillshading2DLayer.layerName = "Hillshading2DLayer";
Hillshading2DLayer.defaultProps = defaultProps;

// local shader module for the uniforms
const map2DUniformsBlock = /*glsl*/ `\
uniform mapUniforms {
    float valueRangeMin;
    float valueRangeMax;
    float colormapRangeMin;
    float colormapRangeMax;

    vec2 bitmapResolution;
    float valueRangeSize;
    vec3 lightDirection;
    float ambientLightIntensity;
    float diffuseLightIntensity;

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

  // If colormapRangeMin/Max specified, color map will span this interval.
  float x  = value * (map.valueRangeMax - map.valueRangeMin) + map.valueRangeMin;
  x = (x - map.colormapRangeMin) / (map.colormapRangeMax - map.colormapRangeMin);
  x = max(0.0, x);
  x = min(1.0, x);

  return x;
}
`;

type Map2DUniformsType = {
    valueRangeMin: number;
    valueRangeMax: number;
    colormapRangeMin: number;
    colormapRangeMax: number;

    bitmapResolution: [number, number];
    valueRangeSize: number;
    lightDirection: [number, number, number];
    ambientLightIntensity: number;
    diffuseLightIntensity: number;

    rgbScaler: RGBColor;
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
        colormapRangeMin: "f32",
        colormapRangeMax: "f32",

        bitmapResolution: "vec2<f32>",
        valueRangeSize: "f32",
        lightDirection: "vec3<f32>",
        ambientLightIntensity: "f32",
        diffuseLightIntensity: "f32",

        rgbScaler: "vec3<f32>",
        floatScaler: "f32",
        offset: "f32",
        step: "f32",
    },
} as const satisfies ShaderModule<LayerProps, Map2DUniformsType>;
