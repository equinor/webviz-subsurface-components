import type {
    LayerContext,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, picking, project } from "@deck.gl/core";
import { GL } from "@luma.gl/constants";
import type { GeometryProps } from "@luma.gl/engine";
import { Geometry, Model } from "@luma.gl/engine";
import type { Device, UniformValue } from "@luma.gl/core";
import type { DeckGLLayerContext } from "../../components/Map";
import { localPhongLighting } from "../shader_modules";
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

export type Material =
    | {
          ambient: number;
          diffuse: number;
          shininess: number;
          specularColor: [number, number, number];
      }
    | boolean;

export interface PrivateTriangleLayerProps extends ExtendedLayerProps {
    geometryTriangles: GeometryTriangles;
    geometryLines: GeometryLines;
    contours: [number, number];
    gridLines: boolean;
    color: [number, number, number];
    smoothShading: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
}

const defaultProps = {
    data: ["dummy"],
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    color: [100, 100, 255],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    depthTest: true,
    ZIncreasingDownwards: true,
};

// This is a private layer used only by the composite TriangleLayer
export default class PrivateTriangleLayer extends Layer<PrivateTriangleLayerProps> {
    get isLoaded(): boolean {
        return (this.state["isLoaded"] as boolean) ?? false;
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

    _getModels(gl: Device): [unknown, unknown] {
        const triangleModel = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            geometry: new Geometry(this.props.geometryTriangles),
            modules: [project, picking, localPhongLighting],
            isInstanced: false, // This only works when set to false.
        });

        const lineModel = new Model(gl, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            geometry: new Geometry(this.props.geometryLines),
            modules: [project, picking],
            isInstanced: false,
        });

        return [triangleModel, lineModel];
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: UniformValue;
        context: LayerContext;
    }): void {
        if (!this.state["models"]) {
            return;
        }

        const { uniforms, context } = args;
        const { gl } = context;

        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;

        const [triangleModel, lineModel] = this.state["models"] as Model[];

        const smoothShading = this.props.smoothShading;

        // Normalize to [0,1] range.
        const uColor = this.props.color.map((x: number) => (x ?? 0) / 255);
        uColor.push(1); // alpha channel.

        if (!this.props.depthTest) {
            gl.disable(GL.DEPTH_TEST);
        }
        gl.enable(GL.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);
        triangleModel.setUniforms({
            ...uniforms,
            contourReferencePoint,
            contourInterval,
            smoothShading,
            uColor,
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
        });

        triangleModel.draw(context.renderPass);

        gl.disable(GL.POLYGON_OFFSET_FILL);

        if (this.props.gridLines) {
            lineModel.setUniforms({
                ...uniforms,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            });
            lineModel.draw(context.renderPass);
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
