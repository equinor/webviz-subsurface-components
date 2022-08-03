import { CompositeLayer } from "@deck.gl/core";
import privateMapLayer, {
    privateMapLayerProps,
    Material,
    MeshType,
    MeshTypeLines,
} from "./privateMapLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { RGBColor } from "@deck.gl/core/utils/color";
import { layersDefaultProps } from "../layersDefaultProps";
import { getModelMatrix } from "../utils/layerTools";
import { isEqual } from "lodash";
import { Texture2D } from "@luma.gl/core";
import GL from "@luma.gl/constants";
import * as png from "@vivaxy/png";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import { createDefaultContinuousColorScale } from "@emerson-eps/color-tables/dist/component/Utils/legendCommonFunction";
import { DeckGLLayerContext } from "../../components/Map";
import { TerrainMapLayerData } from "../terrain/terrainMapLayer";

export const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

// These two types both describes the mesh' extent in the horizontal plane.
type Frame = {
    // mesh origin
    origin: [number, number];

    // cells size in each direction.
    increment: [number, number];

    // no cells in each direction.
    count: [number, number];

    // Rotates map counterclockwise in degrees around 'rotPoint' specified below.
    rotDeg?: number;

    // Point to rotate around using 'rotDeg'. Defaults to mesh origin.
    rotPoint?: [number, number];
};

function getColorMapColors(
    colorMapName: string,
    colorTables: colorTablesArray,
    colorMapFunction: colorMapFunctionType | undefined
) {
    const isColorMapFunctionDefined = typeof colorMapFunction !== "undefined";
    const isColorMapNameDefined = !!colorMapName;

    const colors: RGBColor[] = [];

    const defaultColorMap = createDefaultContinuousColorScale;

    const colorMap = isColorMapFunctionDefined
        ? colorMapFunction
        : isColorMapNameDefined
        ? (value: number) => rgbValues(value, colorMapName, colorTables)
        : defaultColorMap();

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const color = colorMap ? colorMap(value) : [0, 0, 0];
        colors.push(color as RGBColor);
    }

    // return data;
    return colors;
}

function dimNxNy(dim: Frame): [number, number] {
    const nx = dim.count[0];
    const ny = dim.count[1];

    return [nx, ny];
}

function getFloat32ArrayMinMax(data: Float32Array) {
    let max = -99999999;
    let min = 99999999;
    for (let i = 0; i < data.length; i++) {
        max = data[i] > max ? data[i] : max;
        min = data[i] < min ? data[i] : min;
    }
    return [min, max];
}

function getColor(
    propertyValue: number,
    colors: RGBColor[],
    colorMapRangeMin: number,
    colorMapRangeMax: number,
    isClampColor: boolean,
    isColorMapClampColorTransparent: boolean,
    clampColor: RGBColor
): RGBColor | boolean {
    let color: RGBColor = [0, 0, 0];
    if (!isNaN(propertyValue)) {
        let x =
            (propertyValue - colorMapRangeMin) /
            (colorMapRangeMax - colorMapRangeMin);

        if (x < 0.0 || x > 1.0) {
            // Out of range. Use clampcolor.
            if (isClampColor) {
                color = clampColor;
            } else if (isColorMapClampColorTransparent) {
                return false;
            } else {
                // Use min/max color to clamp.
                x = Math.max(0.0, x);
                x = Math.min(1.0, x);

                color = colors[Math.floor(x * 255)];
            }
        } else {
            color = colors[Math.floor(x * 255)];
        }
    } else {
        color = [255, 0, 0];
    }
    color = [color[0] / 255, color[1] / 255, color[2] / 255];
    return color;
}

