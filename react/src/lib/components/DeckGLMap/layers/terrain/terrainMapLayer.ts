import { SimpleMeshLayer } from "@deck.gl/mesh-layers"; // XXX RENAME LAYER TIL NOE MED MESH??
import { SimpleMeshLayerProps } from "@deck.gl/mesh-layers/simple-mesh-layer/simple-mesh-layer";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import fsShader from "!!raw-loader!./terrainmap.fs.glsl";

const DECODER = {
    rScaler: 256 * 256,
    gScaler: 256,
    bScaler: 1,
    offset: 0,
};

export type DataItem = {
    position: [number, number];
    angle: number;
    color: [number, number, number];
};

export type TerrainMapLayerData = [DataItem?];

export type TerrainMapLayerProps<D> = SimpleMeshLayerProps<D>;

const defaultProps = {
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
};

// This is a private layer used only by the composite Map3DLayer.
// It is an extension of SimpleMeshLayer but with modified fragment shader
// so that the texture pixel values can be used as lookup in  a supplied color map.
export default class TerrainMapLayer extends SimpleMeshLayer<
    TerrainMapLayerData,
    TerrainMapLayerProps<TerrainMapLayerData>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ uniforms }: any): void {
        super.draw({
            uniforms: {
                ...uniforms,
            },
        });
    }

    getShaders(): unknown {
        const parentShaders = super.getShaders();
        // Overwrite the default fragment shader with ours.
        parentShaders.fs = fsShader;
        return parentShaders;
    }

    // For now, use `any` for the picking types.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.color) {
            return info;
        }

        const r = info.color[0] * DECODER.rScaler;
        const g = info.color[1] * DECODER.gScaler;
        const b = info.color[2] * DECODER.bScaler;

        const floatScaler = 1.0 / (256.0 * 256.0 * 256.0 - 1.0);

        const value = (r + g + b) * floatScaler;

        return {
            ...info,
            propertyValue: value,
        };
    }
}

TerrainMapLayer.layerName = "TerrainMapLayer";
TerrainMapLayer.defaultProps = defaultProps;
