import { CompositeLayer } from "@deck.gl/core";
import PrivateMeshLayer, {
    PrivateMeshLayerProps,
    PrivateMeshLayerData,
} from "./PrivateMeshLayer";
import { ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { getModelMatrix } from "../utils/layerTools";
import { TerrainLoader } from "@loaders.gl/terrain";
// XXX import { ImageLoader } from "@loaders.gl/images";
import { load } from "@loaders.gl/core";
import { Vector3 } from "@math.gl/core";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import GL from "@luma.gl/constants";
import * as png from "@vivaxy/png";
import { DeckGLLayerContext } from "../../components/Map";
import structuredClone from "@ungap/structured-clone";
import { isEqual } from "lodash";

const DECODER = {
    rScaler: -256 * 256, // minus signs -> easy way to invert z-axis.
    gScaler: -256,
    bScaler: -1,
    offset: 0,
};

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

type MeshType = {
    attributes: {
        POSITION: { value: Float32Array; size: number };
        TEXCOORD_0: { value: Float32Array; size: number };
        normals?: { value: Float32Array; size: number };
    };
    indices: { value: Uint32Array; size: number };
};

function add_normals(resolved_mesh: MeshType) {
    const vertexs = resolved_mesh.attributes.POSITION.value;
    let indices = resolved_mesh.indices.value;
    let ntriangles = indices.length / 3;

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

function applyColorMap(
    resolved_image: ImageData,
    colorMapRange: [number, number],
    colorMapName: string,
    valueRange: [number, number],
    colorTables: colorTablesArray
) {
    // Precalculate colors to save time.
    const colors = [];
    for (let i = 0; i < 256; i++) {
        const rgb = rgbValues(i / 255.0, colorMapName, colorTables); // Note: The call to rgbValues is very slow.
        let color: number[] = [];
        if (rgb != undefined) {
            if (Array.isArray(rgb)) {
                color = rgb;
            } else {
                color = [rgb.r, rgb.g, rgb.b];
            }
        }
        colors.push(color);
    }

    // Get value range.
    const data = resolved_image.data;
    const float_view = new Float32Array(data.buffer, 0, data.length / 4);

    let valueRangeMin = +9999999.9;
    let valueRangeMax = -9999999.9;
    if (typeof valueRange === "undefined") {
        // Find value range.
        for (let i = 0; i < data.length; i += 4) {
            const propertyValue = float_view[i / 4];

            const defined = !(
                isNaN(propertyValue) ||
                propertyValue === undefined ||
                propertyValue === null ||
                propertyValue === 0
            );
            if (defined) {
                valueRangeMin =
                    propertyValue < valueRangeMin
                        ? propertyValue
                        : valueRangeMin;
                valueRangeMax =
                    propertyValue > valueRangeMax
                        ? propertyValue
                        : valueRangeMax;
            }
        }
    } else {
        valueRangeMin = valueRange[0];
        valueRangeMax = valueRange[1];
    }

    let colorMapRangeMin = colorMapRange?.[0] ?? valueRangeMin;
    let colorMapRangeMax = colorMapRange?.[1] ?? valueRangeMax;
    if (colorMapRangeMax < colorMapRangeMin) {
        const temp = colorMapRangeMax;
        colorMapRangeMax = colorMapRangeMin;
        colorMapRangeMin = temp;
    }

    // Apply color map.
    for (let i = 0; i < data.length; i += 4) {
        const propertyValue = float_view[i / 4];

        let t = 0.0;
        const defined = !(
            Number.isNaN(propertyValue) ||
            propertyValue === undefined ||
            propertyValue === null ||
            propertyValue === 0
        );
        if (defined) {
            t = propertyValue;
            t = (t - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
            t = Math.max(0.0, t);
            t = Math.min(1.0, t);
        }

        const color = colors[Math.floor(t * 255.0)];
        data[i + 0] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
        data[i + 3] = defined ? 255 : 0; // Undefined values is set invisible.
    }

    return resolved_image;
}

function load_texture(texture_name: string) {
    const imageData = fetch(texture_name)
        .then((response) => {
            return response.blob();
        })
        .then((blob) => {
            return new Promise((resolve) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(blob);
                fileReader.onload = () => {
                    const arrayBuffer = fileReader.result;
                    const imgData = png.decode(arrayBuffer as ArrayBuffer);
                    const data = new Uint8ClampedArray(imgData.data);
                    const imageData = new ImageData(
                        data,
                        imgData.width,
                        imgData.height
                    );
                    resolve(imageData);
                };
            });
        })
        .then((imageData) => {
            return Promise.resolve(imageData);
        });

    return imageData;
}

async function load_mesh_and_texture(
    mesh_name: string,
    bounds: [number, number, number, number],
    meshMaxError: number,
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
    const texture = await load_texture(image_name); // load texture as ImageData structure.

    return Promise.all([mesh, texture]);
}

export interface MapLayerProps<D> extends ExtendedLayerProps<D> {
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

    // Min and max property values. If not given these will be calcultated automatically from the data.
    valueRange: [number, number];

    // Name of color map. E.g "PORO"
    colorMapName: string;

    // Use color map in this range.
    colorMapRange: [number, number];

    // If true readout will be z value (depth). Otherwise it is the texture property value.
    isReadoutDepth: boolean;

    // Will calculate normals and enable phong shading.
    enableSmoothShading: boolean;
}

export default class MapLayer extends CompositeLayer<
    unknown,
    MapLayerProps<unknown>
> {
    initializeState(): void {
        // Load mesh and texture and store in state.
        const p = load_mesh_and_texture(
            this.props.mesh,
            this.props.bounds,
            this.props.meshMaxError,
            this.props.enableSmoothShading,
            this.props.propertyTexture
        );

        p.then(([mesh, texture]) => {
            // Apply colormap to the pixels to generate color texture.
            // Need to take a copy so not to destroy original data.
            let color_texture = structuredClone(texture); // XXX check if this is still neccessary.
            color_texture = applyColorMap(
                color_texture as ImageData,
                this.props.colorMapRange,
                this.props.colorMapName,
                this.props.valueRange,
                (this.context as DeckGLLayerContext).userData.colorTables
            );

            this.setState({
                mesh,
                color_texture,
            });
        });
    }

    updateState({
        props,
        oldProps,
    }: {
        props: MapLayerProps<unknown>;
        oldProps: MapLayerProps<unknown>;
    }): void {
        const needs_reload =
            !isEqual(props.mesh, oldProps.mesh) ||
            !isEqual(props.bounds, oldProps.bounds) ||
            !isEqual(props.meshMaxError, oldProps.meshMaxError) ||
            !isEqual(props.enableSmoothShading, oldProps.enableSmoothShading) ||
            !isEqual(props.propertyTexture, oldProps.propertyTexture);

        if (needs_reload) {
            // Reload mesh and texture.
            this.initializeState();
        }
    }

    renderLayers(): [PrivateMeshLayer] {
        const rotatingModelMatrix = getModelMatrix(
            this.props.rotDeg,
            this.props.bounds[0] as number, // Rotate around upper left corner of bounds
            this.props.bounds[3] as number
        );

        const isMesh =
            typeof this.props.mesh !== "undefined" && this.props.mesh !== "";

        const layer = new PrivateMeshLayer(
            this.getSubLayerProps<
                PrivateMeshLayerData,
                PrivateMeshLayerProps<PrivateMeshLayerData>
            >({
                mesh: this.state.mesh,
                texture: this.state.color_texture,
                propertyValuesImageData: this.state.texture,
                textureParameters: DEFAULT_TEXTURE_PARAMETERS,
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                colorMapName: this.props.colorMapName,
                colorMapRange: this.props.colorMapRange,
                isReadoutDepth: this.props.isReadoutDepth,
                isContoursDepth: isMesh,
            })
        );
        return [layer];
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = layersDefaultProps[
    "MapLayer"
] as MapLayerProps<PrivateMeshLayerData>;
