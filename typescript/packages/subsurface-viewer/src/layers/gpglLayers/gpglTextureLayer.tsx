import type {
    DefaultProps,
    LayerProps,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, picking, project32 } from "@deck.gl/core";

import { GL } from "@luma.gl/constants";
import type { Device, Texture, TextureProps } from "@luma.gl/core";
import type { GeometryProps } from "@luma.gl/engine";
import { Geometry, Model } from "@luma.gl/engine";
import type { ShaderModule } from "@luma.gl/shadertools";
import { lighting } from "@luma.gl/shadertools";

import { phongMaterial } from "../shader_modules/phong-lighting/phong-material";

import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import {
    type ColormapProps,
    type ColormapSetup,
    getImageData,
} from "../utils/colormapTools";

import type {} from "../../utils/Color";

import type {
    Color,
    RGBAColor,
    RGBColor,
    TypedFloatArray,
    TypedIntArray,
} from "../../utils";
import {
    isTypedArray,
    loadDataArray,
    toNormalizedColor,
    toTypedArray,
} from "../../utils";

import type { Texture2D } from "./typeDefs";

import fsShader from "./triangle.fs.glsl";
import vsShader from "./triangle.vs.glsl";
import fsTexShader from "./texTriangle.fs.glsl";
import vsTexShader from "./texTriangle.vs.glsl";
import fsLineShader from "./triangleLine.fs.glsl";
import vsLineShader from "./triangleLine.vs.glsl";

export type TexturedTriangleProps = {
    topology: "triangle-list" | "triangle-strip";
    vertices: TypedFloatArray | number[];
    normals?: TypedFloatArray | number[];
    texCoords?: TypedFloatArray | number[];
    propertiesData?: Texture2D;
    vertexIndices: { value: TypedIntArray | number[]; size: number };
};

export type TriangleMeshProps = {
    topology: "line-list" | "line-strip";
    vertices?: TypedFloatArray | number[];
    vertexIndices: { value: TypedIntArray | number[]; size: number };
};

export interface GpglTextureLayerProps extends ExtendedLayerProps {
    texturedTriangles: TexturedTriangleProps[];
    triangleMeshes: TriangleMeshProps[];
    showMesh: boolean;

    /**  Optional function property.
     * If defined this function will override the color map.
     * Takes a value in the range [0,1] and returns a color.
     * E.g. (x) => [x * 255, x * 255, x * 255]
     * May also be set as constant color:
     * E.g. [255, 0, 0] for constant red cells.
     * Can be defined as Uint8Array containing [R, G, B] triplets in [0, 255] range each.
     */
    colormap?: ColormapProps;

    colormapSetup?: ColormapSetup;

    color: RGBColor;
    smoothShading: boolean;
    enableLighting: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
}

const defaultColormapSetup: ColormapSetup = {
    valueRange: [0, 1],
    clampRange: undefined,
    clampColor: undefined,
    undefinedValue: Number.NaN,
    undefinedColor: [255, 0, 0, 200], // red color for undefined values
    smooth: true,
};

const defaultProps: DefaultProps<GpglTextureLayerProps> = {
    "@@type": "GpglTextureLayer",
    name: "Textured Triangles",
    id: "textured-triangles",
    data: ["dummy"],
    showMesh: false,
    colormap: {
        colormapName: "seismic",
    },
    colormapSetup: defaultColormapSetup,
    color: [100, 100, 255],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    depthTest: true,
    smoothShading: false,
    ZIncreasingDownwards: true,
    enableLighting: false,
    // deck.gl default props
    visible: true,
    pickable: true,
};

/**
 * GpglTextureLayer is a layer handling textured surfaces.
 *
 * A primary use case is to display seismic data.
 * The surfaces are expected to be small compared to the ones handled by the triangles layer.
 */
