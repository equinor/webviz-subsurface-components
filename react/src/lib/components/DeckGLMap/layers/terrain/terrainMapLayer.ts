import {
    SimpleMeshLayer,
    SimpleMeshLayerProps,
} from "@deck.gl/mesh-layers/typed";
import { COORDINATE_SYSTEM } from "@deck.gl/core/typed";
import { Color, PickingInfo } from "@deck.gl/core/typed";
import fsShader from "./terrainmap.fs.glsl";
import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/webgl";
import { DeckGLLayerContext } from "../../components/Map";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import { createDefaultContinuousColorScale } from "@emerson-eps/color-tables/dist/component/Utils/legendCommonFunction";
import {
    createPropertyData,
    PropertyDataType,
    colorMapFunctionType,
} from "../utils/layerTools";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

export type Material =
    | {
          ambient: number;
          diffuse: number;
          shininess: number;
          specularColor: [number, number, number];
      }
    | boolean;

export const DECODER = {
    rScaler: 256 * 256,
    gScaler: 256,
    bScaler: 1,
    offset: 0,
};

function getImageData(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction: colorMapFunctionType | undefined
) {
    const isColorMapFunctionDefined = typeof colorMapFunction !== "undefined";
    const isColorMapNameDefined = !!colorMapName;

    const data = new Uint8Array(256 * 3);

    const defaultColorMap = createDefaultContinuousColorScale;

    const colorMap = isColorMapFunctionDefined
        ? colorMapFunction
        : isColorMapNameDefined
        ? (value: number) => rgbValues(value, colorMapName, colorTables)
        : defaultColorMap();

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const color = colorMap ? colorMap(value) : [0, 0, 0];
        if (color) {
            data[3 * i + 0] = color[0];
            data[3 * i + 1] = color[1];
            data[3 * i + 2] = color[2];
        }
    }

    return data ? data : [0, 0, 0];
}

export type DataItem = {
    position: [number, number];
    angle: number;
    color: [number, number, number];
};

export type TerrainMapLayerData = [DataItem?];

export interface TerrainMapLayerProps<D> extends SimpleMeshLayerProps<D> {
    // texture as ImageData.
    textureImageData: ImageData;

    // mesh  as ImageData.
    meshImageData: ImageData;

    // Min and max of map height values values.
    meshValueRange: [number, number];

    // Contourlines reference point and interval.
    contours: [number, number];

    // Contourlines may be calculated either on depth/z-value or on property/texture value
    isContoursDepth: boolean;

    // Name of color map.
    colorMapName: string;

    // Optional function property.
    // If defined this function will override the color map.
    // Takes a value in the range [0,1] and returns a color.
    colorMapFunction?: colorMapFunctionType;

    // Min and max property values.
    propertyValueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // Clamp colormap to this color at ends.
    // Given as array of three values (r,g,b) e.g: [255, 0, 0]
    // If not set or set to true, it will clamp to color map min and max values.
    // If set to false the clamp color will be completely transparent.
    colorMapClampColor: Color | undefined | boolean;
}

const defaultProps = {
    data: [{ position: [0, 0], angle: 0, color: [255, 0, 0, 0] }], // dummy data

    getPosition: (d: DataItem) => d.position,
    getColor: (d: DataItem) => d.color,
    getOrientation: (d: DataItem): [number, number, number] => [0, d.angle, 0],
    contours: [-1, -1],
    colorMapName: "",
    propertyValueRange: [0.0, 1.0],
    isContoursDepth: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    textureImageData: { value: null, type: "object", async: true },
    meshImageData: { value: null, type: "object", async: true },
    meshValueRange: [0.0, 1.0],
};

// This is a private layer used only by the composite Map3DLayer.
// It is an extension of SimpleMeshLayer but with modified fragment shader
// so that the texture pixel values can be used as lookup in  a supplied color map.
export default class TerrainMapLayer extends SimpleMeshLayer<
    TerrainMapLayerData,
    TerrainMapLayerProps<TerrainMapLayerData>