function makeFullMesh(
    isMesh: boolean,
    cellCenteredProperties: boolean,
    dim: Frame,
    meshData: Float32Array,
    propertiesData: Float32Array,
    colorMapName: string,
    colorMapFunction: colorMapFunctionType | undefined,
    colorMapRange: [number, number],
    colorMapClampColor: RGBColor | undefined | boolean,
    colorTables: colorTablesArray
): [MeshType, MeshTypeLines] {
    const propertyValueRange = getFloat32ArrayMinMax(propertiesData);

    const colors = getColorMapColors(
        colorMapName,
        colorTables,
        colorMapFunction
    );

    const valueRangeMin = propertyValueRange[0];
    const valueRangeMax = propertyValueRange[1];

    // If colorMapRange specified, color map will extend from colorMapRangeMin to colorMapRangeMax.
    // Otherwise it will extend from valueRangeMin to valueRangeMax.
    const colorMapRangeMin = colorMapRange?.[0] ?? valueRangeMin;
    const colorMapRangeMax = colorMapRange?.[1] ?? valueRangeMax;

    const isColorMapClampColorTransparent: boolean =
        (colorMapClampColor as boolean) === false;

    const isClampColor: boolean =
        colorMapClampColor !== undefined &&
        colorMapClampColor !== true &&
        colorMapClampColor !== false;
    colorMapClampColor = isClampColor ? colorMapClampColor : [0, 0, 0];

    // Normalize to [0,1] range.
    const clampColor = (colorMapClampColor as RGBColor).map(
        (x) => (x ?? 0) / 255
    );

    // Dimensions.
    const ox = dim.origin[0];
    const oy = dim.origin[1];

    const dx = dim.increment[0];
    const dy = dim.increment[1];

    const nx = dim.count[0];
    const ny = dim.count[1];

    const maxX = ox + nx * dx;
    const maxY = oy + ny * dy;

    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];
    const vertexColors: number[] = [];
    const vertexProperties: number[] = [];
    const line_positions: number[] = [];

    // Note: Assumed layout of the incomming 2D array of data:
    // First coloumn corresponds to lowest x value. Last column highest x value.
    // First row corresponds to max y value. Last row corresponds to lowest y value.
    // This must be taken into account when calculating vertex x,y values and texture coordinates.

    if (!cellCenteredProperties) {
        // COLOR IS SET LINEARLY INTERPOLATED OVER A CELL.
        for (let h = 0; h < ny; h++) {
            for (let w = 0; w < nx; w++) {
                const i0 = h * nx + w;

                const x = ox + w * dx;
                const y = oy + (ny - h - 1) * dy; // See note above.
                const z = -meshData[i0];

                const propertyValue = propertiesData[i0];

                let color = getColor(
                    propertyValue,
                    colors,
                    colorMapRangeMin,
                    colorMapRangeMax,
                    isClampColor,
                    isColorMapClampColorTransparent,
                    clampColor as RGBColor
                );

                if (!color) {
                    color = [NaN, NaN, NaN];
                }

                positions.push(x, y, z);
                const s = (x - ox) / (maxX - ox);
                const t = 1.0 - (y - oy) / (maxY - oy); // For 1.0 - ... see note above.
                texCoords.push(s, t);
                vertexColors.push(...(color as RGBColor));
                vertexProperties.push(propertyValue);
            }
        }

        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const i0 = h * nx + w;
                const i1 = h * nx + (w + 1);
                const i2 = (h + 1) * nx + (w + 1);
                const i3 = (h + 1) * nx + w;

                // t1
                if (
                    !isNaN(meshData[i0]) && !isNaN(vertexColors[3 * i0 + 0]) && // eslint-disable-line
                    !isNaN(meshData[i1]) && !isNaN(vertexColors[3 * i1 + 0]) && // eslint-disable-line
                    !isNaN(meshData[i3]) && !isNaN(vertexColors[3 * i3 + 0])    // eslint-disable-line
                ) {
                    indices.push(i0, i1, i3);
                }

                // t2
                if (
                    !isNaN(meshData[i1]) && !isNaN(vertexColors[3 * i1 + 0]) && // eslint-disable-line
                    !isNaN(meshData[i3]) && !isNaN(vertexColors[3 * i3 + 0]) && // eslint-disable-line
                    !isNaN(meshData[i2]) && !isNaN(vertexColors[3 * i2 + 0])    // eslint-disable-line
                ) {
                    indices.push(i1, i3, i2);
                }
            }
        }
    } else {
        // COLOR IS SET CONSTANT OVER A CELL.
        let i = 0;
        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const hh = ny - h - 1; // See note above.

                const i0 = h * nx + w;
                const x0 = ox + w * dx;
                const y0 = oy + hh * dy;
                const z0 = isMesh && !isNaN(meshData[i0]) ? -meshData[i0] : 0;

                const i1 = h * nx + (w + 1);
                const x1 = ox + (w + 1) * dx;
                const y1 = oy + hh * dy;
                const z1 = isMesh && !isNaN(meshData[i1]) ? -meshData[i1] : 0;

                const i2 = (h - 1) * nx + (w + 1); // h - 1 instead of h + 1 See note above
                const x2 = ox + (w + 1) * dx;
                const y2 = oy + (hh + 1) * dy;
                const z2 = isMesh && !isNaN(meshData[i2]) ? -meshData[i2] : 0;

                const i3 = (h - 1) * nx + w; // h - 1 instead of h + 1 See note above
                const x3 = ox + w * dx;
                const y3 = oy + (hh + 1) * dy;
                const z3 = isMesh && !isNaN(meshData[i3]) ? -meshData[i3] : 0;

                const propertyValue = propertiesData[i0];
                const color = getColor(
                    propertyValue,
                    colors,
                    colorMapRangeMin,
                    colorMapRangeMax,
                    isClampColor,
                    isColorMapClampColorTransparent,
                    clampColor as RGBColor
                );

                if (!color) {
                    continue;
                }

                // t1
                if (
                    !isNaN(meshData[i0]) &&
                    !isNaN(meshData[i1]) &&
                    !isNaN(meshData[i3])
                ) {
                    //                                                                    For 1.0 - .. see note above.
                    positions.push(x0, y0, z0);  texCoords.push( (x0 - ox) / (maxX - ox), 1.0 - (y0 - oy) / (maxY - oy) ); // eslint-disable-line
                    positions.push(x1, y1, z1);  texCoords.push( (x1 - ox) / (maxX - ox), 1.0 - (y1 - oy) / (maxY - oy) ); // eslint-disable-line
                    positions.push(x3, y3, z3);  texCoords.push( (x3 - ox) / (maxX - ox), 1.0 - (y3 - oy) / (maxY - oy) ); // eslint-disable-line

                    indices.push(i++, i++, i++);
                    vertexColors.push(...(color as RGBColor));
                    vertexColors.push(...(color as RGBColor));
                    vertexColors.push(...(color as RGBColor));

                    vertexProperties.push(propertyValue);
                    vertexProperties.push(propertyValue);
                    vertexProperties.push(propertyValue);
                }

                // t2
                if (
                    !isNaN(meshData[i1]) &&
                    !isNaN(meshData[i3]) &&
                    !isNaN(meshData[i2])
                ) {
                    //                                                                    For 1.0 - .. see note above.
                    positions.push(x1, y1, z1);  texCoords.push( (x1 - ox) / (maxX - ox), 1.0 - (y1 - oy) / (maxY - oy) ); // eslint-disable-line
                    positions.push(x3, y3, z3);  texCoords.push( (x3 - ox) / (maxX - ox), 1.0 - (y3 - oy) / (maxY - oy) ); // eslint-disable-line
                    positions.push(x2, y2, z2);  texCoords.push( (x2 - ox) / (maxX - ox), 1.0 - (y2 - oy) / (maxY - oy) ); // eslint-disable-line

                    indices.push(i++, i++, i++);
                    vertexColors.push(...(color as RGBColor));
                    vertexColors.push(...(color as RGBColor));
                    vertexColors.push(...(color as RGBColor));

                    vertexProperties.push(propertyValue);
                    vertexProperties.push(propertyValue);
                    vertexProperties.push(propertyValue);
                }
            }
        }
    }

    const mesh: MeshType = {
        drawMode: GL.TRIANGLES,
        attributes: {
            positions: { value: new Float32Array(positions), size: 3 },
            TEXCOORD_0: { value: new Float32Array(texCoords), size: 2 },
            colors: { value: new Float32Array(vertexColors), size: 3 },
            properties: { value: new Float32Array(vertexProperties), size: 1 },
        },
        vertexCount: indices.length,
        indices: { value: new Uint32Array(indices), size: 1 },
    };

    // LINES
    for (let h = 0; h < ny - 1; h++) {
        for (let w = 0; w < nx - 1; w++) {
            const hh = ny - h - 1; // See note above.

            const i0 = h * nx + w;
            const x0 = ox + w * dx;
            const y0 = oy + hh * dy;
            const z0 = isMesh && !isNaN(meshData[i0]) ? -meshData[i0] : 0;

            const i1 = h * nx + (w + 1);
            const x1 = ox + (w + 1) * dx;
            const y1 = oy + hh * dy;
            const z1 = isMesh && !isNaN(meshData[i1]) ? -meshData[i1] : 0;

            const i2 = (h + 1) * nx + (w + 1);
            const x2 = ox + (w + 1) * dx;
            const y2 = oy + (hh - 1) * dy; // hh - 1 instead of hh + 1 See note above
            const z2 = isMesh && !isNaN(meshData[i2]) ? -meshData[i2] : 0;

            const i3 = (h + 1) * nx + w;
            const x3 = ox + w * dx;
            const y3 = oy + (hh - 1) * dy; // hh - 1 instead of hh + 1 See note above
            const z3 = isMesh && !isNaN(meshData[i3]) ? -meshData[i3] : 0;

            if (
                !isNaN(meshData[i0]) &&
                !isNaN(meshData[i1]) &&
                !isNaN(vertexColors[3 * i0 + 0]) &&
                !isNaN(vertexColors[3 * i1 + 0])
            ) {
                line_positions.push(x0, y0, z0);
                line_positions.push(x1, y1, z1);
            }
            if (
                !isNaN(meshData[i0]) &&
                !isNaN(meshData[i3]) &&
                !isNaN(vertexColors[3 * i0 + 0]) &&
                !isNaN(vertexColors[3 * i3 + 0])
            ) {
                line_positions.push(x0, y0, z0);
                line_positions.push(x3, y3, z3);
            }

            if (
                w === nx - 2 &&
                !isNaN(meshData[i1]) &&
                !isNaN(meshData[i2]) &&
                !isNaN(vertexColors[3 * i1 + 0]) &&
                !isNaN(vertexColors[3 * i2 + 0])
            ) {
                line_positions.push(x1, y1, z1);
                line_positions.push(x2, y2, z2);
            }

            if (
                h === ny - 2 &&
                !isNaN(meshData[i2]) &&
                !isNaN(meshData[i3]) &&
                !isNaN(vertexColors[3 * i2 + 0]) &&
                !isNaN(vertexColors[3 * i3 + 0])
            ) {
                line_positions.push(x2, y2, z2);
                line_positions.push(x3, y3, z3);
            }
        }
    }

    const mesh_lines: MeshTypeLines = {
        drawMode: GL.LINES,
        attributes: {
            positions: { value: new Float32Array(line_positions), size: 3 },
        },
        vertexCount: line_positions.length / 3,
    };

    return [mesh, mesh_lines];
}

