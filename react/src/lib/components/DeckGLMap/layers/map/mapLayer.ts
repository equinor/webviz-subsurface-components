import { CompositeLayer } from "@deck.gl/core";
import TerrainMapLayer, {
    TerrainMapLayerProps,
    TerrainMapLayerData,
    Material,
    DEFAULT_TEXTURE_PARAMETERS,
} from "./terrainMapLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { RGBColor } from "@deck.gl/core/utils/color";
import { layersDefaultProps } from "../layersDefaultProps";
import { Vector3 } from "@math.gl/core";
import { getModelMatrix } from "../utils/layerTools";
import { isEqual } from "lodash";
import Delatin from "./delatin"; // Note: this is copied from terrain loader.
import { Texture2D } from "@luma.gl/core";
import GL from "@luma.gl/constants";

export const readoutMatrixSize = 150;

type MeshType = {
    attributes: {
        POSITION: { value: Float32Array; size: number };
        TEXCOORD_0: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
    };
    indices: { value: Uint32Array; size: number };
};

// These two types both describes the mesh' extent in the horizontal plane.
type Bounds = [number, number, number, number];
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

function getMinMax(dim: Frame): Bounds {
    const nx = dim.count[0];
    const ny = dim.count[1];

    const dx = dim.increment[0];
    const dy = dim.increment[1];

    const xmin = dim.origin[0];
    const ymin = dim.origin[1];

    const xmax = xmin + nx * dx;
    const ymax = ymin + ny * dy;

    return [xmin, ymin, xmax, ymax];
}

function dimNxNy(dim: Frame): [number, number] {
    const nx = dim.count[0];
    const ny = dim.count[1];

    return [nx, ny];
}

