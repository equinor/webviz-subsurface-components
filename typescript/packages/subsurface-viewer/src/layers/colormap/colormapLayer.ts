import type { Color, LayerProps, PickingInfo } from "@deck.gl/core";
import { project32 } from "@deck.gl/core";
import type { BitmapLayerPickingInfo, BitmapLayerProps } from "@deck.gl/layers";
import { BitmapLayer } from "@deck.gl/layers";

import type { ShaderModule } from "@luma.gl/shadertools";
import type { Model } from "@luma.gl/engine";
import type { Texture } from "@luma.gl/core";
import * as png from "@vivaxy/png";

import type {
    LayerPickInfo,
    ReportBoundingBoxAction,
    TypeAndNameLayerProps,
} from "../utils/layerTools";
import { type DeckGLLayerContext, getModelMatrix } from "../utils/layerTools";
import {
    type ColormapFunctionType,
    getImageData,
} from "../utils/colormapTools";
import { decodeRGB, type ValueDecoder } from "../utils/propertyMapTools";
import type { ContinuousLegendDataType } from "../../components/ColorLegend";
import fsColormap from "./colormap.fs.glsl";

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
    colorMapFunction?: ColormapFunctionType;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // See ValueDecoder in propertyMapTools.ts
    valueDecoder: ValueDecoder;

    // Rotates image around bounds upper left corner counterclockwise in degrees.
    rotDeg: number;

    // If true, draw contour lines.  Default false.
    contours: boolean;

    // If true, apply hillshading. Default false.
    hillshading: boolean;

    // Contour reference height. Default 0.
    contourReferencePoint: number;

    // Height between contour lines. Default 50.
    contourInterval: number;

    /**  Clamp colormap to this color at ends.
     * Given as array of three values (r,g,b) e.g: [255, 0, 0]
     * If not set or set to true, it will clamp to color map min and max values.
     * If set to false the clamp color will be completely transparent.
     */
    colorMapClampColor: Color | undefined | boolean;

    // Optional height map. If set hillshading and contourlines will be based on this map.
    heightMapUrl: string;

    // Min and max values of optional height map.
    // Defaults to "valueRange".
    heightValueRange: [number, number];

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
    contours: false,
    hillshading: false,
    contourReferencePoint: 0,
    contourInterval: 50, // 50 meter by default
    heightMapUrl: "",
};