export class GpglTextureLayer extends Layer<GpglTextureLayerProps> {
    setShaderModuleProps(
        args: Partial<{
            [x: string]: Partial<Record<string, unknown> | undefined>;
        }>
    ): void {
        super.setShaderModuleProps({
            ...args,
            lighting: {
                ...args["lighting"],
                enabled: this.props.enableLighting,
            },
        });
    }

    initializeState(context: DeckGLLayerContext): void {
        const gl = context.device;
        this._createModels(gl).then(([triangleModels, meshModels]) => {
            this.setState({
                triangleModels: triangleModels,
                meshModels: meshModels,
            });
        });
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateParameters<this>): boolean {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.propsOrDataChanged
        );
    }

    updateState(params: UpdateParameters<Layer<GpglTextureLayerProps>>): void {
        super.updateState(params);
        this.initializeState(params.context as DeckGLLayerContext);
    }

    private _consolidateColormap(
        colormap: ColormapProps | undefined
    ): ColormapProps {
        if (colormap instanceof Uint8Array) {
            // If colormapProps is a Uint8Array, return it directly
            return colormap;
        }

        if (!colormap || "colormapName" in colormap) {
            return {
                colormapName: colormap?.colormapName ?? "seismic",
                colorTables: (this.context as DeckGLLayerContext).userData
                    .colorTables,
            };
        }
        return colormap;
    }

    private _createColormapTexture(
        device: Device,
        colormap: ColormapProps | undefined
    ): Texture {
        const textureProps: TextureProps = {
            sampler: {
                addressModeU: "clamp-to-edge",
                addressModeV: "clamp-to-edge",
                minFilter: "linear",
                magFilter: "linear",
            },
            width: 256,
            height: 1,
            format: "rgb8unorm-webgl",
        };

        return device.createTexture({
            ...textureProps,
            data: getImageData(this._consolidateColormap(colormap)),
        });
    }

    private async _createValuesTexture(
        device: Device,
        texture: Texture2D | undefined
    ): Promise<Texture | undefined> {
        if (texture === undefined || texture.values === undefined) {
            return undefined;
        }

        // fetch data
        const propertiesData = await loadDataArray(
            texture.values,
            Float32Array
        );
        if (!propertiesData) {
            return undefined;
        }

        const smooth =
            this.props.colormapSetup?.smooth ?? defaultColormapSetup.smooth;
        const textureProps: TextureProps = {
            sampler: {
                addressModeU: "clamp-to-edge",
                addressModeV: "clamp-to-edge",
                minFilter: smooth ? "linear" : "nearest",
                magFilter: smooth ? "linear" : "nearest",
            },
            width: texture.width,
            height: texture.height,
            format: "r32float",
        };
        return device.createTexture({
            ...textureProps,
            width: texture.width,
            height: texture.height,
            data: propertiesData,
        });
    }

    private async _createModels(device: Device): Promise<[Model[], Model[]]> {
        const models: Model[] = [];
        const meshModels: Model[] = [];

        // Collect promises for all texturedTriangles
        const triangleModelPromises =
            this.props.texturedTriangles?.map(async (texturedTrgs, i) => {
                const trglGeometry: GeometryProps = {
                    topology: texturedTrgs.topology,
                    attributes: {
                        positions: {
                            value: toTypedArray(
                                texturedTrgs.vertices,
                                Float32Array
                            ),
                            size: 3,
                        },
                        normals: {
                            value: toTypedArray(
                                texturedTrgs.normals ?? [],
                                Float32Array
                            ),
                            size: 3,
                        },
                        texCoords: {
                            value: toTypedArray(
                                texturedTrgs.texCoords ?? [],
                                Float32Array
                            ),
                            size: 2,
                        },
                    },
                    vertexCount: texturedTrgs.vertexIndices.size,
                    indices: {
                        value: toTypedArray(
                            texturedTrgs.vertexIndices.value,
                            Uint32Array
                        ),
                        size: 1,
                    },
                };
                const colormap = texturedTrgs.propertiesData
                    ? this._createColormapTexture(device, this.props.colormap)
                    : undefined;
                const floatValues = texturedTrgs.propertiesData
                    ? await this._createValuesTexture(
                          device,
                          texturedTrgs.propertiesData
                      )
                    : undefined;
                const bindings =
                    colormap && floatValues
                        ? { colormap, valueTexture: floatValues }
                        : undefined;

                const fs = bindings ? fsTexShader : fsShader;
                const vs = bindings ? vsTexShader : vsShader;

                const uniforms = bindings
                    ? texTrianglesUniforms
                    : trianglesUniforms;

                const model = new Model(device, {
                    id: `${this.props.id}-trgl-${i}`,
                    ...super.getShaders({
                        vs: vs,
                        fs: fs,
                        modules: [
                            project32,
                            picking,
                            lighting,
                            phongMaterial,
                            uniforms,
                        ],
                    }),
                    bufferLayout:
                        this.getAttributeManager()!.getBufferLayouts(),
                    geometry: new Geometry(trglGeometry),
                    bindings: bindings,

                    isInstanced: false, // This only works when set to false.});
                });

                // default mesh model if none if provided
                let meshModel: Model | undefined = undefined;
                if (!this.props.triangleMeshes?.length && this.props.showMesh) {
                    const indices = computeMeshIndices(
                        texturedTrgs.vertexIndices.value,
                        texturedTrgs.topology
                    );
                    const meshGeometry: GeometryProps = {
                        topology: meshTopology(texturedTrgs.topology),
                        attributes: {
                            positions: {
                                value: toTypedArray(
                                    texturedTrgs.vertices,
                                    Float32Array
                                ),
                                size: 3,
                            },
                        },
                        vertexCount: indices.length,
                        indices: {
                            value: toTypedArray(indices, Uint32Array),
                            size: 1,
                        },
                    };
                    meshModel = new Model(device, {
                        id: `${this.props.id}-mesh-line-${i}`,
                        ...super.getShaders({
                            vs: vsLineShader,
                            fs: fsLineShader,
                            modules: [project32, picking, triangleMeshUniforms],
                        }),
                        bufferLayout:
                            this.getAttributeManager()!.getBufferLayouts(),
                        geometry: new Geometry(meshGeometry),

                        isInstanced: false, // This only works when set to false.});
                    });
                }
                return { model, meshModel };
            }) ?? [];

        // Await all promises and push to models/meshModels arrays
        const triangleResults = await Promise.all(triangleModelPromises);
        triangleResults.forEach(({ model, meshModel }) => {
            models.push(model);
            if (meshModel) {
                meshModels.push(meshModel);
            }
        });

        this.props.triangleMeshes?.forEach((mesh, i) => {
            const meshGeometry: GeometryProps = {
                topology: mesh.topology,
                attributes: {
                    positions: {
                        value: toTypedArray(
                            mesh.vertices ??
                                this.props.texturedTriangles[i]?.vertices,
                            Float32Array
                        ),
                        size: 3,
                    },
                },
                vertexCount: mesh.vertexIndices.size,
                indices: {
                    value: toTypedArray(mesh.vertexIndices.value, Uint32Array),
                    size: 1,
                },
            };
            meshModels.push(
                new Model(device, {
                    id: `${this.props.id}-mesh-line-${i}`,
                    ...super.getShaders({
                        vs: vsLineShader,
                        fs: fsLineShader,
                        modules: [project32, picking, triangleMeshUniforms],
                    }),
                    bufferLayout:
                        this.getAttributeManager()!.getBufferLayouts(),
                    geometry: new Geometry(meshGeometry),

                    isInstanced: false, // This only works when set to false.});
                })
            );
        });

        return [models, meshModels];
    }

    getModels(): Model[] {
        const triangleModels = (this.state["triangleModels"] ?? []) as Model[];
        const meshModels = (this.state["meshModels"] ?? []) as Model[];
        return [...triangleModels, ...meshModels];
    }

    private _getClampColors(
        color: Color | [Color, Color] | undefined
    ): [Color | undefined, Color | undefined] {
        if (isTypedArray(color)) {
            // If clampColor is a Uint8Array, return it directly
            if (color.length >= 8) {
                return [
                    toNormalizedColor(color.slice(0, 4)),
                    toNormalizedColor(color.slice(4, 8)),
                ];
            } else if (color.length === 6) {
                return [
                    toNormalizedColor(color.slice(0, 3)),
                    toNormalizedColor(color.slice(3, 6)),
                ];
            }
            const col = toNormalizedColor(color);
            return [col, col];
        }
        if (Array.isArray(color) && color.length === 2) {
            return [toNormalizedColor(color[0]), toNormalizedColor(color[1])];
        }
        const col = color ? toNormalizedColor(color) : undefined;
        return [col, col];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw(args: any): void {
        if (!this.state["triangleModels"] && !this.state["meshModels"]) {
            return;
        }

        const triangleModels = this.state["triangleModels"] as Model[];
        const meshModels = this.state["meshModels"] as Model[];

        const { gl } = args.context;

        if (!this.props.depthTest) {
            gl.disable(GL.DEPTH_TEST);
        }
        gl.enable(GL.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);

        //
        const [lowClampColors, highClampColor] = this._getClampColors(
            this.props.colormapSetup?.clampColor ??
                (defaultColormapSetup.clampColor as Color)
        );

        // render all the triangle surfaces
        triangleModels?.forEach((model) => {
            model.shaderInputs.setProps({
                ...args.uniforms,
                triangles: {
                    colormapRange:
                        this.props.colormapSetup?.valueRange ??
                        defaultColormapSetup.valueRange,
                    clampRange:
                        this.props.colormapSetup?.clampRange ??
                        this.props.colormapSetup?.valueRange ??
                        defaultColormapSetup.valueRange,
                    useClampColors:
                        this.props.colormapSetup?.clampColor !== undefined,
                    lowClampColor: lowClampColors,
                    highClampColor: highClampColor,
                    undefinedValue:
                        this.props.colormapSetup?.undefinedValue ??
                        defaultColormapSetup.undefinedValue,
                    undefinedColor: toNormalizedColor(
                        this.props.colormapSetup?.undefinedColor ??
                            defaultColormapSetup.undefinedColor
                    ),
                    // Normalize color to [0,1] range.
                    uColor: toNormalizedColor(
                        this.props.color ?? defaultProps.color
                    ),
                    smoothShading:
                        this.props.smoothShading ?? defaultProps.smoothShading,
                    ZIncreasingDownwards:
                        this.props.ZIncreasingDownwards ??
                        defaultProps.ZIncreasingDownwards,
                },
            });

            model.draw(args.context.renderPass);
        });

        gl.disable(GL.POLYGON_OFFSET_FILL);

        // render all the triangle meshes
        if (this.props.showMesh) {
            meshModels?.forEach((meshModel) => {
                meshModel.shaderInputs.setProps({
                    ...args.uniforms,
                    triangleMesh: {
                        ZIncreasingDownwards:
                            this.props.ZIncreasingDownwards ??
                            defaultProps.ZIncreasingDownwards,
                    },
                });

                meshModel.draw(args.context.renderPass);
            });
        }

        if (!this.props.depthTest) {
            gl.enable(GL.DEPTH_TEST);
        }
    }

    decodePickingColor(): number {
        return 0;
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];
        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);
            layer_properties.push(createPropertyData("Depth", depth));
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

