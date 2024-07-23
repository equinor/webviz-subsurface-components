import type {
    Color,
    PickingInfo,
    UpdateParameters,
    LayerContext,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, picking, project } from "@deck.gl/core";
import type {
    UniformValue,
    SamplerProps,
    Texture,
    TextureProps,
    TextureData,
} from "@luma.gl/core";
import { Geometry, Model } from "@luma.gl/engine";
import type { DeckGLLayerContext } from "../../components/Map";
import { localPhongLighting, utilities } from "../shader_modules";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
    colorMapFunctionType,
} from "../utils/layerTools";
import { createPropertyData, getImageData } from "../utils/layerTools";
import fsShader from "./fragment.fs.glsl";
import fsLineShader from "./fragment_lines.glsl";

import {
    TGrid3DColoringMode,
    type IDiscretePropertyValueName,
} from "./grid3dLayer";

import type { MeshType, MeshTypeLines } from "./typeDefs";
import vsShader from "./vertex.glsl";
import vsLineShader from "./vertex_lines.glsl";

const DEFAULT_TEXTURE_PARAMETERS: SamplerProps = {
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    minFilter: "linear",
    magFilter: "linear",
};

const DISCRETE_TEXTURE_PARAMETERS: SamplerProps = {
    minFilter: "nearest",
    magFilter: "nearest",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
};

export interface PrivateLayerProps extends ExtendedLayerProps {
    mesh: MeshType;
    meshLines: MeshTypeLines;
    colorMapName: string;
    colorMapRange: [number, number];
    colorMapClampColor: Color | undefined | boolean;
    colorMapFunction?: colorMapFunctionType;
    coloringMode: TGrid3DColoringMode.Property;
    gridLines: boolean;
    propertyValueRange: [number, number];
    discretePropertyValueNames?: IDiscretePropertyValueName[];
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
}

const defaultProps = {
    colorMapName: "",
    colorMapClampColor: [200, 200, 200],
    coloringMode: 0,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
};

interface IPropertyUniforms {
    valueRangeMin: number;
    valueRangeMax: number;
    colorMapRangeMin: number;
    colorMapRangeMax: number;
    colorMapClampColor?: Color | undefined | boolean | number[];
    isColorMapClampColorTransparent: boolean;
    isClampColor: boolean;
    isColoringDiscrete: boolean;
}

interface IImageData {
    data: number[] | Uint8Array;
    count: number;
    parameters:
        | typeof DEFAULT_TEXTURE_PARAMETERS
        | typeof DISCRETE_TEXTURE_PARAMETERS;
    isColoringDiscrete: boolean;
}

// This is a private layer used only by the composite Grid3DLayer
export default class PrivateLayer extends Layer<PrivateLayerProps> {
    get isLoaded(): boolean {
        return (this.state["isLoaded"] as boolean) ?? false;
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

    //eslint-disable-next-line
    _getModels(context: DeckGLLayerContext) {
        const propertyUniforms = this.getPropertyUniforms();
        const colormap = this.getTexture(context);
        const mesh_model = new Model(context.device, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            geometry: new Geometry({
                topology: this.props.mesh.drawMode ?? "triangle-list",
                attributes: {
                    positions: this.props.mesh.attributes.positions,
                    properties: this.props.mesh.attributes.properties,
                    normals: this.props.mesh.attributes.normals,
                },
                vertexCount: this.props.mesh.vertexCount,
            }),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            uniforms: {
                ...propertyUniforms,
                coloringMode: this.props.coloringMode,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
            bindings: {
                colormap,
            },
            modules: [project, picking, localPhongLighting, utilities],
            isInstanced: false,
        });

        const mesh_lines_model = new Model(context.device, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            geometry: new Geometry(this.props.meshLines),
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            uniforms: {
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
            modules: [project, picking],
            isInstanced: false,
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

    encodePickingColor(): number[] {
        return this.nullPickingColor();
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

        const properties = this.props.mesh.attributes.properties.value;
        const propertyIndex = properties[vertexIndex];
        if (Number.isFinite(propertyIndex)) {
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

    private getDefaultImageData(): IImageData {
        return {
            data: new Uint8Array([0, 0, 0]),
            count: 1,
            parameters: DISCRETE_TEXTURE_PARAMETERS,
            isColoringDiscrete: true,
        };
    }

    private getImageData(): IImageData {
        if (this.props.colorMapFunction instanceof Uint8Array) {
            const count = this.props.colorMapFunction.length / 3;
            if (count === 0) {
                return this.getDefaultImageData();
            }

            const parameters =
                this.props.coloringMode === TGrid3DColoringMode.Property
                    ? DISCRETE_TEXTURE_PARAMETERS
                    : DEFAULT_TEXTURE_PARAMETERS;
            const isColoringDiscrete =
                this.props.coloringMode === TGrid3DColoringMode.Property;
            return {
                data: this.props.colorMapFunction,
                count,
                parameters,
                isColoringDiscrete,
            };
        }
        const data = getImageData(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables,
            this.props.colorMapFunction
        );
        return {
            data,
            count: 256,
            parameters: DEFAULT_TEXTURE_PARAMETERS,
            isColoringDiscrete: false,
        };
    }

    private getPropertyUniforms(): IPropertyUniforms {
        const valueRangeMin = this.props.propertyValueRange?.[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange?.[1] ?? 1.0;

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
            : ([0, 0, 0] as Color);

        // Normalize to [0,1] range.
        colorMapClampColor = (colorMapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        ) as Color;

        const isColorMapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;

        const imageData = this.getImageData();

        return {
            valueRangeMin,
            valueRangeMax,
            colorMapRangeMin,
            colorMapRangeMax,
            ...(colorMapClampColor ? { colorMapClampColor } : {}),
            isColorMapClampColorTransparent,
            isClampColor,
            isColoringDiscrete: imageData.isColoringDiscrete,
        };
    }
    private getTexture(context: DeckGLLayerContext): Texture<TextureProps> {
        if (this.props.colorMapFunction instanceof Uint8Array) {
            const imageData = this.getImageData();
            const count = this.props.colorMapFunction.length / 3;
            if (count === 0) {
                const colormap = context.device.createTexture({
                    width: imageData.count,
                    height: 1,
                    format: "rgb8unorm-webgl",
                    data: new Uint8Array([0, 0, 0, 0, 0, 0]),
                    sampler: DISCRETE_TEXTURE_PARAMETERS,
                });
                return colormap;
            }

            const sampler =
                this.props.coloringMode === TGrid3DColoringMode.Property
                    ? DISCRETE_TEXTURE_PARAMETERS
                    : DEFAULT_TEXTURE_PARAMETERS;

            const colormap = context.device.createTexture({
                width: imageData.count,
                height: 1,
                format: "rgb8unorm-webgl",
                data: imageData.data as TextureData,
                sampler,
            });

            return colormap;
        }

        const data = getImageData(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables,
            this.props.colorMapFunction
        );

        const colormap = context.device.createTexture({
            width: 256,
            height: 1,
            format: "rgb8unorm-webgl",
            data: data as TextureData,
        });
        return colormap;
    }
}

PrivateLayer.layerName = "PrivateLayer";
PrivateLayer.defaultProps = defaultProps;
