import type {
    Color,
    LayerProps,
    PickingInfo,
    UpdateParameters,
    LayerContext,
    Attribute,
} from "@deck.gl/core";
import { Layer, project32, picking } from "@deck.gl/core";
import type { Device, UniformValue } from "@luma.gl/core";

import { Model, Geometry } from "@luma.gl/engine";

import type { ShaderModule } from "@luma.gl/shadertools";
import { lighting } from "@luma.gl/shadertools";

import { decodeIndexFromRGB, utilities } from "../shader_modules";
import { encodeIndexToRGB } from "../shader_modules/utilities";
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
    getColormapDiscreteColors,
} from "../utils/colormapTools";

import { type RGBAColor, toNormalizedRGBAColor } from "../../utils";

import fs from "./map.fs.glsl";
import vs from "./map.vs.glsl";
import fsDiscrete from "./map_discrete.fs.glsl";
import vsDiscrete from "./map_discrete.vs.glsl";
import fsLineShader from "./line.fs.glsl";
import vsLineShader from "./line.vs.glsl";

import {
    type IMapDiscretePropertyValueName,
    TMapColoringMode,
} from "./typeDefs";
import { isDiscreteProperty } from "./mapLayer";

interface IColormapTextureHints {
    discreteData: boolean;
    colormapSize: number;
}

export interface PrivateMapLayerProps extends ExtendedLayerProps {
    positions: Float32Array;
    normals: Float32Array;
    triangleIndices: Uint32Array;
    vertexProperties: Float32Array | Uint16Array;
    vertexIndices: Int32Array;
    lineIndices: Uint32Array;
    contours: [number, number];
    isContoursDepth: boolean;
    colormapName: string;
    colormapRange: [number, number];
    colormapClampColor: Color | undefined | boolean;
    colormapFunction?: ColormapFunctionType;
    undefinedPropertyColor: Color;
    undefinedPropertyValue: number;
    coloringMode: TMapColoringMode;
    gridLines: boolean;
    propertyValueRange: [number, number];
    discretePropertyValueNames?: IMapDiscretePropertyValueName[];
    smoothShading: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
    enableLighting: boolean;
}

const defaultProps = {
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    colormapName: "",
    colormapClampColor: [0, 255, 0, 200], // green color for clamped values
    coloringMode: TMapColoringMode.Property,
    undefinedPropertyColor: [255, 0, 0, 200], // red color for undefined property values
    propertyValueRange: [0.0, 1.0],
    meshValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
    enableLighting: true,
};

// This is a private layer used only by the composite MapLayer
export class PrivateMapLayer extends Layer<PrivateMapLayerProps> {
    get isLoaded(): boolean {
        return (this.state["isLoaded"] as boolean) ?? false;
    }

    setShaderModuleProps(
        args: Partial<{
            [x: string]: Partial<Record<string, unknown> | undefined>;
        }>
    ): void {
        if ("lighting" in args) {
            super.setShaderModuleProps({
                ...args,
                lighting: {
                    ...args["lighting"],
                    enabled: this.props.enableLighting,
                },
            });
        }
        super.setShaderModuleProps(args);
    }

