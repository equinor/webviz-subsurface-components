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
import { precisionForTests } from "../shader_modules/test-precision/precisionForTests";

import type { Material } from "../gpglLayers/typeDefs";

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

import type { ValueArray2D } from "./typeDefs";

import fsShader from "./triangle.fs.glsl";
import vsShader from "./triangle.vs.glsl";
import fsTexShader from "./texTriangle.fs.glsl";
import vsTexShader from "./texTriangle.vs.glsl";
import fsLineShader from "./triangleLine.fs.glsl";
import vsLineShader from "./triangleLine.vs.glsl";

/**
 * Props for defining a triangle surfaces with optional value mapping and texture coordinates.
 * If a value map, ie. a 2D array of values, is provided, it will be used to generate a 2D texture
 * of values which will be mapped on the surface and converted to colors using the colormap
 *
 * @property topology The type of triangle topology to use: either `triangle-list` or `triangle-strip`.
 * @property vertices The array of vertex positions, as either a typed float array or a number array.
 * @property normals (Optional) The array of vertex normals, as either a typed float array or a number array.
 * @property texCoords (Optional) The array of texture coordinates, as either a typed float array or a number array.
 * @property valueMap (Optional) A 2D array of values used to generate a value texture.
 * @property vertexIndices An object containing the indices of vertices and the size of each index group.
 * @property vertexIndices.value The array of vertex indices, as either a typed int array or a number array.
 * @property vertexIndices.size The number of indices per group (e.g., 3 for triangles).
 */
export type ValueMappedTriangleProps = {
    topology: "triangle-list" | "triangle-strip";
    vertices: TypedFloatArray | number[];
    normals?: TypedFloatArray | number[];
    texCoords?: TypedFloatArray | number[];
    valueMap?: ValueArray2D;
    vertexIndices: { value: TypedIntArray | number[]; size: number };
};

/**
 * Props for defining a triangle mesh geometry.
 *
 * @property topology Specifies the type of mesh topology. Can be either `line-list` or `line-strip`.
 * @property vertices Optional array of vertex positions. Accepts either a typed float array or a regular number array.
 *                      If not provided, the vertices of the ValueMappedTriangleProps will be used.
 * @property vertexIndices Object containing the indices for the vertices and the size of each index group.
 * @property vertexIndices.value The indices referencing vertices, as a typed integer array or a number array.
 * @property vertexIndices.size The number of indices per primitive (e.g., 1 for vertex indices).
 */
export type TriangleMeshProps = {
    topology: "line-list" | "line-strip";
    vertices?: TypedFloatArray | number[];
    vertexIndices: { value: TypedIntArray | number[]; size: number };
};

/**
 * Props for the GpglValueMappedSurfaceLayer component, which renders surfaces with value-mapped textures.
 *
 * @remarks
 * This interface extends `ExtendedLayerProps` and provides configuration for rendering surfaces
 * with value-mapped textures, optional triangle meshes, and various rendering options such as
 * shading, lighting, and depth testing.
 */
export interface GpglValueMappedSurfaceLayerProps extends ExtendedLayerProps {
    /** Surfaces with a value map used as texture. */
    valueMappedTriangles: ValueMappedTriangleProps[];
    /** Optional triangle meshes. Inferred from `valueMappedTriangles` if not specified. */
    triangleMeshes: TriangleMeshProps[];
    /** Whether to display the mesh overlay. */
    showMesh: boolean;

    /** Definition of the colormap to use for mapping values to colors. */
    colormap?: ColormapProps;
    /** Setup of the colormap. */
    colormapSetup?: ColormapSetup;
    /** Plain color if no value map is provided. */
    color: RGBColor;
    /**  Surface material properties.
     * material: true  = default material, coloring depends on surface orientation and lighting.
     *           false = no material,  coloring is independent on surface orientation and lighting.
     *           or full spec:
     *      material: {
     *           ambient: 0.35,
     *           diffuse: 0.9,
     *           shininess: 32,
     *           specularColor: [38, 38, 38],
     *       }
     * Default value: true.
     */
    material: Material;
    /** Enables smooth shading for the surface.
     * If true, the per-vertex normals will be interpolated across triangles and used for shading.
     * Otherwise, a constant normal will be computed and used across each triangle.
     */
    smoothShading: boolean;

    /** Enables depth testing for rendering. */
    depthTest: boolean;
    /** Indicates if the Z axis increases downwards. */
    ZIncreasingDownwards: boolean;
}

const defaultMaterial: Material = {
    ambient: 0.35,
    diffuse: 0.9,
    shininess: 32,
    specularColor: [38, 38, 38],
};

const defaultColormapSetup: ColormapSetup = {
    valueRange: [0, 1],
    clampRange: undefined,
    clampColor: [0, 255, 0, 200], // green color for clamped values
    undefinedValue: Number.NaN,
    undefinedColor: [255, 0, 0, 200], // red color for undefined values
    smooth: true,
};

