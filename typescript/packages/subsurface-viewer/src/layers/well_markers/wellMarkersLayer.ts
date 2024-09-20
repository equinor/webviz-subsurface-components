//import { GL } from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import type {
    Accessor,
    Color,
    DefaultProps,
    LayerContext,
    Position,
    PickingInfo,
    UpdateParameters,
    LayerProps,
    Unit,
} from "@deck.gl/core";
import { Layer, project, picking, UNIT } from "@deck.gl/core";
import type { UniformValue } from "@luma.gl/core";
import type { GeometryProps } from "@luma.gl/engine";

import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import { utilities } from "../shader_modules";

import { vsShader } from "./vertex.glsl";
import { fsShader } from "./fragment.glsl";

export type WellMarkersLayerProps = _WellMarkersLayerProps & LayerProps;

/**
 * Input data of the layer.
 */
export type WellMarkerDataT = {
    /**
     * Position of a marker center.
     */
    position: Position;

    /**
     * Size of a marker in size units.
     */
    size: number;
    /**
     * Azimuth of the a marker in degrees.
     */
    azimuth: number;
    /**
     * Inclination of a marker against vertical direction in degrees.
     */
    inclination: number;
    /**
     * Fill color of a marker.
     */
    color: Color;
    /**
     * Outline color of a marker.
     */
    outlineColor: Color;
};
export interface _WellMarkersLayerProps extends ExtendedLayerProps {
    /**
     * Shape of the markers.
     * @default 'circle'
     */
    shape: "triangle" | "circle" | "square";
    /**
     * The units of the marker size, one of `'meters'`, `'common'`, and `'pixels'`.
     * @default 'meters'
     */
    sizeUnits: Unit;
    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis.
     * @default 'true'
     */
    ZIncreasingDownwards: boolean;

    /**
     * Center position accessor.
     */
    getPosition?: Accessor<WellMarkerDataT, Position>;
    /**
     * Size accessor.
     */
    getSize?: Accessor<WellMarkerDataT, number>;
    /**
     * Azimuth accessor.
     */
    getAzimuth?: Accessor<WellMarkerDataT, number>;
    /**
     * Inclination accessor.
     */
    getInclination?: Accessor<WellMarkerDataT, number>;
    /**
     * Color accessor.
     */
    getColor?: Accessor<WellMarkerDataT, Color>;
    /**
     * Outline color accessor.
     */
    getOutlineColor?: Accessor<WellMarkerDataT, Color>;
}

const normalizeColor = (color: Color | undefined): Color => {
    if (!color) {
        return new Uint8Array([0, 0, 0, 255]);
    }

    if (color.length > 4) {
        return new Uint8Array(color.slice(0, 4));
    }

    switch (color.length) {
        case 0:
            return new Uint8Array([0, 0, 0, 255]);
        case 1:
            return new Uint8Array([...color, 0, 0, 255]);
        case 2:
            return new Uint8Array([...color, 0, 255]);
        case 3:
            return new Uint8Array([...color, 255]);
        default:
            return color;
    }
};

const defaultProps: DefaultProps<WellMarkersLayerProps> = {
    "@@type": "WellMarkersLayer",
    name: "Well Markers",
    id: "well-markers",
    shape: "circle",
    sizeUnits: "meters",
    visible: true,
    ZIncreasingDownwards: true,
    getPosition: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return x.position;
        },
    },
    getSize: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return x.size;
        },
    },
    getAzimuth: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return x.azimuth;
        },
    },
    getInclination: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return x.inclination;
        },
    },
    getColor: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return normalizeColor(x.color);
        },
    },
    getOutlineColor: {
        type: "accessor",
        value: (x: WellMarkerDataT) => {
            return normalizeColor(x.outlineColor);
        },
    },
};

interface IMarkerShape {
    positions: Float32Array;
    outline: Float32Array;
    drawMode: GeometryProps["topology"];
}

export default class WellMarkersLayer extends Layer<WellMarkersLayerProps> {
    private shapes: Map<string, IMarkerShape> = new Map();

    constructor(props: WellMarkersLayerProps) {
        super(props);
        this.initShapes();
    }

    initializeState(): void {
        this.getAttributeManager()!.addInstanced({
            instancePositions: {
                size: 3,
                type: "float64",
                transition: true,
                accessor: "getPosition",
            },
            instanceSizes: {
                size: 1,
                type: "float64",
                transition: true,
                accessor: "getSize",
                defaultValue: 1.0,
            },
            instanceAzimuths: {
                size: 1,
                type: "float64",
                transition: true,
                accessor: "getAzimuth",
                defaultValue: 0,
            },
            instanceInclinations: {
                size: 1,
                type: "float64",
                transition: true,
                accessor: "getInclination",
                defaultValue: 0,
            },
            instanceColors: {
                size: 4,
                type: "uint8",
                transition: true,
                accessor: "getColor",
                defaultValue: [255, 0, 0, 255],
            },
            instanceOutlineColors: {
                size: 4,
                type: "uint8",
                transition: true,
                accessor: "getOutlineColor",
                defaultValue: [255, 0, 255, 255],
            },
        });
        const models = this._createModels();
        this.setState({ shapeModel: models[0], outlineModel: models[1] });
    }

