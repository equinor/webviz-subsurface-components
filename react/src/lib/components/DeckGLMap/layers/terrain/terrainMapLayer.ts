import { SimpleMeshLayer } from "@deck.gl/mesh-layers"; // XXX RENAME LAYER TIL NOE MED MESH??
import { SimpleMeshLayerProps } from "@deck.gl/mesh-layers/simple-mesh-layer/simple-mesh-layer";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import fsShader from "!!raw-loader!./terrainmap.fs.glsl";
import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/core";
import { DeckGLLayerContext } from "../../components/Map";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

const DECODER = {
    rScaler: 256 * 256,
    gScaler: 256,
    bScaler: 1,
    offset: 0,
};

function getImageData(colorMapName: string, colorTables: colorTablesArray) {
    const data = new Uint8Array(256 * 3);

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = rgbValues(value, colorMapName, colorTables);
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

export type DataItem = {
    position: [number, number];
    angle: number;
    color: [number, number, number];
};

export type TerrainMapLayerData = [DataItem?];

export interface TerrainMapLayerProps<D> extends SimpleMeshLayerProps<D> {
    // Contourlines reference point and interval.
    contours: [number, number];

    // Name of color map.
    colorMapName: string;

    // Min and max property values.
    propertyValueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    //If true readout will be z value (depth). Otherwise it is the texture property value.
    isReadoutDepth: boolean;
}

const defaultProps = {
    data: [{ position: [0, 0], angle: 0, color: [255, 0, 0] }], // dummy data

    getPosition: (d: DataItem) => d.position,
    getColor: (d: DataItem) => d.color,
    getOrientation: (d: DataItem) => [0, d.angle, 0],
    contours: [-1, -1],
    colorMapName: "",
    propertyValueRange: [0.0, 1.0],
    colorMapRange: [0.0, 1.0],
    isReadoutDepth: false,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 600,
        specularColor: [255, 255, 255],
    },
};

// This is a private layer used only by the composite Map3DLayer.
// It is an extension of SimpleMeshLayer but with modified fragment shader
// so that the texture pixel values can be used as lookup in  a supplied color map.
export default class TerrainMapLayer extends SimpleMeshLayer<
    TerrainMapLayerData,
    TerrainMapLayerProps<TerrainMapLayerData>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ uniforms, context }: any): void {
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isReadoutDepth = this.props.isReadoutDepth;

        const valueRangeMin = this.props.propertyValueRange[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

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
                            .colorTables
                    ),
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,
                contourReferencePoint,
                contourInterval,
                isReadoutDepth,
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

    // For now, use `any` for the picking types.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.color) {
            return info;
        }

        // Note these colors are in the  0-255 range.
        const r = info.color[0] * DECODER.rScaler;
        const g = info.color[1] * DECODER.gScaler;
        const b = info.color[2] * DECODER.bScaler;

        const floatScaler = 1.0 / (256.0 * 256.0 * 256.0 - 1.0);

        const isPropertyReadout = !this.props.isReadoutDepth; // Either map properties or map depths are encoded here.
        let value = (r + g + b) * (isPropertyReadout ? floatScaler : 1.0);

        if (isPropertyReadout) {
            // Remap the [0, 1] decoded value to colorMapRange.
            const [min, max] = this.props.colorMapRange;
            value = value * (max - min) + min;
        }

        const valueString =
            (isPropertyReadout ? "Property: " : "Depth: ") + value.toFixed(1);

        return {
            ...info,
            propertyValue: valueString,
        };
    }
}

TerrainMapLayer.layerName = "TerrainMapLayer";
TerrainMapLayer.defaultProps = defaultProps;