const defaultProps: DefaultProps<GpglValueMappedSurfaceLayerProps> = {
    "@@type": "GpglValueMappedSurfaceLayer",
    name: "Value Mapped Surface Layer",
    id: "value-mapped-surface",
    data: ["dummy"],
    showMesh: false,
    colormap: {
        colormapName: "seismic",
    },
    colormapSetup: defaultColormapSetup,
    color: [100, 100, 255],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    material: true, // default material
    smoothShading: false,
    depthTest: true,
    ZIncreasingDownwards: true,
    // deck.gl default props
    visible: true,
    pickable: true,
};

/**
 * GpglValueMappedSurfaceLayer is a layer handling surfaces textured by a value map.
 * These values are converted to color using a colormap and associated setup.
 *
 * A primary use case is to display seismic data.
 * The surfaces are expected to be small compared to the ones handled by the triangles layer.
 */
export class GpglValueMappedSurfaceLayer extends Layer<GpglValueMappedSurfaceLayerProps> {
    setShaderModuleProps(
        args: Partial<{
            [x: string]: Partial<Record<string, unknown> | undefined>;
        }>
    ): void {
        // If material is a boolean, convert it to the default material
        // We need to set a different default material than in the shader module
        if (
            typeof args["phongMaterial"] === "boolean" &&
            args["phongMaterial"] === true
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (args as any)["phongMaterial"] = defaultMaterial;
        }
        super.setShaderModuleProps({
            ...args,
            lighting: {
                ...args["lighting"],
                enabled: this.props.material !== false,
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

    updateState(
        params: UpdateParameters<Layer<GpglValueMappedSurfaceLayerProps>>
    ): void {
        const rebuild =
            params.props.valueMappedTriangles !==
                params.oldProps.valueMappedTriangles ||
            params.props.triangleMeshes !== params.oldProps.triangleMeshes ||
            params.props.showMesh !== params.oldProps.showMesh ||
            params.props.colormap !== params.oldProps.colormap;
        super.updateState(params);
        if (rebuild) {
            this.initializeState(params.context as DeckGLLayerContext);
        }
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
        valueMap: ValueArray2D | undefined
    ): Promise<Texture | undefined> {
        if (valueMap?.values === undefined) {
            return undefined;
        }

        // fetch data
        const propertiesData = await loadDataArray(
            valueMap.values,
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
            width: valueMap.width,
            height: valueMap.height,
            format: "r32float",
        };
        return device.createTexture({
            ...textureProps,
            width: valueMap.width,
            height: valueMap.height,
            data: propertiesData,
        });
    }

    private async _createModels(device: Device): Promise<[Model[], Model[]]> {
        const models: Model[] = [];
        const meshModels: Model[] = [];

        // Collect promises for all valueMappedTriangles
        const triangleModelPromises =
            this.props.valueMappedTriangles?.map(async (texturedTrgs, i) => {
                const trglGeometry: GeometryProps = {
                    topology: texturedTrgs.topology,
                    attributes: {
                        positions: {
                            value: await loadDataArray(
                                texturedTrgs.vertices,
                                Float32Array
                            ),
                            size: 3,
                        },
                        normals: {
                            value: await loadDataArray(
                                texturedTrgs.normals ?? [],
                                Float32Array
                            ),
                            size: 3,
                        },
                        texCoords: {
                            value: await loadDataArray(
                                texturedTrgs.texCoords ?? [],
                                Float32Array
                            ),
                            size: 2,
                        },
                    },
                    vertexCount: texturedTrgs.vertexIndices.size,
                    indices: {
                        value: await loadDataArray(
                            texturedTrgs.vertexIndices.value,
                            Uint32Array
                        ),
                        size: 1,
                    },
                };
                const colormap = texturedTrgs.valueMap
                    ? this._createColormapTexture(device, this.props.colormap)
                    : undefined;
                const floatValues = texturedTrgs.valueMap
                    ? await this._createValuesTexture(
                          device,
                          texturedTrgs.valueMap
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
                            precisionForTests,
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
                            modules: [
                                project32,
                                picking,
                                triangleMeshUniforms,
                                precisionForTests,
                            ],
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
                                this.props.valueMappedTriangles[i]?.vertices,
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
                        modules: [
                            project32,
                            picking,
                            triangleMeshUniforms,
                            precisionForTests,
                        ],
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
                        this.props.colormapSetup?.clampRange === null
                            ? null
                            : (this.props.colormapSetup?.clampRange ??
                              this.props.colormapSetup?.valueRange ??
                              defaultColormapSetup.valueRange),
                    useClampColors:
                        this.props.colormapSetup?.clampColor !== null &&
                        this.props.colormapSetup?.clampRange !== null,
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

GpglValueMappedSurfaceLayer.layerName = "GpglValueMappedSurfaceLayer";
GpglValueMappedSurfaceLayer.defaultProps = defaultProps;

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
    topology: ValueMappedTriangleProps["topology"]
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
    topology: ValueMappedTriangleProps["topology"]
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