GpglTextureLayer.layerName = "GpglTextureLayer";
GpglTextureLayer.defaultProps = defaultProps;

const triangleMeshUniformsBlock = `\
uniform triangleMeshUniforms {
    bool ZIncreasingDownwards;
} triangleMesh;
`;

type TriangleMeshUniformsType = { ZIncreasingDownwards: boolean };

// NOTE: this must exactly the same name than in the uniform block
const triangleMeshUniforms = {
    name: "triangleMesh",
    vs: triangleMeshUniformsBlock,
    fs: undefined,
    uniformTypes: {
        ZIncreasingDownwards: "f32",
    },
} as const satisfies ShaderModule<LayerProps, TriangleMeshUniformsType>;

const triangleUniformsBlock = /*glsl*/ `\
uniform trianglesUniforms {
    vec4 uColor;
    bool smoothShading;
    bool ZIncreasingDownwards;
} triangles;
`;

type TriangleUniformsType = {
    uColor: RGBAColor;
    smoothShading: boolean;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name than in the uniform block
const trianglesUniforms = {
    name: "triangles",
    vs: triangleUniformsBlock,
    fs: triangleUniformsBlock,
    uniformTypes: {
        uColor: "vec4<f32>",
        smoothShading: "u32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, TriangleUniformsType>;

const texTriangleUniformsBlock = /*glsl*/ `\
uniform trianglesUniforms {
    vec2 colormapRange;
    vec2 clampRange;
    bool useClampColors;
    vec4 lowClampColor;
    vec4 highClampColor;
    float undefinedValue;
    vec4 undefinedColor;
    bool smoothShading;
    bool ZIncreasingDownwards;
} triangles;
`;

type TexTriangleUniformsType = {
    colormapRange: [number, number];
    clampRange: [number, number];
    useClampColors: boolean;
    lowClampColor: RGBAColor;
    highClampColor: RGBAColor;
    undefinedValue: number;
    undefinedColor: RGBAColor;
    smoothShading: boolean;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name than in the uniform block
const texTrianglesUniforms = {
    name: "triangles",
    vs: texTriangleUniformsBlock,
    fs: texTriangleUniformsBlock,
    uniformTypes: {
        colormapRange: "vec2<f32>",
        clampRange: "vec2<f32>",
        useClampColors: "u32",
        lowClampColor: "vec4<f32>",
        highClampColor: "vec4<f32>",
        undefinedValue: "f32",
        undefinedColor: "vec4<f32>",
        smoothShading: "u32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, TexTriangleUniformsType>;

// Helper functions
function meshTopology(
    topology: TexturedTriangleProps["topology"]
): "line-list" | "line-strip" {
    switch (topology) {
        case "triangle-list":
            return "line-list";
        case "triangle-strip":
            return "line-strip";
        default:
            throw new Error(`Unknown topology: ${topology}`);
    }
}

function computeMeshIndices(
    trglIndices: TypedIntArray | number[],
    topology: TexturedTriangleProps["topology"]
): TypedIntArray | number[] {
    if (topology === "triangle-list") {
        // non optimal, and some edges might be missing
        // non trivial to fix that :/
        return trglIndices;
    }
    if (trglIndices.length === 4) {
        // special case for a rectangle
        return [
            trglIndices[2],
            trglIndices[0],
            trglIndices[1],
            trglIndices[2],
            trglIndices[3],
            trglIndices[1],
        ];
    }
    // triangle strip.
    // missing edges must be added
    if (Array.isArray(trglIndices) && typeof trglIndices[0] === "number") {
        const indices1 = trglIndices
            .filter((_v, index) => index !== 0 && index % 2 === 0)
            .reverse();
        const indices2 = trglIndices.filter(
            (_v, index) => index !== trglIndices.length - 1 && index % 2 === 1
        );

        return indices1.concat(trglIndices, indices2);
    } else {
        const idxArray = trglIndices as TypedIntArray;
        const indices1 = idxArray
            .filter((_v, index) => index !== 0 && index % 2 === 0)
            .reverse();
        const indices2 = idxArray.filter(
            (_v, index) => index !== trglIndices.length - 1 && index % 2 === 1
        );

        const mergedIndices = new Uint32Array(
            idxArray.length + indices1.length + indices2.length
        );

        mergedIndices.set(indices1, 0);
        mergedIndices.set(idxArray, indices1.length);
        mergedIndices.set(indices2, indices1.length + idxArray.length);
        return mergedIndices;
    }
}
