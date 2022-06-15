import { ExtendedLayerProps } from "../utils/layerTools";
import { Position3D } from "@deck.gl/core/utils/positions";
import { layersDefaultProps } from "../layersDefaultProps";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import { Layer } from "@deck.gl/core";
import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/core";
import { picking, project, phongLighting } from "deck.gl";
import { DeckGLLayerContext } from "../../components/Map";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
import fragmentShaderLines from "./fragment_lines.glsl";
import vertexShaderLines from "./vertex_lines.glsl";
import { RGBColor } from "@deck.gl/core/utils/color";

function getColorMapColors(
    colorMapName: string,
    colorTables: colorTablesArray
): RGBColor[] {
    const colors: RGBColor[] = [];

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = rgbValues(value, colorMapName, colorTables);
        let color: RGBColor = [0, 0, 0];
        if (rgb != undefined) {
            if (Array.isArray(rgb)) {
                color = [rgb[0], rgb[1], rgb[2]];
            } else {
                color = [rgb.r, rgb.g, rgb.b];
            }
        }

        colors.push(color);
    }

    return colors;
}

// These are the data GridLayer expects.
type CellData = {
    i: number;
    j: number;
    z: number; // cell depth
    cs: [Position3D, Position3D, Position3D, Position3D]; // 4 corners
    vs: [number]; // time dependent values
};
type GridData = CellData[];

export interface GridLayerProps<D> extends ExtendedLayerProps<D> {
    // Name of color map.
    colorMapName: string;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];
}

export default class GridLayer extends Layer<
    GridData,
    GridLayerProps<GridData>
> {
    initializeState(context: DeckGLLayerContext): void {
        const { gl } = context;

        const updateTimeStep = () => {
            const a_context = { context } as unknown as UpdateStateInfo<
                GridLayerProps<GridData>
            >;
            this.updateState(a_context); // LayerProps, LayerContext
        };

        // set intial state.
        this.setState({ ...this._getModels(gl, 0), ti: 0 });

        // For now just cycle over the timesteps.
        setInterval(updateTimeStep, 500);
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateStateInfo<GridLayerProps<GridData>>): boolean | string | null {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.propsOrDataChanged
        );
    }

    updateState({ context }: UpdateStateInfo<GridLayerProps<GridData>>): void {
        const { gl } = context;

        // Wrap around timestep if necessary.
        const data = this.props.data as GridData;

        const do_reset_ti = this.state.ti >= (data?.[0]?.vs.length ?? 1) - 1;
        const timeStep = do_reset_ti ? 0 : this.state.ti + 1;
        this.setState({
            ...this._getModels(gl, timeStep),
            ti: timeStep,
        });
    }

    //eslint-disable-next-line
    _getModels(gl: any, timeStep: number) {
        const colors = getColorMapColors(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables
        );

        const data = this.props.data as GridData;
        if (!data || data.length === 0) {
            return [];
        }

        const [triangle_vertexs, triangle_colors, cell_lines, cell_index] =
            makeVertexesAndColorArrays(
                data,
                timeStep,
                colors,
                this.props.valueRange,
                this.props.colorMapRange
            );

        if (triangle_vertexs.length === 0) {
            return [];
        }

        // CELL TRIANGLE MODEL.
        const triangles_model = new Model(gl, {
            id: `${this.props.id}-triangles`,
            vs: vertexShader,
            fs: fragmentShader,
            geometry: new Geometry({
                drawMode: GL.TRIANGLES,
                attributes: {
                    positions: new Float32Array(triangle_vertexs),
                    color: {
                        size: 3,
                        value: new Float32Array(triangle_colors),
                    },
                    cell_index: {
                        size: 1,
                        integer: true,
                        type: GL.INT,
                        value: new Int32Array(cell_index),
                    },
                },
                vertexCount: triangle_vertexs.length / 3,
            }),
            modules: [project, picking, phongLighting],
            isInstanced: false, // This only works when set to false.
        });

        // CELL LINE MODEL.
        const triangle_lines_model = new Model(gl, {
            id: `${this.props.id}-triangle_lines`,
            vs: vertexShaderLines,
            fs: fragmentShaderLines,
            geometry: new Geometry({
                drawMode: GL.LINES,
                attributes: {
                    positions: {
                        size: 3,
                        value: new Float32Array(cell_lines),
                    },
                },
                vertexCount: cell_lines.length / 3,
            }),
            modules: [project, picking],
            isInstanced: false, // This only works when set to false.
        });

        return {
            models: [triangles_model, triangle_lines_model],
        };
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ context }: any): void {
        const { gl } = context;

        if (this.state.models) {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1, 1);
            this.state.models[0].draw(); // triangles
            gl.disable(gl.POLYGON_OFFSET_FILL);

            this.state.models[1].draw(); // triangle lines
        }
    }

    // KEEP
    // decodePickingColor(): number {
    //     return 0;
    // }

    decodePickingColor(): number {
        return this.nullPickingColor() as unknown as number;
    }

    encodePickingColor(): RGBColor {
        return this.nullPickingColor();
    }

    // For now, use `any` for the picking types.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.color) {
            return info;
        }

        // Note these colors are in the  0-255 range.
        const r = info.color[0];
        const g = info.color[1];
        const b = info.color[2];

        if (r === 255) {
            // We are picking a line between cells.
            return info;
        }

        const index = 256 * 256 * r + 256 * g + b; // index into data array.
        const data = this.props.data as GridData;
        if (!data || data.length === 0) {
            return info;
        }

        const colors = getColorMapColors(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables
        );

        const timeStep = this.state.ti;
        const cell: CellData = data[index];
        const propertyValue = cell.vs[timeStep];
        const color = getColor(
            propertyValue,
            colors,
            this.props.valueRange,
            this.props.colorMapRange
        );

        return {
            ...info,
            properties: [
                { name: "i", value: cell.i },
                { name: "j", value: cell.j },
                { name: "depth:", value: cell.z },
                { name: "value:", value: propertyValue, color },
            ],
        };
    }
}

GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = layersDefaultProps[
    "GridLayer"
] as GridLayerProps<GridData>;

//================= Local help functions. ==================

function getColor(
    propertyValue: number,
    colors: RGBColor[],
    valueRange: [number, number],
    colorMapRange: [number, number]
): RGBColor {
    const valueRangeMin = valueRange[0] ?? 0.0;
    const valueRangeMax = valueRange[1] ?? 1.0;

    // If specified, color map will extend from colorMapRangeMin to colorMapRangeMax.
    // Otherwise it will extend from valueRangeMin to valueRangeMax.
    const colorMapRangeMin = colorMapRange?.[0] ?? valueRangeMin;
    const colorMapRangeMax = colorMapRange?.[1] ?? valueRangeMax;
    let x = propertyValue * (valueRangeMax - valueRangeMin) + valueRangeMin;
    x = (x - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
    x = Math.max(0.0, x);
    x = Math.min(1.0, x);

    const color = colors[Math.floor(x * 255.0)];
    return color;
}

function makeVertexesAndColorArrays(
    data: GridData,
    ti: number,
    colors: RGBColor[],
    valueRange: [number, number],
    colorMapRange: [number, number]
): [number[], number[], number[], number[]] {
    const triangle_vertexs: number[] = [];
    const triangle_colors: number[] = [];
    const cell_lines: number[] = [];
    const cell_index: number[] = [];

    for (let i = 0; i < data.length; i++) {
        const cell: CellData = data[i];

        const propertyValue = cell.vs[ti];

        let color = getColor(propertyValue, colors, valueRange, colorMapRange);

        // Normalize color.
        color = [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0];

        // Note. Equal color for all of a triangle vertxes gives constant color in
        //       a cell which is correct for this layer.
        // Triangle 1.
        triangle_vertexs.push(...cell.cs[0], ...cell.cs[1], ...cell.cs[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);

        // Cell index. One for each triangle vertex.
        for (let j = 0; j < 3; j++) {
            //cell_index.push(2 * i);
            cell_index.push(i);
        }

        // Triangle 2.
        triangle_vertexs.push(...cell.cs[0], ...cell.cs[2], ...cell.cs[3]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);

        // Cell index.
        for (let j = 0; j < 3; j++) {
            // one for each triangle vertex.
            //cell_index.push(2 * i + 1);
            cell_index.push(i);
        }

        // Cell lines.
        cell_lines.push(...cell.cs[0], ...cell.cs[1]);
        cell_lines.push(...cell.cs[1], ...cell.cs[2]);
        cell_lines.push(...cell.cs[2], ...cell.cs[3]);
        cell_lines.push(...cell.cs[3], ...cell.cs[0]);
    }

    return [triangle_vertexs, triangle_colors, cell_lines, cell_index];
}
