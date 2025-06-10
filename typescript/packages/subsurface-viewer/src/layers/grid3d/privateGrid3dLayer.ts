import type {
    Color,
    PickingInfo,
    UpdateParameters,
    LayerContext,
    LayerProps,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, picking, project32 } from "@deck.gl/core";
import type { UniformValue } from "@luma.gl/core";

import { Geometry, Model } from "@luma.gl/engine";

import type { ShaderModule } from "@luma.gl/shadertools";
import { lighting } from "@luma.gl/shadertools";

import { utilities } from "../shader_modules";
import { phongMaterial } from "../shader_modules/phong-lighting/phong-material";
import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import {
    type ColorMapFunctionType,
    createColormapTexture,
} from "../utils/colormapTools";
import linearFragmentShader from "./nodeProperty.fs.glsl";
import linearVertexShader from "./nodeProperty.vs.glsl";
import flatFragmentShader from "./cellProperty.fs.glsl";
import flatVertexShader from "./cellProperty.vs.glsl";
import fsLineShader from "./line.fs.glsl";
import vsLineShader from "./line.vs.glsl";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
    TGrid3DColoringMode,
    type IDiscretePropertyValueName,
    isDiscreteProperty,
    isGeometricProperty,
} from "./grid3dLayer";

import type { MeshType, MeshTypeLines } from "./typeDefs";

export interface PrivateLayerProps extends ExtendedLayerProps {
    mesh: MeshType;
    meshLines: MeshTypeLines;
    colorMapName: string;
    colorMapRange: [number, number];
    colorMapClampColor: Color | undefined | boolean;
    undefinedPropertyValue: number;
    undefinedPropertyColor: [number, number, number];
    colorMapFunction?: ColorMapFunctionType;
    coloringMode: TGrid3DColoringMode.Property;
    gridLines: boolean;
    propertyValueRange: [number, number];
    discretePropertyValueNames?: IDiscretePropertyValueName[];
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
    enableLighting: boolean;
}

const defaultProps = {
    colorMapName: "",
    colorMapClampColor: [200, 200, 200],
    coloringMode: 0,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
    enableLighting: true,
};

interface IUniforms {
    ZIncreasingDownwards: boolean;
    valueRangeMin: number;
    valueRangeMax: number;
    colorMapRangeMin: number;
    colorMapRangeMax: number;
    colorMapClampColor: number[];
    isClampColor: boolean;
    coloringMode: TGrid3DColoringMode;
    undefinedPropertyColor: [number, number, number];
    isColoringDiscrete: boolean;
    colorMapSize: number;
}

interface IColormapTextureHints {
    discreteData: boolean;
    colormapSize: number;
}

