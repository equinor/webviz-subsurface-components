import type {
    Color,
    LayerProps,
    PickingInfo,
    UpdateParameters,
    LayerContext,
    Attribute,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, project32, picking } from "@deck.gl/core";
import type { Device, UniformValue } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";
import { lighting } from "@luma.gl/shadertools";
import { Model, Geometry } from "@luma.gl/engine";
import { phongMaterial } from "../shader_modules/phong-lighting/phong-material";
import { precisionForTests } from "../shader_modules/test-precision/precisionForTests";
import { decodeIndexFromRGB, utilities } from "../shader_modules";
import { encodeIndexToRGB } from "../shader_modules/utilities";
import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import {
    type ColormapFunctionType,
    createColormapTexture,
    getColormapDiscreteColors,
} from "../utils/colormapTools";
import type { RGBColor } from "../../utils";
import fs from "./map.fs.glsl";
import vs from "./map.vs.glsl";
import fsDiscrete from "./map_discrete.fs.glsl";
import vsDiscrete from "./map_discrete.vs.glsl";
import fsLineShader from "./line.fs.glsl";
import vsLineShader from "./line.vs.glsl";
import type {
    IDiscretePropertyValueName,
    TTypedIntegerArray,
} from "./mapLayer";

interface IColormapTextureHints {
    discreteData: boolean;
    colormapSize: number;
}

export interface PrivateMapLayerProps extends ExtendedLayerProps {
    positions: Float32Array;
    normals: Float32Array;
    triangleIndices: Uint32Array;
    vertexProperties: Float32Array | TTypedIntegerArray;
    vertexIndices: Int32Array;
    lineIndices: Uint32Array;
    contours: [number, number];
    gridLines: boolean;
    isContoursDepth: boolean;
    colormapName: string;
    colormapRange: [number, number];
    colormapClampColor: Color | undefined | boolean;
    colormapFunction?: ColormapFunctionType;
    undefinedPropertyColor: RGBColor;
    undefinedPropertyValue: number;
    propertyValueRange: [number, number];
    smoothShading: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
    enableLighting: boolean;
    discretePropertyValueNames?: IDiscretePropertyValueName[];
}

const defaultProps = {
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    colormapName: "",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
    meshValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
    enableLighting: true,
};