    calculatePickingColors(attribute: Attribute) {
        const n = this.props.positions.length / 3;
        const arr = new Uint8Array(n * 3);

        for (let i = 0; i < arr.length / 3; i++) {
            const pickingColor = encodeIndexToRGB(i);
            arr[i * 3 + 0] = pickingColor[0];
            arr[i * 3 + 1] = pickingColor[1];
            arr[i * 3 + 2] = pickingColor[2];
        }
        attribute.value = arr;
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
                ? Math.round(this.props.propertyValueRange[1]) + 1
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

    initializeState(context: DeckGLLayerContext): void {
        const gl = context.device;
        const [mesh_model, mesh_lines_model] = this._getModels(gl);
        this.setState({
            models: [mesh_model, mesh_lines_model],
            isLoaded: false,
        });

        this.getAttributeManager()!.remove(["instancePickingColors"]);

        this.getAttributeManager()!.add({
            pickingColors: {
                size: 3,
                type: "uint8",
                update: this.calculatePickingColors,
            },
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

    updateState({ context }: UpdateParameters<this>): void {
        this.initializeState(context as DeckGLLayerContext);
    }

    getContinuousPropModel() {
        const colormap = createColormapTexture(
            this.props.colormapFunction ?? {
                colormapName: this.props.colormapName,
                colorTables: (this.context as DeckGLLayerContext).userData
                    .colorTables,
            },
            this.context as DeckGLLayerContext,
            this.getColoringHints()
        );

        // MESH MODEL
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const valueRange = this.props.propertyValueRange ?? [0.0, 1.0];

        // If specified color map will extend from colormapRangeMin to colormapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colormapRange = this.props.colormapRange ?? valueRange;

        const isClampColorDefined: boolean =
            this.props.colormapClampColor !== undefined &&
            this.props.colormapClampColor !== true &&
            this.props.colormapClampColor !== false;
        const useClampColor =
            isClampColorDefined || this.props.colormapClampColor === false;

        const colormapClampColor = isClampColorDefined
            ? toNormalizedRGBAColor(this.props.colormapClampColor as Color)
            : [0, 0, 0, 0];

        const smoothShading =
            this.props.normals.length == 0 ? false : this.props.smoothShading;

        const model = new Model(this.context.device, {
            id: `${this.props.id}-mesh`,
            ...super.getShaders({
                vs,
                fs,
                modules: [
                    project32,
                    picking,
                    utilities,
                    lighting,
                    phongMaterial,
                    mapUniforms,
                    precisionForTests,
                ],
            }),
            geometry: new Geometry({
                topology: "triangle-list",
                attributes: {
                    positions: { value: this.props.positions, size: 3 },
                    // Only add normals if they are defined.
                    ...(this.props.normals.length > 0 && {
                        normals: { value: this.props.normals, size: 3 },
                    }),
                    properties: { value: this.props.vertexProperties, size: 1 },
                },
                indices: { value: this.props.triangleIndices, size: 1 },
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            bindings: {
                colormap: colormap,
            },
            isInstanced: false,
        });

        model.shaderInputs.setProps({
            map: {
                isContoursDepth,
                contourReferencePoint,
                contourInterval,
                valueRange,
                colormapRange,
                colormapClampColor,
                useClampColor,
                undefinedValue: this.props.undefinedPropertyValue,
                undefinedColor: toNormalizedRGBAColor(
                    this.props.undefinedPropertyColor ??
                        defaultProps.undefinedPropertyColor
                ),
                smoothShading,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });

        return model;
    }

    getDiscretePropModel() {
        const hints = this.getColoringHints();
        const colors = getColormapDiscreteColors(
            this.props.colormapFunction ?? {
                colormapName: this.props.colormapName,
                colorTables: (this.context as DeckGLLayerContext).userData
                    .colorTables,
            },
            hints
        );
        const colormap = createColormapTexture(
            colors,
            this.context as DeckGLLayerContext,
            this.getColoringHints()
        );

        // MESH MODEL
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const valueRange = this.props.propertyValueRange ?? [0.0, 1.0];

        // If specified color map will extend from colormapRangeMin to colormapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colormapRange = this.props.colormapRange ?? valueRange;

        const isClampColorDefined: boolean =
            this.props.colormapClampColor !== undefined &&
            this.props.colormapClampColor !== true &&
            this.props.colormapClampColor !== false;
        const useClampColor =
            isClampColorDefined || this.props.colormapClampColor === false;

        const colormapClampColor = isClampColorDefined
            ? toNormalizedRGBAColor(this.props.colormapClampColor as Color)
            : [0, 0, 0, 0];

        const smoothShading =
            this.props.normals.length == 0 ? false : this.props.smoothShading;

        const model = new Model(this.context.device, {
            id: `${this.props.id}-mesh`,
            ...super.getShaders({
                vs: vsDiscrete,
                fs: fsDiscrete,
                modules: [
                    project32,
                    picking,
                    utilities,
                    lighting,
                    phongMaterial,
                    mapDiscreteUniforms,
                    precisionForTests,
                ],
            }),

            geometry: new Geometry({
                topology: "triangle-list",
                attributes: {
                    positions: { value: this.props.positions, size: 3 },
                    // Only add normals if they are defined.
                    ...(this.props.normals.length ===
                        this.props.positions.length && {
                        normals: { value: this.props.normals, size: 3 },
                    }),
                    properties: {
                        value: this.props.vertexProperties,
                        size: 1,
                        normalized: false,
                    },
                },
                indices: { value: this.props.triangleIndices, size: 1 },
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            bindings: {
                colormap: colormap,
            },
            isInstanced: false,
        });

        model.shaderInputs.setProps({
            map: {
                isContoursDepth,
                contourReferencePoint,
                contourInterval,
                valueRange,
                colormapRange,
                colormapClampColor,
                useClampColor,
                undefinedValue: this.props.undefinedPropertyValue,
                undefinedColor: toNormalizedRGBAColor(
                    this.props.undefinedPropertyColor ??
                        defaultProps.undefinedPropertyColor
                ),
                smoothShading,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });

        return model;
    }

    getLinesModel(device: Device) {
        const model = new Model(device, {
            id: `${this.props.id}-lines`,
            ...super.getShaders({
                vs: vsLineShader,
                fs: fsLineShader,
                modules: [
                    project32,
                    picking,
                    mapLinesUniforms,
                    precisionForTests,
                    // not used by this model
                    lighting,
                ],
            }),
            geometry: new Geometry({
                topology: "line-list",
                attributes: {
                    positions: { value: this.props.positions, size: 3 },
                },
                indices: { value: this.props.lineIndices, size: 1 },
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            isInstanced: false,
        });

        model.shaderInputs.setProps({
            map: {
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });

        return model;
    }

    _getModels(device: Device) {
        const mesh_model = isDiscreteProperty(this.props.coloringMode)
            ? this.getDiscretePropModel()
            : this.getContinuousPropModel();

        const mesh_lines_model = this.getLinesModel(device);

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

        const [mesh_model, mesh_lines_model] = this.state["models"] as Model[];

        gl.enable(gl.POLYGON_OFFSET_FILL);
        if (!this.props.depthTest) {
            gl.disable(gl.DEPTH_TEST);
        }

        gl.polygonOffset(1, 1);
        mesh_model.draw(context.renderPass);
        gl.disable(gl.POLYGON_OFFSET_FILL);

        if (!this.props.depthTest) {
            gl.enable(gl.DEPTH_TEST);
        }

        if (this.props.gridLines) {
            mesh_lines_model.draw(context.renderPass);
        }

        if (!this.state["isLoaded"]) {
            this.setState({ ...this.state, isLoaded: true });
        }
    }

    // Maps all colors to index 0 as this layer does not use multiple indexes.
    decodePickingColor(/*color: Uint8Array*/): number {
        return 0;
    }

    // Disable picking by setting all picking colors to null color.
    // Used in multipicking to prevent recurring picks of the same layer.
    _disablePickingIndex(/*objectIndex: number*/) {
        const { pickingColors, instancePickingColors } =
            this.getAttributeManager()!.attributes;
        const colors = pickingColors || instancePickingColors;
        if (!colors) {
            return;
        }

        const pickingColor = this.nullPickingColor();

        const n = this.props.positions.length / 3;
        const arr = new Uint8Array(n * 3);

        for (let i = 0; i < arr.length / 3; i++) {
            arr[i * 3 + 0] = pickingColor[0];
            arr[i * 3 + 1] = pickingColor[1];
            arr[i * 3 + 2] = pickingColor[2];
        }

        colors.buffer.write(arr, 0);
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

        if (isDiscreteProperty(this.props.coloringMode)) {
            const [r, g, b] = info.color;
            const propertyValue = decodeIndexFromRGB([r, g, b]);
            if (propertyValue != undefined && Number.isFinite(propertyValue)) {
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

        // Note these colors are in the  0-255 range.
        const [r, g, b] = info.color;
        const vertexIndex = decodeIndexFromRGB([r, g, b]);

        const properties = this.props.vertexProperties;
        const property = properties[vertexIndex];

        layer_properties.push(createPropertyData("Property", property));
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
}

PrivateMapLayer.layerName = "privateMapLayer";
PrivateMapLayer.defaultProps = defaultProps;

// local shader module for the uniforms
const mapUniformsBlock = /*glsl*/ `\
uniform mapUniforms {
    bool isContoursDepth;
    float contourReferencePoint;
    float contourInterval;

    vec2 valueRange;
    vec2 colormapRange;

    vec4 colormapClampColor;
    bool useClampColor;

    float undefinedValue;
    vec4 undefinedColor;

    bool smoothShading;
    bool ZIncreasingDownwards;
} map;
`;

type MapUniformsType = {
    isContoursDepth: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    valueRange: [number, number];
    colormapRange: [number, number];
    colormapClampColor: RGBAColor;
    useClampColor: boolean;
    undefinedValue: number;
    undefinedColor: RGBAColor;
    smoothShading: boolean;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name as in the uniform block
const mapUniforms = {
    name: "map",
    vs: mapUniformsBlock,
    fs: mapUniformsBlock,
    uniformTypes: {
        isContoursDepth: "u32",
        contourReferencePoint: "f32",
        contourInterval: "f32",
        valueRange: "vec2<f32>",
        colormapRange: "vec2<f32>",
        colormapClampColor: "vec4<f32>",
        useClampColor: "u32",
        undefinedValue: "f32",
        undefinedColor: "vec4<f32>",
        smoothShading: "u32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, MapUniformsType>;

// Discrete uniforms
const mapDiscreteUniformsBlock = /*glsl*/ `\
uniform mapUniforms {
    bool isContoursDepth;
    float contourReferencePoint;
    float contourInterval;

    vec2 valueRange;
    vec2 colormapRange;

    vec4 colormapClampColor;
    bool useClampColor;

    uint undefinedValue;
    vec4 undefinedColor;

    bool smoothShading;
    bool ZIncreasingDownwards;
} map;
`;

type MapDiscreteUniformsType = {
    isContoursDepth: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    valueRange: [number, number];
    colormapRange: [number, number];
    colormapClampColor: RGBAColor;
    useClampColor: boolean;
    undefinedValue: number;
    undefinedColor: RGBAColor;
    smoothShading: boolean;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name as in the uniform block
const mapDiscreteUniforms = {
    // Module name
    name: "map",
    vs: mapDiscreteUniformsBlock,
    fs: mapDiscreteUniformsBlock,
    uniformTypes: {
        isContoursDepth: "u32",
        contourReferencePoint: "f32",
        contourInterval: "f32",
        valueRange: "vec2<u32>",
        colormapRange: "vec2<f32>",
        colormapClampColor: "vec4<f32>",
        useClampColor: "u32",
        undefinedValue: "u32",
        undefinedColor: "vec4<f32>",
        smoothShading: "u32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, MapDiscreteUniformsType>;

// Lines uniforms
const mapLinesUniformsBlock = /*glsl*/ `\
uniform mapUniforms {
    bool ZIncreasingDownwards;
} map;
`;

type MapLinesUniformsType = {
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name as in the uniform block
const mapLinesUniforms = {
    // Module name
    name: "map",
    vs: mapLinesUniformsBlock,
    fs: mapLinesUniformsBlock,
    uniformTypes: {
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, MapLinesUniformsType>;
