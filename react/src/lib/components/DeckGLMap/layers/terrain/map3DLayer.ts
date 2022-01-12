import { CompositeLayer } from "@deck.gl/core";
import TerrainMapLayer, {
    TerrainMapLayerProps,
    TerrainMapLayerData,
} from "./terrainMapLayer";
import { ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { TerrainLoader } from "@loaders.gl/terrain";
import { ImageLoader } from "@loaders.gl/images";
import { load } from "@loaders.gl/core";
import { Vector3 } from "@math.gl/core";
import { getModelMatrix } from "../utils/layerTools";

const ELEVATION_DECODER = {
    rScaler: -255 * 255, // minus signs -> easy way to invert z-axis.
    gScaler: -255,
    bScaler: -1,
    offset: 0,
};

type MeshType = {
    attributes: {
        POSITION: { value: number[] };
        normals: { value: Float32Array; size: number };
    };
    indices: { value: number[] };
};

function add_normals(resolved_mesh: MeshType) {
    const vertexs = resolved_mesh.attributes.POSITION.value;
    const indices = resolved_mesh.indices.value;
    const ntriangles = indices.length / 3;

    //Calculate one normal pr triangle. And record the triangles each vertex' belongs to.
    const no_unique_vertexes = vertexs.length / 3;
    const vertex_triangles = Array(no_unique_vertexes); // for each vertex a list of triangles it belogs to.
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
    contours: [number, number];

    // Name of color map. E.g "PORO"
    colorMapName: string;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // If true readout will be z value (depth). Otherwise it is the texture property value.
    isReadoutDepth: boolean;

    // Will calculate normals and enable phong shading.
    enableSmoothShading: boolean;
}

export default class Map3DLayer extends CompositeLayer<
    unknown,
    Map3DLayerProps<unknown>
> {
    renderLayers(): [TerrainMapLayer] {
        let mesh = load(this.props.mesh, TerrainLoader, {
            terrain: {
                elevationDecoder: ELEVATION_DECODER,
                bounds: this.props.bounds,
                meshMaxError: this.props.meshMaxError,
                skirtHeight: 0.0,
            },
        });

        // Note: mesh contains triangles. No normals.
        if (this.props.enableSmoothShading) {
            mesh = mesh.then(add_normals);
        }

        const rotatingModelMatrix = getModelMatrix(
            this.props.rotDeg,
            this.props.bounds[0] as number, // Rotate around upper left corner of bounds
            this.props.bounds[3] as number
        );

        const layer = new TerrainMapLayer(
            this.getSubLayerProps<
                TerrainMapLayerData,
                TerrainMapLayerProps<TerrainMapLayerData>
            >({
                mesh,
                texture: load(this.props.propertyTexture, ImageLoader, {}),
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                colorMapName: this.props.colorMapName,
                valueRange: this.props.valueRange,
                colorMapRange: this.props.colorMapRange,
                isReadoutDepth: this.props.isReadoutDepth,
            })
        );
        return [layer];
    }
}

Map3DLayer.layerName = "Map3DLayer";
Map3DLayer.defaultProps = layersDefaultProps[
    "Map3DLayer"
] as Map3DLayerProps<TerrainMapLayerData>;