// This is a private layer used only by the composite MapLayer
export default class PrivateMapLayer extends Layer<PrivateMapLayerProps> {
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
        return;
    }

    private getColoringHints(): IColormapTextureHints {
        if (this.props.colormapFunction instanceof Uint8Array) {
            return {
                discreteData: true,
                colormapSize: this.props.colormapFunction.length / 3,
            };
        }
        if (
            this.props.vertexProperties instanceof Uint32Array ||
            this.props.vertexProperties instanceof Int32Array ||
            this.props.vertexProperties instanceof Uint16Array ||
            this.props.vertexProperties instanceof Int16Array ||
            typeof this.props.discretePropertyValueNames !== "undefined"
        ) {
            return {
                discreteData: true,
                colormapSize: (this.props.propertyValueRange?.[1] ?? 0) + 1,
            };
        }
        return {
            discreteData: false,
            colormapSize: 256,
        };
    }

    private getVertexColorAttributes(): Float32Array {
        const hints = this.getColoringHints();
        const colors = getColormapDiscreteColors(
            this.props.colormapFunction ?? {
                colormapName: this.props.colormapName,
                colorTables: (this.context as DeckGLLayerContext).userData
                    .colorTables,
            },
            hints
        );

        const colormapSize = colors.length / 3;
        const length = this.props.vertexProperties.length;
        const vertexColors = new Float32Array(length * 3);
        for (let i = 0; i < length; i++) {
            const property = this.props.vertexProperties[i];

            const index =
                this.props.discretePropertyValueNames?.findIndex(
                    (e) => e.code === property
                ) ?? -1;
            let color = this.props.discretePropertyValueNames?.[index]?.color; // Use this color if set.

            if (typeof color === "undefined") {
                if (
                    index !== -1 &&
                    property !== this.props.undefinedPropertyValue
                ) {
                    const i = index % colormapSize;
                    color = [
                        colors[i * 3 + 0],
                        colors[i * 3 + 1],
                        colors[i * 3 + 2],
                    ];
                } else {
                    color = this.props.undefinedPropertyColor;
                }
            }

            vertexColors[i * 3 + 0] = color[0] / 255;
            vertexColors[i * 3 + 1] = color[1] / 255;
            vertexColors[i * 3 + 2] = color[2] / 255;
        }
        return vertexColors;
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

    isPropertiesCategorical(): boolean {
        return (
            this.getColoringHints().discreteData &&
            typeof this.props.discretePropertyValueNames !== "undefined"
        );
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

        const valueRangeMin = this.props.propertyValueRange[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange[1] ?? 1.0;

        // If specified color map will extend from colormapRangeMin to colormapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colormapRangeMin = this.props.colormapRange?.[0] ?? valueRangeMin;
        const colormapRangeMax = this.props.colormapRange?.[1] ?? valueRangeMax;

        const isClampColor: boolean =
            this.props.colormapClampColor !== undefined &&
            this.props.colormapClampColor !== true &&
            this.props.colormapClampColor !== false;
        let colormapClampColor = isClampColor
            ? this.props.colormapClampColor
            : [0, 0, 0];

        // Normalize to [0,1] range.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        colormapClampColor = (colormapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        );

        const isColormapClampColorTransparent: boolean =
            (this.props.colormapClampColor as boolean) === false;

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
                contourReferencePoint,
                contourInterval,
                isContoursDepth,
                valueRangeMin,
                valueRangeMax,
                colormapRangeMin,
                colormapRangeMax,
                colormapClampColor,
                isColormapClampColorTransparent,
                isClampColor,
                smoothShading,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });

        return model;
    }

    getDiscretePropModel() {
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const vertexColors = this.getVertexColorAttributes();

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
                    vertexColor: { value: vertexColors, size: 3 },
                    properties: {
                        value: this.props.vertexProperties,
                        size: 1,
                        normalized: false,
                    },
                },
                indices: { value: this.props.triangleIndices, size: 1 },
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            isInstanced: false,
        });

        model.shaderInputs.setProps({
            map: {
                contourReferencePoint,
                contourInterval,
                isContoursDepth,
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
        const mesh_model = this.isPropertiesCategorical()
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

        if (this.isPropertiesCategorical()) {
            const [r, g, b] = info.color;
            const code = decodeIndexFromRGB([r, g, b]);

            const layer_properties: PropertyDataType[] = [];
            layer_properties.push(createPropertyData("Code", code));

            const index =
                this.props.discretePropertyValueNames?.findIndex(
                    (e) => e.code === code
                ) ?? -1;
            const name =
                index !== -1
                    ? this.props.discretePropertyValueNames?.[index]?.name
                    : "No name";
            layer_properties.push(createPropertyData("Name", name as string));

            return {
                ...info,
                properties: layer_properties,
            };
        }

        const layer_properties: PropertyDataType[] = [];

        // Note these colors are in the  0-255 range.
        const [r, g, b] = info.color;
        const vertexIndex = decodeIndexFromRGB([r, g, b]);

        if (typeof info.coordinate?.[2] !== "undefined") {
            const zScale = this.props.modelMatrix
                ? this.props.modelMatrix[10]
                : 1;

            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);

            layer_properties.push(createPropertyData("Depth", depth));
        }

        const properties = this.props.vertexProperties;
        const property = properties[vertexIndex];

        layer_properties.push(createPropertyData("Property", property));
        return {
            ...info,
            properties: layer_properties,
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

    float valueRangeMin;
    float valueRangeMax;
    float colormapRangeMin;
    float colormapRangeMax;

    vec3 colormapClampColor;
    bool isClampColor;
    bool isColormapClampColorTransparent;
    bool smoothShading;
    bool ZIncreasingDownwards;
} map;
`;

type MapUniformsType = {
    isContoursDepth: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    valueRangeMin: number;
    valueRangeMax: number;
    colormapRangeMin: number;
    colormapRangeMax: number;
    colormapClampColor: RGBColor;
    isClampColor: boolean;
    isColormapClampColorTransparent: boolean;
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
        valueRangeMin: "f32",
        valueRangeMax: "f32",
        colormapRangeMin: "f32",
        colormapRangeMax: "f32",
        colormapClampColor: "vec3<f32>",
        isClampColor: "u32",
        isColormapClampColorTransparent: "u32",
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

    bool ZIncreasingDownwards;
} map_d;
`;

type MapDiscreteUniformsType = {
    isContoursDepth: boolean;
    contourReferencePoint: number;
    contourInterval: number;
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