    updateState(params: UpdateParameters<Layer<WellMarkersLayerProps>>) {
        super.updateState(params);
        if (
            params.changeFlags.extensionsChanged ||
            params.changeFlags.propsChanged
        ) {
            const oldShapeModel = this.state?.["shapeModel"] as Model;
            oldShapeModel.destroy();
            const oldOutlineModel = this.state?.["outlineModel"] as Model;
            oldOutlineModel.destroy();

            const models = this._createModels();
            this.setState({
                ...this.state,
                shapeModel: models[0],
                outlineModel: models[1],
            });
            this.getAttributeManager()!.invalidateAll();
        }
    }

    getModels(): Model[] {
        if (this.state["shapeModel"] && this.state["outlineModel"]) {
            return [
                this.state["shapeModel"] as Model,
                this.state["outlineModel"] as Model,
            ];
        }
        return [];
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: Record<string, UniformValue>;
        context: LayerContext;
    }): void {
        if (!this.state["shapeModel"]) {
            return;
        }

        const { uniforms } = args;
        const models = this.getModels();
        if (models.length && models.length < 2) {
            return;
        }
        models[0].setUniforms({
            ...uniforms,
            sizeUnits: UNIT[this.props.sizeUnits],
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
        });
        models[0].draw(args.context.renderPass);

        models[1].setUniforms({
            ...uniforms,
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            sizeUnits: UNIT[this.props.sizeUnits],
        });
        models[1].draw(args.context.renderPass);
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];

        const markerIndex = this.decodePickingColor(info.color);
        const markerData = this.props.data as WellMarkerDataT[];

        if (markerIndex >= 0 && markerIndex < markerData.length) {
            layer_properties.push(
                createPropertyData("Azimuth", markerData[markerIndex].azimuth)
            );
            layer_properties.push(
                createPropertyData(
                    "Inclination",
                    markerData[markerIndex].inclination
                )
            );
        }

        if (typeof info.coordinate?.[2] !== "undefined") {
            let depth = info.coordinate[2];
            depth = this.props.ZIncreasingDownwards ? -depth : depth;
            layer_properties.push(createPropertyData("Depth", depth));
        }
        return {
            ...info,
            properties: layer_properties,
        };
    }

    getShaders() {
        return super.getShaders({
            vs: vsShader,
            fs: fsShader,
            modules: [project, picking, utilities],
        });
    }

    private initShapes() {
        const triangle_positions = [
            -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
        ];

        const circle_positions: number[] = [0.0, 0.0, 0.0];
        const N = 32;
        const R = 1.0;
        for (let i = 0; i <= N; ++i) {
            const angle = ((2.0 * Math.PI) / N) * i;
            circle_positions.push(R * Math.cos(angle));
            circle_positions.push(R * Math.sin(angle));
            circle_positions.push(0.0);
        }

        const square_positions = [
            -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0,
        ];

        const square_outline = [
            -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0,
        ];

        this.shapes.set("triangle", {
            drawMode: "triangle-list",
            positions: new Float32Array(triangle_positions),
            outline: new Float32Array(triangle_positions),
        });

        this.shapes.set("circle", {
            drawMode: "triangle-fan-webgl",
            positions: new Float32Array(circle_positions),
            outline: new Float32Array(circle_positions.slice(3)),
        });

        this.shapes.set("square", {
            drawMode: "triangle-strip",
            positions: new Float32Array(square_positions),
            outline: new Float32Array(square_outline),
        });
    }

    protected _createModels(): Model[] {
        const device = this.context.device;

        const shape = this.shapes.get(this.props.shape);
        if (!shape) {
            return this._createEmptyModels();
        }

        const shaders = this.getShaders();

        const shapeModel = new Model(device, {
            id: `${this.props.id}-mesh`,
            ...shaders,
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            geometry: new Geometry({
                topology: shape.drawMode,
                attributes: {
                    positions: { size: 3, value: shape.positions },
                },
            }),
            uniforms: {
                useOutlineColor: false,
            },
            isInstanced: true,
            instanceCount: this.getNumInstances(),
        });

        const outlineModel = new Model(device, {
            id: `${this.props.id}-outline`,
            ...shaders,
            bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
            geometry: new Geometry({
                topology: "line-loop-webgl",
                attributes: {
                    positions: { size: 3, value: shape.outline },
                },
            }),
            uniforms: {
                useOutlineColor: true,
            },
            isInstanced: true,
            instanceCount: this.getNumInstances(),
        });

        return [shapeModel, outlineModel];
    }

    protected _createEmptyModels(): Model[] {
        return [
            new Model(this.context.device, {
                id: `${this.props.id}-empty-mesh`,
                vs: vsShader,
                fs: fsShader,
                isInstanced: true,
                instanceCount: 0,
            }),
            new Model(this.context.device, {
                id: `${this.props.id}-empty-outline`,
                vs: vsShader,
                fs: fsShader,
                isInstanced: true,
                instanceCount: 0,
            }),
        ];
    }
}

WellMarkersLayer.layerName = "WellMarkersLayer";
WellMarkersLayer.defaultProps = defaultProps;
