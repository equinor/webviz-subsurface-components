import {
    COORDINATE_SYSTEM,
    Layer,
    picking,
    project,
    phongLighting,
    PickingInfo,
    UpdateParameters,
    Color,
} from "@deck.gl/core/typed";
import {
    createPropertyData,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { Model, Geometry } from "@luma.gl/engine";
import { DeckGLLayerContext } from "../../components/Map";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import vsShader from "./vertex.glsl";
import fsShader from "./fragment.fs.glsl";
import vsLineShader from "./vertex_lines.glsl";
import fsLineShader from "./fragment_lines.glsl";

import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import { createDefaultContinuousColorScale } from "@emerson-eps/color-tables/dist/component/Utils/legendCommonFunction";
import { Texture2D } from "@luma.gl/webgl";
import GL from "@luma.gl/constants";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

export type MeshType = {
    drawMode?: number;
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
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

function getImageData(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction: colorMapFunctionType | false | undefined
) {
    const isColorMapFunctionDefined = typeof colorMapFunction === "function";
    const isColorMapNameDefined = !!colorMapName;

    const data = new Uint8Array(256 * 3);

    const defaultColorMap = createDefaultContinuousColorScale;

    const colorMap = isColorMapFunctionDefined
        ? colorMapFunction
        : isColorMapNameDefined
        ? (value: number) => rgbValues(value, colorMapName, colorTables)
        : defaultColorMap();

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const color = colorMap ? colorMap(value) : [0, 0, 0];
        if (color) {
            data[3 * i + 0] = color[0];
            data[3 * i + 1] = color[1];
            data[3 * i + 2] = color[2];
        }
    }

    return data ? data : [0, 0, 0];
}

export interface privateLayerProps<D> extends ExtendedLayerProps<D> {
    mesh: MeshType;
    meshLines: MeshTypeLines;
    colorMapName: string;
    colorMapRange: [number, number];
    colorMapClampColor: Color | undefined | boolean;
    colorMapFunction?: colorMapFunctionType | false;
    propertyValueRange: [number, number];
}

const defaultProps = {
    colorMapName: "",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    propertyValueRange: [0.0, 1.0],
};

// This is a private layer used only by the composite Map3DLayer
export default class privateLayer extends Layer<privateLayerProps<unknown>> {
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
        // MESH MODEL
        const mesh_model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,
            geometry: new Geometry({
                drawMode: this.props.mesh.drawMode,
                attributes: {
                    positions: this.props.mesh.attributes.positions,
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
        if (!this.state["models"]) {
            return;
        }

        const { uniforms, context } = args;
        const { gl } = context;

        const [model_mesh, mesh_lines_model] = this.state["models"];

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
            : [0, 0, 0];

        // Normalize to [0,1] range.
        colorMapClampColor = (colorMapClampColor as Color).map(
            (x) => (x ?? 0) / 255
        );

        const isColorMapClampColorTransparent: boolean =
            (this.props.colorMapClampColor as boolean) === false;

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1, 1);
        model_mesh
            .setUniforms({
                ...uniforms,
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
            })
            .draw();
        gl.disable(gl.POLYGON_OFFSET_FILL);

        // Draw lines.
        mesh_lines_model.draw();
    }

    decodePickingColor(): number {
        return 0;
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

privateLayer.layerName = "privateLayer";
privateLayer.defaultProps = defaultProps;
