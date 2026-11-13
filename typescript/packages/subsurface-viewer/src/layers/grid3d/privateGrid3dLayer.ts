import type {
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

import { decodeIndexFromRGB, utilities } from "../shader_modules";
import { phongMaterial } from "../shader_modules/phong-lighting/phong-material";
import { precisionForTests } from "../shader_modules/test-precision/precisionForTests";
import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/deckglTools";
import { createPropertyData, initPropertyData } from "../utils/deckglTools";
import {
    type ColormapFunctionType,
    createColormapTexture,
} from "../utils/colormapTools";

import type { Color, RGBAColor, RGBColor } from "../../utils/Color";
import { toNormalizedRGBAColor } from "../../utils/Color";

import linearFragmentShader from "./nodeProperty.fs.glsl";
import linearVertexShader from "./nodeProperty.vs.glsl";
import flatFragmentShader from "./cellProperty.fs.glsl";
import flatVertexShader from "./cellProperty.vs.glsl";
import fsLineShader from "./line.fs.glsl";
import vsLineShader from "./line.vs.glsl";

import { isDiscreteProperty, isGeometricProperty } from "./grid3dLayer";

import type {
    IGrid3DDiscretePropertyValueName,
    MeshType,
    MeshTypeLines,
} from "./typeDefs";
import { TGrid3DColoringMode } from "./typeDefs";

export interface PrivateLayerProps extends ExtendedLayerProps {
    mesh: MeshType;
    meshLines: MeshTypeLines;
    colormapName: string;
    colormapRange: [number, number];
    colormapClampColor: Color | undefined | boolean;
    colormapFunction?: ColormapFunctionType;
    undefinedPropertyValue: number;
    undefinedPropertyColor?: Color;
    coloringMode: TGrid3DColoringMode;
    gridLines: boolean;
    propertyValueRange: [number, number];
    discretePropertyValueNames?: IGrid3DDiscretePropertyValueName[];
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
    enableLighting: boolean;
}

const defaultProps = {
    colormapName: "",
    colormapClampColor: [0, 255, 0, 200] as RGBAColor,
    undefinedPropertyColor: [255, 0, 0, 200] as RGBAColor, // red color for undefined property values
    coloringMode: TGrid3DColoringMode.Property,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
    enableLighting: true,
};

interface IColormapTextureHints {
    discreteData: boolean;
    colormapSize: number;
}

// This is a private layer used only by the composite Grid3DLayer
export class PrivateGrid3DLayer extends Layer<PrivateLayerProps> {
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
            this.props.colormapFunction ?? {
                colormapName: this.props.colormapName,
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
                    precisionForTests,
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
                modules: [
                    project32,
                    picking,
                    gridLinesUniforms,
                    precisionForTests,
                    // not used by this model, but added to fix warnings while picking
                    lighting,
                ],
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

    encodePickingColor(): RGBColor {
        return this.nullPickingColor() as RGBColor;
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = initPropertyData(
            info.coordinate?.[2],
            this.props.ZIncreasingDownwards,
            this.props.modelMatrix
        );

        // Note these colors are in the 0-255 range.
        const [r, g, b] = info.color;
        const vertexIndex = decodeIndexFromRGB([r, g, b]);

        const properties = this.props.mesh.attributes.properties?.value;
        const propertyValue = properties?.[vertexIndex];
        if (propertyValue != undefined) {
            const propertyText = this.getPropertyText(propertyValue);
            if (propertyText) {
                layer_properties.push(
                    createPropertyData("Property", propertyText.text)
                );
                layer_properties.push(
                    createPropertyData("Value", propertyText.value)
                );
            } else {
                layer_properties.push(
                    createPropertyData("Property", propertyValue)
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
        if (
            !this.props.discretePropertyValueNames ||
            index < 0 ||
            index >= this.props.discretePropertyValueNames.length
        ) {
            return undefined;
        }
        if (Number.isNaN(index)) {
            return {
                text: "NaN",
                value: Number.NaN,
            };
        }

        const valueName = this.props.discretePropertyValueNames[index];
        return {
            text: valueName.name,
            value: valueName.value,
        };
    }

    private getUndefinedValue(): number {
        if (
            Number.isNaN(this.props.undefinedPropertyValue) ||
            !this.props.discretePropertyValueNames
        ) {
            return Number.NaN;
        }
        const index = this.props.discretePropertyValueNames.findIndex(
            (v) => v.value === this.props.undefinedPropertyValue
        );
        return index < 0 ? Number.NaN : index;
    }

    private getColoringHints(): IColormapTextureHints {
        if (this.props.colormapFunction instanceof Uint8Array) {
            return {
                discreteData: true,
                colormapSize: Math.max(
                    this.props.colormapFunction.length / 3,
                    1
                ),
            };
        }
        if (isDiscreteProperty(this.props.coloringMode)) {
            // It is expected that the property values are integers ranging from 0 to N.
            // Thus this.props.propertyValueRange?.[0] should be 0
            // and this.props.propertyValueRange?.[1] should be N
            const maxPropertyValue = Number.isFinite(
                this.props.propertyValueRange[1]
            )
                ? Math.round(this.props.propertyValueRange[1] + 1)
                : 0;
            const namedPropertyCount =
                this.props.discretePropertyValueNames?.length ?? 0;
            return {
                discreteData: true,
                colormapSize: Math.max(maxPropertyValue, namedPropertyCount),
            };
        }
        return {
            discreteData: false,
            colormapSize: 256,
        };
    }

    private getUniforms(): GridUniformsType {
        const valueRange: [number, number] = this.props.propertyValueRange ?? [
            0, 1,
        ];

        // If specified color map will extend within colormapRange.
        // Otherwise it will extend within valueRange.
        const colormapRange = this.props.colormapRange ?? valueRange;

        const isColormapClampColorTransparent: boolean =
            (this.props.colormapClampColor as boolean) === false;
        const hasClampColor: boolean =
            this.props.colormapClampColor !== undefined &&
            this.props.colormapClampColor !== true &&
            this.props.colormapClampColor !== false;

        // Normalize to [0,1] range.
        const colormapClampColor: RGBAColor = hasClampColor
            ? toNormalizedRGBAColor(this.props.colormapClampColor as Color)
            : [0, 0, 0, 1];
        if (isColormapClampColorTransparent) {
            colormapClampColor[3] = 0;
        }

        const useClampColor = hasClampColor || isColormapClampColorTransparent;

        const undefinedColor = toNormalizedRGBAColor(
            this.props.undefinedPropertyColor ??
                defaultProps.undefinedPropertyColor
        );

        const coloringHints = this.getColoringHints();

        return {
            coloringMode: this.props.coloringMode,
            isColoringDiscrete: coloringHints.discreteData,
            colormapSize: coloringHints.colormapSize,
            valueRange,
            colormapRange,
            colormapClampColor,
            useClampColor,
            undefinedValue: this.getUndefinedValue(),
            undefinedColor,
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
        };
    }
}

PrivateGrid3DLayer.layerName = "PrivateGrid3DLayer";
PrivateGrid3DLayer.defaultProps = defaultProps;

// local shader module for the uniforms
const gridUniformsBlock = /*glsl*/ `\
uniform gridUniforms {
    uint coloringMode;
    bool isColoringDiscrete;
    float colormapSize;

    vec2 valueRange;
    vec2 colormapRange;

    vec4 colormapClampColor;
    bool useClampColor;
    
    float undefinedValue;
    vec4 undefinedColor;

    bool ZIncreasingDownwards;
} grid;
`;

type GridUniformsType = {
    coloringMode: TGrid3DColoringMode;
    isColoringDiscrete: boolean;
    colormapSize: number;
    valueRange: [number, number];
    colormapRange: [number, number];
    colormapClampColor: RGBAColor;
    useClampColor: boolean;
    undefinedValue: number;
    undefinedColor: RGBAColor;
    ZIncreasingDownwards: boolean;
};

const gridUniforms = {
    name: "grid",
    vs: gridUniformsBlock,
    fs: gridUniformsBlock,
    uniformTypes: {
        coloringMode: "u32",
        isColoringDiscrete: "u32",
        colormapSize: "f32",
        valueRange: "vec2<f32>",
        colormapRange: "vec2<f32>",
        colormapClampColor: "vec4<f32>",
        useClampColor: "u32",
        undefinedValue: "f32",
        undefinedColor: "vec4<f32>",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, GridUniformsType>;

// local shader module for the uniforms
const gridLinesUniformsBlock = /*glsl*/ `\
uniform gridUniforms {
    bool ZIncreasingDownwards;
} grid;
`;

type GridLinesUniformsType = {
    ZIncreasingDownwards: boolean;
};

const gridLinesUniforms = {
    name: "grid",
    vs: gridLinesUniformsBlock,
    fs: gridLinesUniformsBlock,
    uniformTypes: {
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, GridLinesUniformsType>;
