import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { createPropertyData, PropertyDataType } from "../utils/layerTools";
import { Geometry } from "@luma.gl/core";
import { picking, project, phongLighting } from "deck.gl";
import { Model } from "@luma.gl/engine";
import { DeckGLLayerContext } from "../../components/Map";
import { ExtendedLayerProps } from "../utils/layerTools";
import { Layer } from "@deck.gl/core";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
import vsShader from "./vertex.glsl";
import fsShader from "./fragment.fs.glsl";
import vsLineShader from "./vertex_lines.glsl";
import fsLineShader from "./fragment_lines.glsl";

export type MeshType = {
    drawMode?: number;
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
        colors: { value: Float32Array; size: number };
        properties: { value: Float32Array; size: number };
        vertex_indexs: { value: Int32Array; size: number };
    };
    vertexCount: number;
    indices: { value: Uint32Array; size: number };
};

export type MeshTypeLines = {
    drawMode: number;
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

export interface privateMapLayerProps<D> extends ExtendedLayerProps<D> {
    mesh: MeshType;
    meshLines: MeshTypeLines;
    contours: [number, number];
    gridLines: boolean;
    isContoursDepth: boolean;
}

const defaultProps = {
    data: ["dummy"],
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
    initializeState(context: DeckGLLayerContext): void {
        const { gl } = context;
        const [model_mesh, mesh_lines_model] = this._getModels(gl);
        this.setState({ models: [model_mesh, mesh_lines_model] });
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateStateInfo<privateMapLayerProps<unknown>>):
        | boolean
        | string
        | null {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.propsOrDataChanged
        );
    }

    updateState({
        context,
    }: UpdateStateInfo<privateMapLayerProps<unknown>>): void {
        this.initializeState(context as DeckGLLayerContext);
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        // MESH MODEL
        const mesh_model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            geometry: new Geometry({
                drawMode: this.props.mesh.drawMode,
                attributes: {
                    positions: this.props.mesh.attributes.positions,
                    colors: this.props.mesh.attributes.colors,
                    properties: this.props.mesh.attributes.properties,
                    vertex_indexs: this.props.mesh.attributes.vertex_indexs,
                },
                vertexCount: this.props.mesh.vertexCount,
                indices: this.props.mesh.indices,
            }),
            modules: [project, picking, phongLighting],
            isInstanced: false, // This only works when set to false.
        });

        // MESH LINES
        const mesh_lines_model = new Model(gl, {
            id: `${this.props.id}-lines`,
            vs: vsLineShader,
            fs: fsLineShader,
            geometry: new Geometry(this.props.meshLines),
            modules: [project, picking],
            isInstanced: false,
        });

        return [mesh_model, mesh_lines_model];
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw(args: any): void {
        if (!this.state.models) {
            return;
        }

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

        const layer_properties: PropertyDataType[] = [];

        // Note these colors are in the  0-255 range.
        const r = info.color[0];
        const g = info.color[1];
        const b = info.color[2];

        const vertexIndex = 256 * 256 * r + 256 * g + b;

        // XXX
        //console.log("vertexIndex: ", vertexIndex, b)
        //console.log("indices: ",  this.props.mesh.indices)

        const vertexs = this.props.mesh.attributes.positions.value;
        const depth = -vertexs[3 * vertexIndex + 2];
        layer_properties.push(createPropertyData("Depth", depth));

        const properties = this.props.mesh.attributes.properties.value;
        const property = properties[vertexIndex];
        layer_properties.push(createPropertyData("Property", property));

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

privateMapLayer.layerName = "privateMapLayer";
privateMapLayer.defaultProps = defaultProps;
