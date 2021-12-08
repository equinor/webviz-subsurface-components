import { CompositeLayer } from "@deck.gl/core";
import TerrainMapLayer, {
    TerrainMapLayerProps,
    TerrainMapLayerData,
    DataItem,
} from "./terrainMapLayer";
import { ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { TerrainLoader } from "@loaders.gl/terrain";
import { ImageLoader } from "@loaders.gl/images";
import { load } from "@loaders.gl/core";
import { COORDINATE_SYSTEM } from "@deck.gl/core";

import { getModelMatrix } from "../utils/layerTools";

const ELEVATION_DECODER = {
    rScaler: -255 * 255, // minus signs -> easy way to invert z-axis.
    gScaler: -255,
    bScaler: -1,
    offset: 0,
};

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
}
export default class Map3DLayer extends CompositeLayer<
    unknown,
    Map3DLayerProps<unknown>
> {
    renderLayers(): [TerrainMapLayer] {
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
                data: [{ position: [0, 0], angle: 0, color: [255, 0, 0] }],

                mesh: load(this.props.mesh, TerrainLoader, {
                    terrain: {
                        elevationDecoder: ELEVATION_DECODER,
                        bounds: this.props.bounds,
                        meshMaxError: this.props.meshMaxError,
                    },
                }),

                texture: load(this.props.propertyTexture, ImageLoader, {}),
                pickable: this.props.pickable,

                getPosition: (d: DataItem) => d.position,
                getColor: (d: DataItem) => d.color,
                getOrientation: (d: DataItem) => [0, d.angle, 0],

                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,

                modelMatrix: rotatingModelMatrix,
            })
        );
        return [layer];
    }
}

Map3DLayer.layerName = "Map3DLayer";
Map3DLayer.defaultProps = layersDefaultProps[
    "Map3DLayer"
] as Map3DLayerProps<TerrainMapLayerData>;