function replaceNaN(meshData: Float32Array, value: number) {
    for (let i = 0; i < meshData.length; i++) {
        if (isNaN(meshData[i])) {
            meshData[i] = value;
        }
    }
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

// Takes a 2D array and returns a resampled square fixed size copy.
function makeFixedSizeCopy(
    data: Float32Array,
    width: number,
    height: number
): Float32Array {
    const sz = readoutMatrixSize;
    const ret = new Float32Array(sz * sz);

    const stride_w = width / sz;
    const stride_h = height / sz;

    for (let m = 0; m < sz; m++) {
        for (let n = 0; n < sz; n++) {
            const w = Math.round(n * stride_w);
            const h = Math.round(m * stride_h);
            const i = m * sz + n;
            const j = h * width + w;
            ret[i] = data[j];
        }
    }
    return ret;
}

function makeMesh(
    dim: Frame,
    meshData: Float32Array,
    meshMaxError: number
): MeshType {
    const [width, height] = dimNxNy(dim);

    const terrain = new Float32Array(meshData);
    const tin = new Delatin(terrain, width, height);

    tin.run(meshMaxError);
    // @ts-expect-error keep
    const { coords, triangles } = tin;
    const vertices = coords;

    // Note: taken (and modified) from parse-terrain.js from terrain loader.
    //const gridSize = width; // + 1;
    const numOfVerticies = vertices.length / 2;
    // vec3. x, y in pixels, z in meters
    const positions = new Float32Array(numOfVerticies * 3);
    // vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
    const texCoords = new Float32Array(numOfVerticies * 2);

    const [minX, minY, maxX, maxY] = getMinMax(dim);
    const xScale = (maxX - minX) / (width - 1);
    const yScale = (maxY - minY) / (height - 1);

    for (let i = 0; i < numOfVerticies; i++) {
        const x = vertices[i * 2];
        const y = vertices[i * 2 + 1];
        //const pixelIdx = y * gridSize + x;

        positions[3 * i + 0] = x * xScale + minX;
        positions[3 * i + 1] = -y * yScale + maxY;
        positions[3 * i + 2] = -tin.heightAt(x, y);

        texCoords[2 * i + 0] = x / (width - 1);
        texCoords[2 * i + 1] = y / (height - 1);
    }

    const mesh = {
        attributes: {
            POSITION: { value: new Float32Array(positions), size: 3 },
            TEXCOORD_0: { value: new Float32Array(texCoords), size: 2 },
        },
        indices: { value: new Uint32Array(triangles), size: 1 },
    };

    // Keep this. Useful info for the user to adjust "maxMeshError" if necessary.
    console.debug(
        "no of triangles, mesh width, height: ",
        triangles.length / 3,
        width,
        height
    );
    return mesh;
}

function removeInactiveTriangles(resolved_mesh: MeshType) {
    const vertexs = resolved_mesh.attributes.POSITION.value;
    let indices = resolved_mesh.indices.value;
    let ntriangles = indices.length / 3;

    ////////////////////////////////////////////////////////////////
    // Remove all triangles that are in undefined areas. That is triangles which
    // have one or more corner at zero depth.
    const indices_reduced = [];
    for (let t = 0; t < ntriangles; t++) {
        const i0 = indices[t * 3 + 0];
        const i1 = indices[t * 3 + 1];
        const i2 = indices[t * 3 + 2];

        // Triangles' three corner's z values.
        const v0Z = vertexs[i0 * 3 + 2];
        const v1Z = vertexs[i1 * 3 + 2];
        const v2Z = vertexs[i2 * 3 + 2];

        if (v0Z !== 0 && v1Z !== 0 && v2Z !== 0) {
            indices_reduced.push(i0);
            indices_reduced.push(i1);
            indices_reduced.push(i2);
        }
    }

    resolved_mesh.indices.value = new Uint32Array(indices_reduced);
    indices = resolved_mesh.indices.value;
    ntriangles = indices.length / 3;
}

function add_normals(resolved_mesh: MeshType) {
    const vertexs = resolved_mesh.attributes.POSITION.value;
    const indices = resolved_mesh.indices.value;
    const ntriangles = indices.length / 3;

    // Calculate one normal pr triangle. And record the triangles each vertex' belongs to.
    const no_unique_vertexes = vertexs.length / 3;
    const vertex_triangles = Array(no_unique_vertexes); // for each vertex a list of triangles it belongs to.
    for (let i = 0; i < no_unique_vertexes; i++) {
        vertex_triangles[i] = new Set();
    }

    const triangle_normals = Array(ntriangles);
    for (let t = 0; t < ntriangles; t++) {
        const i0 = indices[t * 3 + 0];
        const i1 = indices[t * 3 + 1];
        const i2 = indices[t * 3 + 2];

        vertex_triangles[i0].add(t);
        vertex_triangles[i1].add(t);
        vertex_triangles[i2].add(t);

        // Triangles' three corners.
        const v0 = new Vector3(
            vertexs[i0 * 3 + 0],
            vertexs[i0 * 3 + 1],
            vertexs[i0 * 3 + 2]
        );
        const v1 = new Vector3(
            vertexs[i1 * 3 + 0],
            vertexs[i1 * 3 + 1],
            vertexs[i1 * 3 + 2]
        );
        const v2 = new Vector3(
            vertexs[i2 * 3 + 0],
            vertexs[i2 * 3 + 1],
            vertexs[i2 * 3 + 2]
        );

        const vec1 = v1.subtract(v0);
        const vec2 = v2.subtract(v0);

        const normal = vec1.cross(vec2).normalize();
        triangle_normals[t] = normal;
    }

    // Calculate normals. The vertex normal will be the mean of the normals
    // of every triangle the vertex belongs to.
    const normals = Array(vertexs.length).fill(0.0);

    for (let i = 0; i < no_unique_vertexes; i++) {
        const triangles = [...vertex_triangles[i]];
        // Set normal to mean of all triangle normals.
        const v =
            triangles.length !== 0
                ? triangle_normals[triangles[0]]
                : new Vector3(0.0, 0.0, 1.0);
        for (let t = 1; t < triangles.length; t++) {
            v.add(triangle_normals[triangles[t]]);
        }
        v.normalize();

        const idx = i * 3;
        normals[idx + 0] = v[0];
        normals[idx + 1] = v[1];
        normals[idx + 2] = v[2];
    }

    resolved_mesh.attributes.normals = {
        value: new Float32Array(normals),
        size: 3,
    };

    return resolved_mesh;
}

async function load_mesh_and_texture(
    meshUrl: string,
    dim: Frame,
    meshMaxError: number,
    enableSmoothShading: boolean,
    propertiesUrl: string,
    gl: unknown
) {
    let isMesh = typeof meshUrl !== "undefined" && meshUrl !== "";
    const isTexture =
        typeof propertiesUrl !== "undefined" && propertiesUrl !== "";

    if (!isMesh && !isTexture) {
        console.error("Error. One or both of texture and mesh must be given!");
    }

    if (isMesh && !isTexture) {
        propertiesUrl = meshUrl;
    } else if (!isMesh && isTexture) {
        meshUrl = propertiesUrl;
        isMesh = true;
    }

    //-- MESH --
    const [w, h] = dimNxNy(dim);
    let meshData: Float32Array;
    let mesh: MeshType;
    if (isMesh) {
        const response = await fetch(meshUrl);
        if (!response.ok) {
            console.error("Could not load ", meshUrl);
        }
        const buffer = await response.arrayBuffer();
        meshData = new Float32Array(buffer);

        replaceNaN(meshData, 0.0);
        mesh = makeMesh(dim, meshData, meshMaxError);
        meshData = makeFixedSizeCopy(meshData, w, h);

        removeInactiveTriangles(mesh);

        // Note: mesh contains triangles. No normals they must be added.
        if (enableSmoothShading) {
            mesh = add_normals(mesh);
        }
    } else {
        // Mesh data is missing.
        // Make a flat square size of bounds using two triangles.  z = 0.
        const [minX, minY, maxX, maxY] = getMinMax(dim);
        const p0 = [minX, minY, 0.0];
        const p1 = [minX, maxY, 0.0];
        const p2 = [maxX, maxY, 0.0];
        const p3 = [maxX, minY, 0.0];
        const vertexes = [...p0, ...p1, ...p2, ...p3];
        const texture_coord = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0];

        mesh = {
            attributes: {
                POSITION: { value: new Float32Array(vertexes), size: 3 },
                TEXCOORD_0: { value: new Float32Array(texture_coord), size: 2 },
            },
            indices: { value: new Uint32Array([0, 1, 3, 1, 3, 2]), size: 1 },
        };

        const [w, h] = [2, 2];
        meshData = new Float32Array([0, 0, 0, 0]);
        meshData = makeFixedSizeCopy(meshData, w, h);
    }

    //-- PROPERTY TEXTURE. --
    const response = await fetch(propertiesUrl);
    if (!response.ok) {
        console.error("Could not load ", propertiesUrl);
    }
    const buffer = await response.arrayBuffer();
    const data = new Float32Array(buffer);

    // create float texture.
    const propertyValueRange = getFloat32ArrayMinMax(data);
    const format = GL.R32F;
    const type = GL.FLOAT;
    const texture = new Texture2D(gl, {
        width: w,
        height: h,
        format,
        type,
        data,
        mipmaps: false,
        parameters: DEFAULT_TEXTURE_PARAMETERS,
    });

    const propertyData = makeFixedSizeCopy(data, w, h);

    return Promise.all([
        mesh,
        propertyValueRange,
        meshData,
        propertyData,
        texture,
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

    // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
    // default: 1.
    meshMaxError: number;

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

    // Will calculate normals and enable phong shading.
    enableSmoothShading: boolean;

    // Surface material properties.
    // material: true  = default material,
    //           false = no material,
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
        // Load mesh and texture and store in state.
        const p = load_mesh_and_texture(
            this.props.meshUrl,
            this.props.frame,
            this.props.meshMaxError,
            this.props.enableSmoothShading,
            this.props.propertiesUrl,
            this.context.gl
        );

        p.then(
            ([mesh, propertyValueRange, meshData, propertyData, texture]) => {
                this.setState({
                    mesh,
                    propertyValueRange,
                    meshData,
                    propertyData,
                    texture,
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
        const needs_reload =
            !isEqual(props.meshUrl, oldProps.meshUrl) ||
            !isEqual(props.frame, oldProps.frame) ||
            !isEqual(props.meshMaxError, oldProps.meshMaxError) ||
            !isEqual(props.enableSmoothShading, oldProps.enableSmoothShading) ||
            !isEqual(props.propertiesUrl, oldProps.propertiesUrl);

        if (needs_reload) {
            // Reload mesh and texture.
            this.initializeState();
        }
    }

    renderLayers(): [TerrainMapLayer] {
        const [width] = dimNxNy(this.props.frame);
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

        const layer = new TerrainMapLayer(
            this.getSubLayerProps<
                TerrainMapLayerData,
                TerrainMapLayerProps<TerrainMapLayerData>
            >({
                mesh: this.state.mesh,
                propertyValueRange: this.state.propertyValueRange,
                propertyTexture: this.state.texture,
                meshData: this.state.meshData,
                propertyData: this.state.propertyData,
                meshWidth: width,
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                colorMapName: this.props.colorMapName,
                colorMapFunction: this.props.colorMapFunction,
                colorMapRange: this.props.colorMapRange,
                colorMapClampColor: this.props.colorMapClampColor,
                isContoursDepth: !isMesh ? false : this.props.isContoursDepth,
                material: this.props.material,
                wireframe: false,
            })
        );
        return [layer];
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = layersDefaultProps[
    "MapLayer"
] as MapLayerProps<TerrainMapLayerData>;
