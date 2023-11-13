import type { PickingInfo, UpdateParameters, Color } from "@deck.gl/core/typed";
import {
    COORDINATE_SYSTEM,
    Layer,
    picking,
    project,
    project32,
} from "@deck.gl/core/typed";
import { localPhongLighting, utilities } from "../shader_modules";
import type { LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import { Model, Geometry } from "@luma.gl/engine";
import type { DeckGLLayerContext } from "../../components/Map";
import type {
    ExtendedLayerProps,
    colorMapFunctionType,
} from "../utils/layerTools";

import { getImageData } from "../utils/layerTools";

import vs from "./vertex.glsl";
import fs from "./fragment.fs.glsl";
import vsLineShader from "./vertex_lines.glsl";
import fsLineShader from "./fragment_lines.glsl";

import { Texture2D } from "@luma.gl/webgl";
import GL from "@luma.gl/constants";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

export type Material =
    | {
          ambient: number;
          diffuse: number;
          shininess: number;
          specularColor: [number, number, number];
      }
    | boolean;
export interface privateMapLayerProps extends ExtendedLayerProps {
    positions: Float32Array;
    normals: Int8Array;
    triangleIndices: Uint32Array;
    vertexProperties: Float32Array;
    vertexIndices: Int32Array;
    lineIndices: Uint32Array;
    contours: [number, number];
    gridLines: boolean;
    isContoursDepth: boolean;
    colorMapName: string;
    colorMapRange: [number, number];
    colorMapClampColor: Color | undefined | boolean;
    colorMapFunction?: colorMapFunctionType;
    propertyValueRange: [number, number];
    smoothShading: boolean;
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
}

const defaultProps = {
    data: ["dummy"],
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    colorMapName: "",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
    meshValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
};

// This is a private layer used only by the composite Map3DLayer
export default class privateMapLayer extends Layer<privateMapLayerProps> {
    get isLoaded(): boolean {
        return this.state["isLoaded"] ?? false;
    }

    initializeState(context: DeckGLLayerContext): void {
        const { gl } = context;
        const [model_mesh, mesh_lines_model] = this._getModels(gl);
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
    _getModels(gl: any) {
        const shaders = this.getShaders();

        // MESH MODEL
        const mesh_model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            ...shaders,
            geometry: new Geometry({
                drawMode: gl.TRIANGLES,
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
            isInstanced: false, // This only works when set to false.
        });

        // MESH LINES
        const mesh_lines_model = new Model(gl, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            geometry: new Geometry({
                drawMode: gl.LINES,
                attributes: {
                    positions: { value: this.props.positions, size: 3 },
                },
                indices: { value: this.props.lineIndices, size: 1 },
            }),
            modules: [project],
            isInstanced: false,
        });

        return [mesh_model, mesh_lines_model];
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw(args: any): void {
        if (!this.state["models"]) {
            return;
        }

        const { uniforms, context } = args;
        const { gl } = context;

        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const [model_mesh, mesh_lines_model] = this.state["models"];

        const valueRangeMin = this.props.propertyValueRange[0] ?? 0.0;
        const valueRangeMax = this.props.propertyValueRange[1] ?? 1.0;

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
            : [0, 0, 0];

        // Normalize to [0,1] range.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        colorMapClampColor = (colorMapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        );

        const isColorMapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;

        const smoothShading =
            this.props.normals.length == 0 ? false : this.props.smoothShading;

        gl.enable(GL.POLYGON_OFFSET_FILL);
        if (!this.props.depthTest) {
            gl.disable(GL.DEPTH_TEST);
        }

        gl.polygonOffset(1, 1);
        model_mesh
            .setUniforms({
                ...uniforms,
                contourReferencePoint,
                contourInterval,
                isContoursDepth,
                colormap: new Texture2D(context.gl, {
                    width: 256,
                    height: 1,
                    format: GL.RGB,
                    data: getImageData(
                        this.props.colorMapName,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.colorMapFunction
                    ),
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,
                colorMapClampColor,
                isColorMapClampColorTransparent,
                isClampColor,
                smoothShading,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            })
            .draw();
        gl.disable(GL.POLYGON_OFFSET_FILL);

        if (!this.props.depthTest) {
            gl.enable(GL.DEPTH_TEST);
        }

        if (this.props.gridLines) {
            mesh_lines_model
                .setUniforms({
                    ...uniforms,
                    ZIncreasingDownwards: this.props.ZIncreasingDownwards,
                })
                .draw();
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

        // Note these colors are in the  0-255 range.
        const r = info.color[0];
        const g = info.color[1];
        const b = info.color[2];

        const vertexIndex = 256 * 256 * r + 256 * g + b;

        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth = this.props.ZIncreasingDownwards
                ? -info.coordinate[2]
                : info.coordinate[2];
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

    getShaders() {
        return super.getShaders({
            vs,
            fs,
            modules: [project32, picking, localPhongLighting, utilities]});
    }

}

privateMapLayer.layerName = "privateMapLayer";
privateMapLayer.defaultProps = defaultProps;