> {
    properties?: PropertyDataType[];
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ uniforms, context }: any): void {
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const valueRangeMin = this.props.propertyValueRange[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        const isClampColor: boolean =
            this.props.colorMapClampColor !== undefined &&
            this.props.colorMapClampColor !== true &&
            this.props.colorMapClampColor !== false;
        let colorMapClampColor = isClampColor
            ? this.props.colorMapClampColor
            : [0, 0, 0];

        // Normalize to [0,1] range.
        colorMapClampColor = (colorMapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        );

        const isColorMapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;

        super.draw({
            uniforms: {
                ...uniforms,
                colormap: new Texture2D(context.gl, {
                    width: 256,
                    height: 1,
                    format: GL.RGB,
                    data: getImageData(
                        this.props.colorMapName,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.colorMapFunction
                    ),
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,
                contourReferencePoint,
                contourInterval,
                isContoursDepth,
                colorMapClampColor,
                isColorMapClampColorTransparent,
                isClampColor,
            },
        });
    }

    getShaders(): unknown {
        const parentShaders = super.getShaders();
        // Overwrite the default fragment shader with ours.
        parentShaders.fs = fsShader;

        return {
            ...parentShaders,

            // Inject this into vertex shader. Vi want to export vertex world position to
            // fragment shader for making contour lines.
            inject: {
                "vs:#decl": `
                  out vec3 worldPos;
                `,

                "vs:#main-start": `
                   worldPos = positions;
                `,
            },
        };
    }

    decodePickingColor(): number {
        return 0;
    }

    getPickingInfo({ info }: { info: PickingInfo }): PickingInfo & {
        properties?: PropertyDataType[];
    } {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pickColor = info.color as Color;
        if (!pickColor) {
            return info;
        }

        // Texture coordinates.
        const s = pickColor[0] / 255.0;
        const t = pickColor[1] / 255.0;

        const is_outside: boolean = pickColor[2] == 0;
        if (is_outside) {
            // Mouse is outside the non-transparent part of the map.
            return info;
        }

        // MESH HEIGHT VALUE.
        const meshImageData: ImageData = this.props.meshImageData;
        const isMeshImageData = meshImageData !== null;
        const value_mesh = isMeshImageData
            ? getValue(meshImageData, s, t, DECODER)
            : 0;

        // TEXTURE PROPERTY VALUE.
        const textureImageData: ImageData = this.props.textureImageData;
        const value_property = getValue(textureImageData, s, t, DECODER);

        const layer_properties: PropertyDataType[] = [];
        layer_properties.push(
            getMapProperty(
                "Property",
                value_property,
                this.props.propertyValueRange
            ),
            isMeshImageData
                ? getMapProperty("Depth", value_mesh, this.props.meshValueRange)
                : { name: "Depth", value: 0 }
        );

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

TerrainMapLayer.layerName = "TerrainMapLayer";
TerrainMapLayer.defaultProps = defaultProps;

//================= Local help functions. ==================

function getMapProperty(
    name: string,
    value: number,
    value_range: [number, number]
): PropertyDataType {
    // Remap the [0, 1] decoded value to property value range.
    const [min, max] = value_range;

    const floatScaler = 1.0 / (256.0 * 256.0 * 256.0 - 1.0);
    const scaled_value = value * floatScaler;

    value = scaled_value * (max - min) + min;
    return createPropertyData(name, value);
}

function getValue(
    imageData: ImageData,
    s: number,
    t: number,
    decoder: { rScaler: number; gScaler: number; bScaler: number }
): number {
    const int_view = new Uint8ClampedArray(
        imageData.data,
        0,
        imageData.data.length
    );

    const w = imageData.width;
    const h = imageData.height;
    const j = Math.min(Math.floor(w * s), w - 1);
    const i = Math.min(Math.floor(h * t), h - 1);

    const pixelNo = i * w + j;
    const r = int_view[pixelNo * 4 + 0] * decoder.rScaler;
    const g = int_view[pixelNo * 4 + 1] * decoder.gScaler;
    const b = int_view[pixelNo * 4 + 2] * decoder.bScaler;
    const value = r + g + b;

    return value;
}
