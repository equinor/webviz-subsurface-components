import type { LayerProps, PickingInfo, UpdateParameters } from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, picking, project32 } from "@deck.gl/core";

import { GL } from "@luma.gl/constants";
import type { GeometryProps } from "@luma.gl/engine";
import { Geometry, Model } from "@luma.gl/engine";
import type { Device } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

import type { DeckGLLayerContext } from "../../components/Map";
import { lighting } from "@luma.gl/shadertools";
import { phongMaterial } from "../shader_modules/phong-lighting/phong-material";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";

import fsShader from "./fragment.fs.glsl";
import fsLineShader from "./fragment_lines.glsl";
import vsShader from "./vertex.glsl";
import vsLineShader from "./vertex_lines.glsl";

export type GeometryTriangles = {
    topology: GeometryProps["topology"];
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals: { value: Float32Array; size: number };
        vertex_indexs: { value: Int32Array; size: number };
    };
    vertexCount: number;
    indices: { value: Uint32Array; size: number };
};

export type GeometryLines = {
    topology: GeometryProps["topology"];
    attributes: {
        positions: { value: Float32Array; size: number };
    };
    vertexCount: number;
};

export interface PrivateTriangleLayerProps extends ExtendedLayerProps {
    geometryTriangles: GeometryTriangles;
    geometryLines: GeometryLines;
    contours: [number, number];
    gridLines: boolean;
    color: [number, number, number];
    smoothShading: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
    enableLighting: boolean;
}

const defaultProps = {
    data: ["dummy"],
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    color: [100, 100, 255],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    depthTest: true,
    smoothShading: true,
    ZIncreasingDownwards: true,
    enableLighting: true,
};

// This is a private layer used only by the composite TriangleLayer
export default class PrivateTriangleLayer extends Layer<PrivateTriangleLayerProps> {
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
        const gl = context.device;
        const [triangleModel, lineModel] = this._getModels(gl);
        this.setState({ models: [triangleModel, lineModel], isLoaded: false });
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

    _getModels(device: Device): [Model, Model] {
        const triangleModel = new Model(device, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            geometry: new Geometry(this.props.geometryTriangles),
            modules: [
                project32,
                picking,
                lighting,
                phongMaterial,
                trianglesUniforms,
            ],
            isInstanced: false, // This only works when set to false.
        });

        const lineModel = new Model(device, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            geometry: new Geometry(this.props.geometryLines),
            modules: [project32, picking, triangleMeshUniforms],
            isInstanced: false,
        });

        return [triangleModel, lineModel];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw(args: any): void {
        if (!this.state["models"]) {
            return;
        }

        const { gl } = args.context;

        const [triangleModel, lineModel] = this.state["models"] as Model[];

        if (!this.props.depthTest) {
            gl.disable(GL.DEPTH_TEST);
        }
        gl.enable(GL.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);
        triangleModel.shaderInputs.setProps({
            ...args.uniforms,
            triangles: {
                isContoursDepth: defaultProps.isContoursDepth,
                contourReferencePoint:
                    this.props.contours?.[0] ?? defaultProps.contours[0],
                contourInterval:
                    this.props.contours?.[1] ?? defaultProps.contours[1],
                // Normalize to [0,1] range.
                uColor: [
                    ...(this.props.color ?? defaultProps.color).map(
                        (x: number) => (x ?? 0) / 255
                    ),
                    1 /* alpha channel */,
                ] as [number, number, number, number],
                smoothShading:
                    this.props.smoothShading ?? defaultProps.smoothShading,
                ZIncreasingDownwards:
                    this.props.ZIncreasingDownwards ??
                    defaultProps.ZIncreasingDownwards,
            },
        });

        triangleModel.draw(args.context.renderPass);

        gl.disable(GL.POLYGON_OFFSET_FILL);

        if (this.props.gridLines) {
            lineModel.shaderInputs.setProps({
                ...args.uniforms,
                triangleMesh: {
                    ZIncreasingDownwards:
                        this.props.ZIncreasingDownwards ??
                        defaultProps.ZIncreasingDownwards,
                },
            });
            lineModel.draw(args.context.renderPass);
        }

        if (!this.props.depthTest) {
            gl.enable(GL.DEPTH_TEST);
        }

        if (!this.state["isLoaded"]) {
            this.setState({ ...this.state, isLoaded: true });
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

PrivateTriangleLayer.layerName = "privateTriangleLayer";
PrivateTriangleLayer.defaultProps = defaultProps;

const triangleMeshUniformsBlock = `\
uniform triangleMeshUniforms {
    uniform bool ZIncreasingDownwards;
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
    uniform bool isContoursDepth;
    uniform float contourReferencePoint;
    uniform float contourInterval;
    uniform vec4 uColor;
    uniform bool smoothShading;
    uniform bool ZIncreasingDownwards;
} triangles;
`;

type TriangleUniformsType = {
    isContoursDepth: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    uColor: [number, number, number, number];
    smoothShading: boolean;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name than in the uniform block
const trianglesUniforms = {
    name: "triangles",
    vs: triangleUniformsBlock,
    fs: triangleUniformsBlock,
    uniformTypes: {
        isContoursDepth: "u32",
        contourReferencePoint: "f32",
        contourInterval: "f32",
        uColor: "vec4<f32>",
        smoothShading: "u32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, TriangleUniformsType>;
