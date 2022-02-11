import { CompositeLayer } from "@deck.gl/core";
import PrivateMeshLayer, {
    PrivateMeshLayerProps,
    PrivateMeshLayerData,
} from "./PrivateMeshLayer";
import { ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { getModelMatrix } from "../utils/layerTools";
import { TerrainLoader } from "@loaders.gl/terrain";
import { load } from "@loaders.gl/core";
import { Vector3 } from "@math.gl/core";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";
import GL from "@luma.gl/constants";
import * as png from "@vivaxy/png";

const ELEVATION_DECODER = {
    rScaler: -255 * 255, // minus signs -> easy way to invert z-axis.
    gScaler: -255,
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
                //no_defined += 1;
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
    renderLayers(): [PrivateMeshLayer] {
        let meshPromise = load(this.props.mesh, TerrainLoader, {
            terrain: {
                elevationDecoder: ELEVATION_DECODER,
                bounds: this.props.bounds,
                meshMaxError: this.props.meshMaxError,
                skirtHeight: 0.0,
            },
        });

        // Note: mesh contains triangles. No normals.
        if (this.props.enableSmoothShading) {
            meshPromise = meshPromise.then(add_normals);
        }

        // Download texture (as an ImageData structure) and apply colormap to it. Texture image is encoded Float32 for each pixel.
        // Note: Using ImageLoader in this case does not work as the pixel values are not always exact.
        // To decode png with exact values we can use a separate library like
        // https://github.com/arian/pngjs (which ImagaLoader uses when not in a browser (node.js)) or this
        // https://github.com/vivaxy/png
        const imageDataPromise = fetch(this.props.propertyTexture)
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

        // Apply colormap to the pixels to generate color texture.
        const texturePromise = imageDataPromise.then((imageData) => {
            // Note: take copy here? "structuredClone()"
            imageData = applyColorMap(
                imageData as ImageData,
                this.props.colorMapRange,
                this.props.colorMapName,
                this.props.valueRange,
                (this.context as DeckGLLayerContext).userData.colorTables
            );

            return Promise.resolve(imageData);
        });

        const rotatingModelMatrix = getModelMatrix(
            this.props.rotDeg,
            this.props.bounds[0] as number, // Rotate around upper left corner of bounds
            this.props.bounds[3] as number
        );

        const layer = new PrivateMeshLayer(
            this.getSubLayerProps<
                PrivateMeshLayerData,
                PrivateMeshLayerProps<PrivateMeshLayerData>
            >({
                mesh: meshPromise,
                texture: texturePromise,
                propertyValuesImageData: imageDataPromise,
                textureParameters: DEFAULT_TEXTURE_PARAMETERS,
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                colorMapName: this.props.colorMapName,
                colorMapRange: this.props.colorMapRange,
                isReadoutDepth: this.props.isReadoutDepth,
            })
        );
        return [layer];
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = layersDefaultProps[
    "MapLayer"
] as MapLayerProps<PrivateMeshLayerData>;