export default class ColormapLayer extends BitmapLayer<ColormapLayerProps> {
    initializeState(): void {
        super.initializeState();

        const createPropertyTexture = async () => {
            const response = await fetch(this.props.heightMapUrl);
            if (!response.ok) {
                console.error("Could not load ", this.props.heightMapUrl);
            } else {
                const blob = await response.blob();
                const contentType = response.headers.get("content-type");
                const isPng = contentType === "image/png";
                if (isPng) {
                    const heightMapTexture = await new Promise((resolve) => {
                        const fileReader = new FileReader();
                        fileReader.readAsArrayBuffer(blob);
                        fileReader.onload = () => {
                            const arrayBuffer = fileReader.result;
                            const imgData = png.decode(
                                arrayBuffer as ArrayBuffer
                            );
                            const w = imgData.width;
                            const h = imgData.height;

                            const data = imgData.data; // array of int's
                            const n = data.length;
                            const buffer = new ArrayBuffer(n);
                            const view = new DataView(buffer);
                            for (let i = 0; i < n; i++) {
                                view.setUint8(i, data[i]);
                            }

                            const array = new Uint8Array(buffer);
                            const propertyTexture =
                                this.context.device.createTexture({
                                    sampler: {
                                        addressModeU: "clamp-to-edge",
                                        addressModeV: "clamp-to-edge",
                                        minFilter: "linear",
                                        magFilter: "linear",
                                    },
                                    width: w,
                                    height: h,
                                    format: "rgba8unorm",
                                    data: array as Uint8Array,
                                });
                            resolve(propertyTexture);
                        };
                    });
                    this.setState({
                        ...this.state,
                        heightMapTexture,
                    });
                }
            }
        };
        createPropertyTexture();
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

        // If specified, color map will extend from colormapRangeMin to colormapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colormapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colormapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        const colormapTexture = this.context.device.createTexture({
            width: 256,
            height: 1,
            format: "rgb8unorm-webgl",
            data: getImageData(
                this.props.colorMapFunction ?? {
                    colormapName: this.props.colorMapName,
                    colorTables: (this.context as DeckGLLayerContext).userData
                        .colorTables,
                }
            ),
        });

        // eslint-disable-next-line
        // @ts-ignore
        let heightMapTexture = this.state.heightMapTexture;
        const isHeightMapTextureDefined =
            typeof heightMapTexture !== "undefined";

        if (!isHeightMapTextureDefined) {
            // Create a dummy texture
            heightMapTexture = this.context.device.createTexture({
                sampler: {
                    addressModeU: "clamp-to-edge",
                    addressModeV: "clamp-to-edge",
                    minFilter: "linear",
                    magFilter: "linear",
                },
                width: 1,
                height: 1,
                format: "rgba8unorm",
                data: new Uint8Array([1, 1, 1, 1]),
            });
        }

        const heightValueRangeMin =
            this.props.heightValueRange?.[0] ?? valueRangeMin;
        const heightValueRangeMax =
            this.props.heightValueRange?.[1] ?? valueRangeMax;

        this.state.model?.setBindings({ colormapTexture, heightMapTexture });

        const bitmapResolution = this.props.image
            ? [
                  (this.props.image as Texture).width,
                  (this.props.image as Texture).height,
              ]
            : [1, 1];

        const contours = this.props.contours;
        const hillshading = this.props.hillshading;

        const contourReferencePoint = this.props.contourReferencePoint;
        const contourInterval = this.props.contourInterval;

        const isClampColor: boolean =
            this.props.colorMapClampColor !== undefined &&
            this.props.colorMapClampColor !== true &&
            this.props.colorMapClampColor !== false;
        let colormapClampColor = isClampColor
            ? this.props.colorMapClampColor
            : [0, 0, 0];

        colormapClampColor = (colormapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        );

        const isColormapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;

        super.setShaderModuleProps({
            map: {
                valueRangeMin,
                valueRangeMax,
                colormapRangeMin,
                colormapRangeMax,
                contours,
                hillshading,
                bitmapResolution,
                contourReferencePoint,
                contourInterval,
                isClampColor,
                colormapClampColor,
                isColormapClampColorTransparent,
                isHeightMapTextureDefined,
                heightValueRangeMin,
                heightValueRangeMax,
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

        if (info.coordinate) {
            info.coordinate[2] = NaN; // disable z value in 2D map;
        }

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

        // If specified color map will extend from colormapRangeMin to colormapRangeMax.
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
    float colormapRangeMin;
    float colormapRangeMax;
    vec2 bitmapResolution;
    bool contours;
    bool hillshading;
    float contourReferencePoint;
    float contourInterval;
    bool isClampColor;
    vec3 colormapClampColor;
    bool isColormapClampColorTransparent;
    bool isHeightMapTextureDefined;
    float heightValueRangeMin;
    float heightValueRangeMax;
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

  return value;
}
`;

type Map2DUniformsType = {
    valueRangeMin: number;
    valueRangeMax: number;
    colormapRangeMin: number;
    colormapRangeMax: number;
    bitmapResolution: [number, number];
    contours: boolean;
    hillshading: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    isClampColor: boolean;
    colormapClampColor: [number, number, number];
    isColormapClampColorTransparent: boolean;
    isHeightMapTextureDefined: boolean;
    heightValueRangeMin: number;
    heightValueRangeMax: number;
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
        colormapRangeMin: "f32",
        colormapRangeMax: "f32",
        bitmapResolution: "vec2<f32>",
        contours: "u32",
        hillshading: "u32",
        contourReferencePoint: "f32",
        contourInterval: "f32",
        isClampColor: "u32",
        colormapClampColor: "vec3<f32>",
        isColormapClampColorTransparent: "u32",
        isHeightMapTextureDefined: "u32",
        heightValueRangeMin: "f32",
        heightValueRangeMax: "f32",
        rgbScaler: "vec3<f32>",
        floatScaler: "f32",
        offset: "f32",
        step: "f32",
    },
} as const satisfies ShaderModule<LayerProps, Map2DUniformsType>;