async function load_mesh_and_texture(
    meshUrl: string,
    dim: Frame,
    propertiesUrl: string,
    colorMapName: string,
    colorMapFunction: colorMapFunctionType | undefined,
    colorMapRange: [number, number],
    colorMapClampColor: boolean | RGBColor | undefined,
    colorTables: colorTablesArray,
    cellCenteredProperties: boolean,
    gl: unknown
) {
    const isMesh = typeof meshUrl !== "undefined" && meshUrl !== "";
    const isProperties =
        typeof propertiesUrl !== "undefined" && propertiesUrl !== "";

    if (!isMesh && !isProperties) {
        console.error("Error. One or both of texture and mesh must be given!");
    }

    if (isMesh && !isProperties) {
        propertiesUrl = meshUrl;
    }

    const readOutData: Float32Array[] = [];
    const readOutDataName: string[] = [];

    //-- PROPERTY TEXTURE. --
    const response = await fetch(propertiesUrl);
    if (!response.ok) {
        console.error("Could not load ", propertiesUrl);
    }

    let propertiesData: Float32Array;
    const blob = await response.blob();
    const contentType = response.headers.get("content-type");
    const isPng = contentType === "image/png";
    if (isPng) {
        // Load as Png  with abolute float values.
        propertiesData = await new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(blob);
            fileReader.onload = () => {
                const arrayBuffer = fileReader.result;
                const imgData = png.decode(arrayBuffer as ArrayBuffer);
                const data = imgData.data; // array of int's

                const n = data.length;
                const buffer = new ArrayBuffer(n);
                const view = new DataView(buffer);
                for (let i = 0; i < n; i++) {
                    view.setUint8(i, data[i]);
                }

                const floatArray = new Float32Array(buffer);
                resolve(floatArray);
            };
        });
    } else {
        // Load as binary array of floats.
        const buffer = await blob.arrayBuffer();
        propertiesData = new Float32Array(buffer);
    }

    //-- MESH --
    const [w, h] = dimNxNy(dim);
    let meshData: Float32Array = new Float32Array();
    if (isMesh) {
        const response_mesh = await fetch(meshUrl);
        if (!response_mesh.ok) {
            console.error("Could not load ", meshUrl);
        }

        const blob_mesh = await response_mesh.blob();
        const contentType_mesh = response_mesh.headers.get("content-type");
        const isPng_mesh = contentType_mesh === "image/png";
        if (isPng_mesh) {
            // Load as Png  with abolute float values.
            meshData = await new Promise((resolve) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(blob_mesh);
                fileReader.onload = () => {
                    const arrayBuffer = fileReader.result;
                    const imgData = png.decode(arrayBuffer as ArrayBuffer);
                    const data = imgData.data; // array of int's

                    const n = data.length;
                    const buffer = new ArrayBuffer(n);
                    const view = new DataView(buffer);
                    for (let i = 0; i < n; i++) {
                        view.setUint8(i, data[i]);
                    }

                    const floatArray = new Float32Array(buffer);
                    resolve(floatArray);
                };
            });
        } else {
            // Load as binary array of floats.
            const buffer = await blob_mesh.arrayBuffer();
            meshData = new Float32Array(buffer);
        }
    }

    // Keep
    //const t0 = performance.now();

    const [mesh, mesh_lines] = makeFullMesh(
        isMesh,
        cellCenteredProperties,
        dim,
        meshData,
        propertiesData,
        colorMapName,
        colorMapFunction,
        colorMapRange,
        colorMapClampColor,
        colorTables
    );

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task took ${(t1 - t0) * 0.001}  seconds.`);

    // create float texture for the properties of the.
    const format = GL.R32F;
    const type = GL.FLOAT;
    const propertyTexture = new Texture2D(gl, {
        width: w,
        height: h,
        format,
        type,
        data: propertiesData,
        mipmaps: false,
        parameters: DEFAULT_TEXTURE_PARAMETERS,
    });

    return Promise.all([
        mesh,
        mesh_lines,
        propertyTexture,
        readOutData,
        readOutDataName,
    ]);
}

export interface MapLayerProps<D> extends ExtendedLayerProps<D> {
    // Url to the height (z values) mesh.
    meshUrl: string;

    // Horizontal extent of the terrain mesh. Format:
    // {
    //     origin: [number, number];     // mesh origin in x, y
    //     increment: [number, number];  // cell size dx, dy
    //     count: [number, number];      // number of cells in both directions.
    // }
    frame: Frame;

    // Url to the properties. (ex, poro or perm values)
    propertiesUrl: string;

    // Contourlines reference point and interval.
    // A value of [-1.0, -1.0] will disable contour lines.
    // default value: [-1.0, -1.0]
    contours: [number, number];

    // Contourlines may be calculated either on depth/z-value or on property/texture value
    // If this is set to false, lines will follow properties instead of depth.
    // In 2D mode this is always the case regardless.
    // default: true
    isContoursDepth: boolean;

    // Enable gridlines.
    // default: false.
    gridLines: boolean;

    // Properties are by default at nodes (corners of cells). Setting this to true will
    // color the cell constant interpreting properties as in the middele of the cell.
    // default: false.
    cellCenteredProperties: boolean;

    // Name of color map. E.g "PORO"
    colorMapName: string;

    // Use color map in this range.
    colorMapRange: [number, number];

    // Clamp colormap to this color at ends.
    // Given as array of three values (r,g,b) e.g: [255, 0, 0]
    // If not set or set to true, it will clamp to color map min and max values.
    // If set to false the clamp color will be completely transparent.
    colorMapClampColor: RGBColor | undefined | boolean;

    // Optional function property.
    // If defined this function will override the color map.
    // Takes a value in the range [0,1] and returns a color.
    colorMapFunction?: colorMapFunctionType;

    // Surface material properties.
    // material: true  = default material, coloring depends on surface orientation and lighting.
    //           false = no material,  coloring is independent on surface orientation and lighting.
    //           or full spec:
    //      material: {
    //           ambient: 0.35,
    //           diffuse: 0.6,
    //           shininess: 32,
    //           specularColor: [255, 255, 255],
    //       }
    material: Material;
}

export default class MapLayer extends CompositeLayer<
    unknown,
    MapLayerProps<unknown>
> {
    initializeState(): void {
        const colorTables = (this.context as DeckGLLayerContext).userData
            .colorTables;

        // Load mesh and texture and store in state.
        const p = load_mesh_and_texture(
            this.props.meshUrl,
            this.props.frame,
            this.props.propertiesUrl,
            this.props.colorMapName,
            this.props.colorMapFunction,
            this.props.colorMapRange,
            this.props.colorMapClampColor,
            colorTables,
            this.props.cellCenteredProperties,
            this.context.gl
        );

        p.then(
            ([
                mesh,
                mesh_lines,
                propertyTexture,
                readOutData,
                readOutDataName,
            ]) => {
                this.setState({
                    mesh,
                    mesh_lines,
                    propertyTexture,
                    readOutData,
                    readOutDataName,
                });
            }
        );
    }

    updateState({
        props,
        oldProps,
    }: {
        props: MapLayerProps<unknown>;
        oldProps: MapLayerProps<unknown>;
    }): void {
        const needs_reload = !isEqual(props, oldProps);
        if (needs_reload) {
            this.initializeState();
        }
    }

    renderLayers(): [privateMapLayer?] {
        if (Object.keys(this.state).length === 0) {
            return [];
        }
        const [minX, minY] = this.props.frame.origin;
        const center = this.props.frame.rotPoint ?? [minX, minY];

        const rotatingModelMatrix = getModelMatrix(
            this.props.frame.rotDeg ?? 0,
            center[0],
            center[1]
        );

        const isMesh =
            typeof this.props.meshUrl !== "undefined" &&
            this.props.meshUrl !== "";
        const layer = new privateMapLayer(
            this.getSubLayerProps<unknown, privateMapLayerProps<unknown>>({
                mesh: this.state.mesh,
                meshLines: this.state.mesh_lines,
                propertyTexture: this.state.propertyTexture,
                readOutData: this.state.readOutData,
                readOutDataName: this.state.readOutDataName,
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                gridLines: this.props.gridLines,
                isContoursDepth: !isMesh ? false : this.props.isContoursDepth,
                material: this.props.material,
            })
        );
        return [layer];
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = layersDefaultProps[
    "MapLayer"
] as MapLayerProps<TerrainMapLayerData>;
