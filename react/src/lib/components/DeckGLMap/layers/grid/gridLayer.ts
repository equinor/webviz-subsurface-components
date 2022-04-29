import { CompositeLayer } from "@deck.gl/core";
import { ExtendedLayerProps } from "../utils/layerTools";
import { RGBAColor, RGBColor } from "@deck.gl/core/utils/color";
import { Position } from "@deck.gl/core/utils/positions";
import { PolygonLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { Feature } from "geojson";
import { Position3D } from "@deck.gl/core/utils/positions";
import { PolygonLayerProps } from "@deck.gl/layers";
import { layersDefaultProps } from "../layersDefaultProps";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";

//
import { Layer } from "@deck.gl/core";
import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/core";
import { LayerProps } from "@deck.gl/core/lib/layer";
import { picking, project } from "deck.gl";
import { DeckGLLayerContext } from "../../components/Map";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
import fragmentShaderLines from "./fragment_lines.glsl";
import vertexShaderLines from "./vertex_lines.glsl";


function getColorMapColors(
    colorMapName: string,
    colorTables: colorTablesArray
): RGBColor[] {
    const colors: RGBColor[] = [];

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = rgbValues(value, colorMapName, colorTables);
        let color: RGBColor = [155, 255, 255];
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

// These are the data PolygonLayer expects.
type CellProperties = {
    color: RGBAColor;
    i: number;
    j: number;
    depth: number;
    value: number;
};
interface PolygonData {
    polygon: Position[];
    properties: CellProperties;
}
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
        this.setState(this._getModels(gl));
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
        //console.log("updateState")
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        //console.log("GETMODEL")

        const colors = getColorMapColors(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables
        );

        const data = this.props.data as GridData;
        if (!data || data.length === 0) {
            return [];
        }

        const [triangle_vertexs, triangle_colors, cell_lines, cell_index] = makeVertexesAndColorArrays(
            data,
            0,     // this.state.ti
            colors,
            this.props.valueRange,
            this.props.colorMapRange
        );

        if (triangle_vertexs.length === 0) {  // XXX trengs dette?
            console.log("WTF!!!", data)
            return [];
        }
 
        // Cell triangle model.
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
                    // cell_index: {
                    //     size: 1,
                    //     value: new Int32Array(cell_index),
                    // },
                    // XXX tror jeg trenger en picking color ogsaa her..
                },
                vertexCount: triangle_vertexs.length / 3,
            }),
            modules: [project, picking],  //  modules: [project32, phongLighting, picking],
            isInstanced: false, // This only works when set to false.
        });

        // Cell border lines model.
        const line_colors = Array(cell_lines.length).fill([0.25, 0.25, 0.25]).flat();   // XXX bruke heller en separat shader kanskje
        const triangle_lines_model = new Model(gl, {
            id: `${this.props.id}-triangle_lines`,
            vs: vertexShaderLines,
            fs: fragmentShaderLines,
            geometry: new Geometry({
                drawMode: GL.LINES,  // LINE_LOOP  TRIANGLES LINES POINTS LINE_STRIP
                attributes: {
                    positions: {
                        size: 3,
                        value: new Float32Array(cell_lines),
                    },
                    color: {  // DENNE BRUKES EGENTLIG IKKE I SHADEREN MER..
                        size: 3,
                        value: new Float32Array(line_colors),
                    },
                },
                vertexCount: cell_lines.length / 3,
            }),
            modules: [project],
            isInstanced: false, // This only works when set to false.
        });

        return {
            models: [triangles_model, triangle_lines_model],
        };
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ uniforms }: any): void {
        // This replaces super.draw()
        if (this.state.models) {
            for (let i = 0; i < this.state.models.length; i++) {
                this.state.models[i].draw();
            }
        }
    }

    // decodePickingColor(): number {
    //     return 0;
    // }

    decodePickingColor(color: RGBColor) : number {
        //console.log("decodePickingColor ", color );
        return this.nullPickingColor();
    }

    encodePickingColor(): RGBColor {
        console.log("MOOOORN 2 ");
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

        //console.log("rgb: ", r, g, b);

        return {
            ...info,
            properties: "properies hallo",
            propertyValue: "propertyValue goddag",
        };
    }
}

GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = layersDefaultProps[
    "GridLayer"
] as GridLayerProps<GridData>;

//================= Local help functions. ==================

function makeVertexesAndColorArrays(
    data: GridData,
    ti: number,  // XXX bare send inn 0
    colors: RGBColor[],
    valueRange: [number, number],
    colorMapRange: [number, number]
): [number[], number[], number[], number[]] {
    const triangle_vertexs: number[] = [];
    const triangle_colors: number[] = [];
    const cell_lines: number[] = [];
    const cell_index: number[] = [];

    for (let i = 0; i < data.length; i++) {  // / 20 for aa faa litt mindre data   .... data.length
        const cell: CellData = data[i];
        //console.log(cell)

        const propertyValue = cell.vs[ti];

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

        const color = colors[Math.floor(x * 255)];
        // const color = [
        //     Math.random(),
        //     Math.random(),
        //     Math.random(),
        // ];

        // triangle_colors.push(Math.random(), Math.random(), Math.random());
        // triangle_colors.push(Math.random(), Math.random(), Math.random());
        // triangle_colors.push(Math.random(), Math.random(), Math.random());

        // Triangle 1.
        triangle_vertexs.push(...cell.cs[0], ...cell.cs[1], ...cell.cs[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);

        // Triangle 2.
        triangle_vertexs.push(...cell.cs[0], ...cell.cs[2], ...cell.cs[3]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);
        triangle_colors.push(color[0], color[1], color[2]);

        // Cell lines.
        cell_lines.push(...cell.cs[0], ...cell.cs[1]);
        cell_lines.push(...cell.cs[1], ...cell.cs[2]);
        cell_lines.push(...cell.cs[2], ...cell.cs[3]);
        cell_lines.push(...cell.cs[3], ...cell.cs[0]);

        // Cell index.
        cell_index.push(i);
    }

    return [triangle_vertexs, triangle_colors, cell_lines, cell_index];
}
