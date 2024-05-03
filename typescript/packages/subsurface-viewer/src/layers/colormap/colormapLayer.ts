import type { BitmapLayerPickingInfo, BitmapLayerProps } from "@deck.gl/layers";
import { BitmapLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";

import type { LayerPickInfo } from "../../layers/utils/layerTools";
import { decoder } from "../shader_modules";
import type { ValueDecoder } from "../utils/propertyMapTools";
import { decodeRGB } from "../utils/propertyMapTools";
import type { colorMapFunctionType } from "../utils/layerTools";
import { getModelMatrix } from "../utils/layerTools";
import fsColormap from "./colormap.fs.glsl";
import type {
    DeckGLLayerContext,
    ReportBoundingBoxAction,
} from "../../components/Map";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import { getRgbData } from "@emerson-eps/color-tables";
import type { ContinuousLegendDataType } from "../../components/ColorLegend";

function getImageData(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction?: colorMapFunctionType
) {
    const isColorMapFunctionDefined = typeof colorMapFunction !== "undefined";

    const data = new Uint8Array(256 * 3);

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = isColorMapFunctionDefined
            ? (colorMapFunction as colorMapFunctionType)(i / 255)
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
        this.setState({
            isLoaded: false,
        });
        super.initializeState();
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms }: any): void {
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

        super.draw({
            uniforms: {
                ...uniforms,
                // Send the colormap texture to the shader.
                colormap,
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

    getPickingInfo({
        info,
    }: {
        info: PickingInfo;
    }): BitmapLayerPickingInfo & LayerPickInfo {
        if (this.state["disablePicking"] || !info.color) {
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
