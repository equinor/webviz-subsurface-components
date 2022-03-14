import { SimpleMeshLayer } from "@deck.gl/mesh-layers";
import { SimpleMeshLayerProps } from "@deck.gl/mesh-layers/simple-mesh-layer/simple-mesh-layer";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import fsShader from "./map.fs.glsl";

export type DataItem = {
    position: [number, number];
    angle: number;
    color: [number, number, number];
};

export type PrivateMeshLayerData = [DataItem?];

export interface PrivateMeshLayerProps<D> extends SimpleMeshLayerProps<D> {
    // Contourlines reference point and interval.
    contours: [number, number];

    // Contourlines may be calculated either on depth/z-value or on property/texture value
    isContoursDepth: boolean;

    // Property values in a ImageData structure.
    propertyValuesImageData: ImageData;

    //If true readout will be z value (depth). Otherwise it is the texture property value.
    isReadoutDepth: boolean;
}

const defaultProps = {
    data: [{ position: [0, 0], angle: 0, color: [255, 0, 0, 0] }], // note transparent color so naked mesh (without texture) will be invisible.
    propertyValuesImageData: { value: null, type: "object", async: true },
    getPosition: (d: DataItem) => d.position,
    getColor: (d: DataItem) => d.color,
    getOrientation: (d: DataItem) => [0, d.angle, 0],
    contours: [-1, -1],
    isReadoutDepth: false,
    isContoursDepth: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 600,
        specularColor: [255, 255, 255],
    },
};

// This is a private layer used only by the composite MapLayer.
// It is an extension of SimpleMeshLayer but with modified fragment shader
// so that the texture pixel values can be used as lookup in  a supplied color map.
export default class PrivateMeshLayer extends SimpleMeshLayer<
    PrivateMeshLayerData,
    PrivateMeshLayerProps<PrivateMeshLayerData>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ uniforms }: any): void {
        const contourReferencePoint = this.props.contours[0] ?? -1.0;
        const contourInterval = this.props.contours[1] ?? -1.0;
        const isReadoutDepth = this.props.isReadoutDepth;
        const isContoursDepth = this.props.isContoursDepth;

        super.draw({
            uniforms: {
                ...uniforms,
                contourReferencePoint,
                contourInterval,
                isReadoutDepth,
                isContoursDepth,
            },
        });
    }

    getShaders(): unknown {
        const parentShaders = super.getShaders();
        // Overwrite the default fragment shader with ours.
        parentShaders.fs = fsShader;

        return {
            ...parentShaders,

            // Inject this into vertex shader. Vi want to export vertex world position to
            // fragment shader for making contour lines.
            inject: {
                "vs:#decl": `
                  out vec3 worldPos;
                `,

                "vs:#main-start": `
                   worldPos = positions;
                `,
            },
        };
    }

    decodePickingColor(): number {
        return 0;
    }

    // For now, use `any` for the picking types.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.color) {
            return info;
        }

        let valueString = "";

        const isPropertyReadout = !this.props.isReadoutDepth; // Either map properties or map depths are encoded here.

        if (isPropertyReadout && this.props.propertyValuesImageData) {
            // PROPERTY READOUT.
            const data = this.props.propertyValuesImageData.data;
            const float_view = new Float32Array(
                data.buffer,
                0,
                data.length / 4
            );

            const w = this.props.propertyValuesImageData.width;
            const h = this.props.propertyValuesImageData.height;
            const j = Math.min(Math.floor(w * (info.color[0] / 255.0)), w - 1);
            const i = Math.min(Math.floor(h * (info.color[1] / 255.0)), h - 1);
            const pixelNo = i * w + j;

            const value = float_view[pixelNo];
            valueString =
                "Property: " +
                (!Number.isNaN(value) && value !== undefined
                    ? value.toFixed(1)
                    : " - ");
        } else {
            // DEPTH READOUT.
            const DECODER = {
                rScaler: 256 * 256,
                gScaler: 256,
                bScaler: 1,
                offset: 0,
            };
            // Note these colors are in the  0-255 range.
            const r = info.color[0] * DECODER.rScaler;
            const g = info.color[1] * DECODER.gScaler;
            const b = info.color[2] * DECODER.bScaler;
            const value = r + g + b;
            valueString = "Depth: " + value.toFixed(1);
        }

        return {
            ...info,
            propertyValue: valueString,
        };
    }
}

PrivateMeshLayer.layerName = "TerrainMapLayer";
PrivateMeshLayer.defaultProps = defaultProps;