// This is a private layer used only by the composite Grid3DLayer
export default class PrivateLayer extends Layer<PrivateLayerProps> {
    get isLoaded(): boolean {
        return (this.state["isLoaded"] as boolean) ?? false;
    }

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
        const [model_mesh, mesh_lines_model] = this._getModels(context);
        this.setState({
            models: [model_mesh, mesh_lines_model],
            isLoaded: false,
        });
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateParameters<Layer<PrivateLayerProps>>): boolean {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.propsOrDataChanged
        );
    }

    updateState({ context }: UpdateParameters<Layer<PrivateLayerProps>>): void {
        this.initializeState(context as DeckGLLayerContext);
    }

    //eslint-disable-next-line
    _getModels(context: DeckGLLayerContext) {
        const geometricShading = isGeometricProperty(this.props.coloringMode);
        const uniforms = this.getUniforms();
        const colormap = createColormapTexture(
            this.props.colorMapFunction ?? {
                colormapName: this.props.colorMapName,
                colorTables: (this.context as DeckGLLayerContext).userData
                    .colorTables,
            },
            context,
            this.getColoringHints()
        );
        const mesh_model = new Model(context.device, {
            id: `${this.props.id}-mesh`,
            ...super.getShaders({
                vs: geometricShading ? linearVertexShader : flatVertexShader,
                fs: geometricShading
                    ? linearFragmentShader
                    : flatFragmentShader,
                modules: [
                    project32,
                    picking,
                    lighting,
                    phongMaterial,
                    utilities,
                    gridUniforms,
                ],
            }),
            geometry: new Geometry({
                topology: this.props.mesh.drawMode ?? "triangle-list",
                attributes: {
                    positions: this.props.mesh.attributes.positions,
                    normals: this.props.mesh.attributes.normals,
                    ...(geometricShading
                        ? {}
                        : {
                              properties: this.props.mesh.attributes.properties,
                          }),
                },
                vertexCount: this.props.mesh.vertexCount,
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            bindings: {
                colormap,
            },
            isInstanced: false,
        });
        mesh_model.shaderInputs.setProps({
            grid: {
                ...uniforms,
            },
        });

        const mesh_lines_model = new Model(context.device, {
            id: `${this.props.id}-lines`,
            ...super.getShaders({
                vs: vsLineShader,
                fs: fsLineShader,
                modules: [project32, picking, gridUniforms],
            }),
            geometry: new Geometry(this.props.meshLines),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            isInstanced: false,
        });
        mesh_lines_model.shaderInputs.setProps({
            grid: {
                ...uniforms,
            },
        });

        return [mesh_model, mesh_lines_model];
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: UniformValue;
        context: LayerContext;
    }): void {
        if (!this.state["models"]) {
            return;
        }

        const { context } = args;
        const { gl } = context;

        const [model_mesh, mesh_lines_model] = this.state["models"] as Model[];

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);

        if (!this.props.depthTest) {
            gl.disable(gl.DEPTH_TEST);
        }

        model_mesh.draw(context.renderPass);
        gl.disable(gl.POLYGON_OFFSET_FILL);

        if (this.props.gridLines) {
            mesh_lines_model.draw(context.renderPass);
        }

        if (!this.props.depthTest) {
            gl.enable(gl.DEPTH_TEST);
        }

        if (!this.state["isLoaded"]) {
            this.setState({ ...this.state, isLoaded: true });
        }
    }

    decodePickingColor(): number {
        return this.nullPickingColor() as unknown as number;
    }

    encodePickingColor(): [number, number, number] {
        return this.nullPickingColor() as [number, number, number];
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];

        // Note these colors are in the 0-255 range.
        const r = info.color[0];
        const g = info.color[1];
        const b = info.color[2];

        const vertexIndex = 256 * 256 * r + 256 * g + b;

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;

        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);
            layer_properties.push(createPropertyData("Depth", depth));
        }

        const properties = this.props.mesh.attributes.properties?.value;
        const propertyIndex = properties?.[vertexIndex];
        if (propertyIndex != undefined && Number.isFinite(propertyIndex)) {
            const propertyText = this.getPropertyText(propertyIndex);
            if (propertyText) {
                layer_properties.push(
                    createPropertyData("Property", propertyText.text)
                );
                layer_properties.push(
                    createPropertyData("Value", propertyText.value)
                );
            } else {
                layer_properties.push(
                    createPropertyData("Property", propertyIndex)
                );
            }
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }

    private getPropertyText(
        index: number
    ): { text: string | number; value: number } | undefined {
        if (!this.props.discretePropertyValueNames) {
            return undefined;
        }
        if (
            index < 0 ||
            index >= this.props.discretePropertyValueNames.length
        ) {
            return undefined;
        }
        const valueName = this.props.discretePropertyValueNames[index];
        return {
            text: valueName.name,
            value: valueName.value,
        };
    }

    private getColoringHints(): IColormapTextureHints {
        if (this.props.colorMapFunction instanceof Uint8Array) {
            return {
                discreteData: true,
                colormapSize: this.props.colorMapFunction.length / 3,
            };
        }
        if (isDiscreteProperty(this.props.coloringMode)) {
            // It is expected that the property values are integers ranging from 0 to N.
            // Thus this.props.propertyValueRange?.[0] should be 0
            // and this.props.propertyValueRange?.[1] should be N
            return {
                discreteData: true,
                colormapSize: (this.props.propertyValueRange?.[1] ?? 0.0) + 1,
            };
        }
        return {
            discreteData: false,
            colormapSize: 256,
        };
    }

    private getUniforms(): IUniforms {
        const valueRangeMin = this.props.propertyValueRange?.[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange?.[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        const isColorMapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;
        const hasClampColor: boolean =
            this.props.colorMapClampColor !== undefined &&
            this.props.colorMapClampColor !== true &&
            this.props.colorMapClampColor !== false;
        let colorMapClampColor = (
            hasClampColor ? this.props.colorMapClampColor : [0, 0, 0, 255]
        ) as Color;
        if (isColorMapClampColorTransparent) {
            colorMapClampColor = [0, 0, 0, 0];
        }

        if (colorMapClampColor.length === 3) {
            colorMapClampColor = [...colorMapClampColor, 255] as [
                number,
                number,
                number,
                number,
            ];
        }
        const isClampColor = hasClampColor || isColorMapClampColorTransparent;

        // Normalize to [0,1] range.
        const colorMapClampColorUniform = colorMapClampColor.map(
            (x) => (x ?? 0) / 255
        );
        if (isColorMapClampColorTransparent) {
            colorMapClampColor[3] = 0;
        }

        const undefinedPropertyColorUniform =
            this.props.undefinedPropertyColor.map((x) => (x ?? 0) / 255) as [
                number,
                number,
                number,
            ];

        const coloringHints = this.getColoringHints();

        return {
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            valueRangeMin,
            valueRangeMax,
            colorMapRangeMin,
            colorMapRangeMax,
            colorMapClampColor: Array.from(colorMapClampColorUniform),
            isClampColor,
            coloringMode: this.props.coloringMode,
            undefinedPropertyColor: undefinedPropertyColorUniform,
            isColoringDiscrete: coloringHints.discreteData,
            colorMapSize: coloringHints.colormapSize,
        };
    }
}

PrivateLayer.layerName = "PrivateLayer";
PrivateLayer.defaultProps = defaultProps;

// local shader module for the uniforms
const gridUniformsBlock = /*glsl*/ `\
uniform gridUniforms {
    bool ZIncreasingDownwards;
    float valueRangeMin;
    float valueRangeMax;
    float colorMapRangeMin;
    float colorMapRangeMax;
    vec4 colorMapClampColor;
    bool isClampColor;
    float coloringMode;
    vec3 undefinedPropertyColor;
    bool isColoringDiscrete;
    float colorMapSize;
} grid;
`;

type GridUniformsType = {
    ZIncreasingDownwards: boolean;
    valueRangeMin: number;
    valueRangeMax: number;
    colorMapRangeMin: number;
    colorMapRangeMax: number;
    colorMapClampColor: [number, number, number, number];
    isClampColor: boolean;
    coloringMode: TGrid3DColoringMode;
    undefinedPropertyColor: [number, number, number];
    isColoringDiscrete: boolean;
    colorMapSize: number;
};

const gridUniforms = {
    name: "grid",
    vs: gridUniformsBlock,
    fs: gridUniformsBlock,
    uniformTypes: {
        ZIncreasingDownwards: "u32",
        valueRangeMin: "f32",
        valueRangeMax: "f32",
        colorMapRangeMin: "f32",
        colorMapRangeMax: "f32",
        colorMapClampColor: "vec4<f32>",
        isClampColor: "u32",
        coloringMode: "f32",
        undefinedPropertyColor: "vec3<f32>",
        isColoringDiscrete: "u32",
        colorMapSize: "f32",
    },
} as const satisfies ShaderModule<LayerProps, GridUniformsType>;
