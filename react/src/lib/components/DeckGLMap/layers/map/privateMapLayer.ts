import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { Texture2D } from "@luma.gl/core";
import { createPropertyData, PropertyDataType } from "../utils/layerTools";
import { readoutMatrixSize } from "./mapLayer";
import { Geometry } from "@luma.gl/core";
import { picking, project, phongLighting } from "deck.gl";
import { Model } from "@luma.gl/engine";
import { LayerContext } from "@deck.gl/core/typed";
import { ExtendedLayerProps } from "../utils/layerTools";
import { Layer } from "@deck.gl/core";
import vsShader from "./vertex.glsl";
import fsShader from "./fragment.fs.glsl";
import vsLineShader from "./vertex_lines.glsl";
import fsLineShader from "./fragment_lines.glsl";

export type MeshType = {
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
        colors?: { value: Float32Array; size: number };
    };
    indices?: { value: Uint32Array; size: number };
};

export type Material =
    | {
          ambient: number;
          diffuse: number;
          shininess: number;
          specularColor: [number, number, number];
      }
    | boolean;

export interface privateMapLayerProps<D> extends ExtendedLayerProps<D> {
    mesh: [MeshType, MeshType];
    meshWidth: number;
    propertyTexture: Texture2D;

    readOutData: Float32Array[];
    readOutDataName: string[];
    contours: [number, number];
    gridLines: boolean;

    isContoursDepth: boolean;
}

const defaultProps = {
    data: ["dummy"],
    meshWidth: 1,
    contours: [-1, -1],
    isContoursDepth: true,
    gridLines: false,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
};

// This is a private layer used only by the composite Map3DLayer
export default class privateMapLayer extends Layer<
    unknown,
    privateMapLayerProps<unknown>
> {
    initializeState(context: LayerContext): void {
        const { gl } = context;
        const [model_mesh, mesh_lines_model] = this._getModels(gl);
        this.setState({ models: [model_mesh, mesh_lines_model] });
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        const [mesh, mesh_lines] = this.props.mesh;

        // MESH MODEL
        const mesh_model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            geometry: new Geometry(mesh),
            modules: [project, picking, phongLighting],
            isInstanced: false, // This only works when set to false.
        });

        // MESH LINES
        const mesh_lines_model = new Model(gl, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            geometry: new Geometry(mesh_lines),
            modules: [project, picking],
            isInstanced: false,
        });

        return [mesh_model, mesh_lines_model];
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw(args: any): void {
        const { uniforms, context } = args;
        const { gl } = context;

        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isContoursDepth = this.props.isContoursDepth;

        const [model_mesh, mesh_lines_model] = this.state.models;

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);
        model_mesh
            .setUniforms({
                ...uniforms,
                propertyTexture: this.props.propertyTexture,
                contourReferencePoint,
                contourInterval,
                isContoursDepth,
            })
            .draw();
        gl.disable(gl.POLYGON_OFFSET_FILL);

        if (this.props.gridLines) {
            mesh_lines_model.draw();
        }
    }

    decodePickingColor(): number {
        return 0;
    }

    // For now, use `any` for the picking types.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        const pickColor = info.color;
        if (!pickColor) {
            return info;
        }

        // Texture coordinates.
        const s = info.color[0] / 255.0;
        const t = info.color[1] / 255.0;

        // MESH & PROPERTY VALUE.
        const j = Math.max(Math.round(s * readoutMatrixSize) - 1, 0);
        const i = Math.max(Math.round(t * readoutMatrixSize) - 1, 0);
        const idx = i * readoutMatrixSize + j;

        const layer_properties: PropertyDataType[] = [];

        for (let i = 0; i < this.props.readOutData.length; i++) {
            const value = this.props.readOutData[i][idx];
            const name = this.props.readOutDataName[i];
            layer_properties.push(
                createPropertyData(name, isNaN(value) ? "NaN" : value)
            );
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

privateMapLayer.layerName = "privateMapLayer";
privateMapLayer.defaultProps = defaultProps;
