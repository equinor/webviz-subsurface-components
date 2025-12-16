import type { Color, LayerProps, UpdateParameters } from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, project32 } from "@deck.gl/core";

import type { Device } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";
import { Geometry, Model } from "@luma.gl/engine";

import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
} from "../utils/layerTools";

import { precisionForTests } from "../shader_modules/test-precision/precisionForTests";

import type { RGBAColor } from "../../utils";

import fragmentShader from "./box.fs.glsl";
import vertexShader from "./box.vs.glsl";

export interface BoxLayerProps extends ExtendedLayerProps {
    lines: [number]; // from pt , to pt.
    color: Color;
}

const defaultProps = {
    name: "Box",
    id: "box-layer",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    lines: [],
    color: [0, 0, 0, 1],
};

export default class BoxLayer extends Layer<BoxLayerProps> {
    initializeState(context: DeckGLLayerContext): void {
        this.setState(this._getModels(context.device));
    }

    shouldUpdateState(): boolean {
        return true;
    }

    updateState({ context }: UpdateParameters<this>): void {
        this.setState(this._getModels(context.device));
    }

    setShaderModuleProps(
        args: Partial<{
            [x: string]: Partial<Record<string, unknown> | undefined>;
        }>
    ): void {
        const color = (this.props.color ?? defaultProps.color).map((x, i) =>
            i < 3 ? (x ?? 0) / 255 : 1
        ) as RGBAColor;
        super.setShaderModuleProps({
            ...args,
            box: {
                uColor: color,
            },
        });
    }

    _getModels(device: Device) {
        const grids = new Model(device, {
            id: `${this.props.id}-grids`,
            ...super.getShaders({
                vs: vertexShader,
                fs: fragmentShader,
                modules: [project32, precisionForTests, boxUniforms],
            }),
            geometry: new Geometry({
                topology: "line-list",
                attributes: {
                    positions: new Float32Array(this.props.lines),
                },
                vertexCount: this.props.lines.length / 3,
            }),
            isInstanced: false, // This only works when set to false.
        });

        return {
            model: grids,
            models: [grids].filter(Boolean),
            modelsByName: { grids },
        };
    }
}

BoxLayer.layerName = "BoxLayer";
BoxLayer.defaultProps = defaultProps;

const boxUniformsBlock = `\
uniform boxUniforms {
    uniform vec4 uColor;
} box;
`;

type BoxUniformsType = { uColor: RGBAColor };

// NOTE: this must exactly the same name than in the uniform block
const boxUniforms = {
    name: "box",
    vs: boxUniformsBlock,
    fs: undefined,
    uniformTypes: {
        uColor: "vec4<f32>",
    },
} as const satisfies ShaderModule<LayerProps, BoxUniformsType>;
