import { CompositeLayer } from "@deck.gl/core";
import TerrainMapLayer, {
    TerrainMapLayerProps,
    TerrainMapLayerData,
    DECODER,
    Material,
} from "./terrainMapLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { RGBColor } from "@deck.gl/core/utils/color";
import { layersDefaultProps } from "../layersDefaultProps";
import { TerrainLoader } from "@loaders.gl/terrain";
import { ImageLoader } from "@loaders.gl/images";
import { load } from "@loaders.gl/core";
import { Vector3 } from "@math.gl/core";
import { getModelMatrix } from "../utils/layerTools";
import { isEqual } from "lodash";

type MeshType = {
    attributes: {
        POSITION: { value: Float32Array; size: number };
        TEXCOORD_0: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
    };
    indices: { value: Uint32Array; size: number };
};

function mapToRange(resolved_mesh: MeshType, meshValueRange: [number, number]) {
    const floatScaler = 1.0 / (256.0 * 256.0 * 256.0 - 1.0);
    const [min, max] = meshValueRange;
    const delta = max - min;

    const vertexs = resolved_mesh.attributes.POSITION.value;
    const nvertexs = vertexs.length / 3;

    for (let i = 0; i < nvertexs; i++) {
        let Z = vertexs[i * 3 + 2];
        Z = Z * floatScaler; // maps to [0-1]
        Z = Z * delta + min;
        vertexs[i * 3 + 2] = -Z; // depths are positive along negative z axis.
    }

    return resolved_mesh;
}

function add_normals(resolved_mesh: MeshType) {
    const vertexs = resolved_mesh.attributes.POSITION.value;
    const indices = resolved_mesh.indices.value;
    const ntriangles = indices.length / 3;

    //Calculate one normal pr triangle. And record the triangles each vertex' belongs to.
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

    // Calculate normals. The vertex normal will be the mean of the normals of every triangle the vertex
    // belongs to.
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
    mesh_name: string,
    bounds: [number, number, number, number],
    meshMaxError: number,
    meshValueRange: [number, number],
    enableSmoothShading: boolean,
    texture_name: string
) {
    const isMesh = mesh_name !== "";
    const isTexture = texture_name !== "";

    if (!isMesh && !isTexture) {
        console.log("Error. One or both of texture and mesh must be given!");
    }

    let mesh: MeshType;
    if (isMesh) {
        mesh = await load(mesh_name, TerrainLoader, {
            terrain: {
                elevationDecoder: DECODER,
                bounds,
                meshMaxError,
                skirtHeight: 0.0,
            },
            worker: false,
        });

        // Remap height to meshValueRange
        mesh = mapToRange(mesh, meshValueRange);

        // Note: mesh contains triangles. No normals they must be added.
        if (enableSmoothShading) {
            mesh = add_normals(mesh);
        }
    } else {
        // Mesh data is missing.
        // Make a flat square size of bounds using two triangles.  z = 0.
        const left = bounds[0];
        const bottom = bounds[1];
        const right = bounds[2];
        const top = bounds[3];
        const p0 = [left, bottom, 0.0];
        const p1 = [left, top, 0.0];
        const p2 = [right, top, 0.0];
        const p3 = [right, bottom, 0.0];
        const vertexes = [...p0, ...p1, ...p2, ...p3];
        const texture_coord = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0];

        mesh = {
            attributes: {
                POSITION: { value: new Float32Array(vertexes), size: 3 },
                TEXCOORD_0: { value: new Float32Array(texture_coord), size: 2 },
            },
            indices: { value: new Uint32Array([0, 1, 3, 1, 3, 2]), size: 1 },
        };
    }

    const image_name = isTexture ? texture_name : mesh_name;
    const texture = await load(image_name, ImageLoader, {});

    return Promise.all([mesh, texture]);
}

export interface Map3DLayerProps<D> extends ExtendedLayerProps<D> {
    // Url to png image representing the height mesh.
    mesh: string;

    // Bounding box of the terrain mesh, [minX, minY, maxX, maxY] in world coordinates
    bounds: [number, number, number, number];

    // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
    meshMaxError: number;

    // Url to png image for map properties. (ex, poro or perm values as a texture)
    propertyTexture: string;

    // Rotates around 'bounds' upper left corner counterclockwise in degrees.
    rotDeg: number;

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

    // Min and max of map height values values.
    meshValueRange: [number, number];

    // Min and max property values.
    propertyValueRange: [number, number];

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

    // If true readout will be z value (depth). Otherwise it is the texture property value.
    isReadoutDepth: boolean;

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

export default class Map3DLayer extends CompositeLayer<
    unknown,
    Map3DLayerProps<unknown>
> {
    initializeState(): void {
        // Load mesh and texture and store in state.
        const p = load_mesh_and_texture(
            this.props.mesh,
            this.props.bounds,
            this.props.meshMaxError,
            this.props.meshValueRange,
            this.props.enableSmoothShading,
            this.props.propertyTexture
        );

        p.then(([mesh, texture]) => {
            this.setState({
                mesh,
                texture,
            });
        });
    }

    updateState({
        props,
        oldProps,
    }: {
        props: Map3DLayerProps<unknown>;
        oldProps: Map3DLayerProps<unknown>;
    }): void {
        const needs_reload =
            !isEqual(props.mesh, oldProps.mesh) ||
            !isEqual(props.bounds, oldProps.bounds) ||
            !isEqual(props.meshMaxError, oldProps.meshMaxError) ||
            !isEqual(props.meshValueRange, oldProps.meshValueRange) ||
            !isEqual(props.enableSmoothShading, oldProps.enableSmoothShading) ||
            !isEqual(props.propertyTexture, oldProps.propertyTexture);

        if (needs_reload) {
            // Reload mesh and texture.
            this.initializeState();
        }
    }

    renderLayers(): [TerrainMapLayer] {
        const rotatingModelMatrix = getModelMatrix(
            this.props.rotDeg,
            this.props.bounds[0] as number, // Rotate around upper left corner of bounds
            this.props.bounds[3] as number
        );

        const isMesh =
            typeof this.props.mesh !== "undefined" && this.props.mesh !== "";

        const layer = new TerrainMapLayer(
            this.getSubLayerProps<
                TerrainMapLayerData,
                TerrainMapLayerProps<TerrainMapLayerData>
            >({
                mesh: this.state.mesh,
                texture: this.state.texture,
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                colorMapName: this.props.colorMapName,
                colorMapFunction: this.props.colorMapFunction,
                propertyValueRange: this.props.propertyValueRange,
                colorMapRange: this.props.colorMapRange,
                colorMapClampColor: this.props.colorMapClampColor,
                isReadoutDepth: this.props.isReadoutDepth,
                isContoursDepth: !isMesh ? false : this.props.isContoursDepth,
                material: this.props.material,
            })
        );
        return [layer];
    }
}

Map3DLayer.layerName = "Map3DLayer";
Map3DLayer.defaultProps = layersDefaultProps[
    "Map3DLayer"
] as Map3DLayerProps<TerrainMapLayerData>;
