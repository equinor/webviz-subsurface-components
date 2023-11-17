/* eslint-disable prettier/prettier */
import GL from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import type { Accessor, Color, DefaultProps, LayerContext, Position, PickingInfo, UpdateParameters , LayerProps} from "@deck.gl/core/typed";
import { Layer, project, picking } from "@deck.gl/core/typed";

import type { ExtendedLayerProps, LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import { utilities } from "../shader_modules";


import {vsShader} from "./vertex.glsl";
import {fsShader} from "./fragment.glsl";

export type WellMarkersLayerProps = _WellMarkersLayerProps & LayerProps;

export type WellMarkerDataT = {
    position: Position;
    azimuth: number;
    inclination: number;
    color: Color;    
}

export interface _WellMarkersLayerProps extends ExtendedLayerProps {

    shape: "triangle" | "circle" | "square";
    getPosition?: Accessor<WellMarkerDataT, Position>;   
    getAzimuth?: Accessor<WellMarkerDataT, number>;
    getInclination?: Accessor<WellMarkerDataT, number>;
    getColor?: Accessor<WellMarkerDataT, Color>;
}

const defaultProps: DefaultProps<WellMarkersLayerProps> = {

    "@@type": "WellMarkersLayer",
    name: "Well Markers",
    id: "well-markers",
    shape: "circle",
    visible: true, 
    getPosition: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.position}},
    getAzimuth:  {type: 'accessor', value: (x: WellMarkerDataT) => { return x.azimuth}},
    getInclination: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.inclination}},
    getColor: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.color}},
};

interface IMarkerShape {
    positions: Float32Array;
    drawMode: number;
}

export default class WellMarkersLayer extends Layer<WellMarkersLayerProps> {

    private shapes : Map<string,IMarkerShape> = new Map ();

    constructor(props: WellMarkersLayerProps) {
        super(props);
        this.initShapes ();
    }

    initializeState(): void {

        this.getAttributeManager()!.addInstanced({
            instancePositions: {
              size: 3,
              type: GL.DOUBLE,    
              transition: true,                  
              accessor: 'getPosition'
            },
            instanceAzimuths: {
                size: 1,
                type: GL.DOUBLE,    
                transition: true,                  
                accessor: 'getAzimuth',
                defaultValue: 0
            },
            instanceInclinations: {
                size: 1,
                type: GL.DOUBLE,    
                transition: true,                  
                accessor: 'getInclination',
                defaultValue: 0
            },
            instanceColors: {
                size: 3,
                type: GL.UNSIGNED_BYTE,    
                transition: true,                  
                accessor: 'getColor',
                defaultValue: [255, 0, 0],
              },
        });
        this.setState ({shapeModel: this._getModel()});
    }

    updateState(params: UpdateParameters<this>) {
        super.updateState(params);
    
        if (params.changeFlags.extensionsChanged) {
            this.state?.["shapeModel"]?.delete();
            this.setState (
                {   ...this.state,
                    shapeModel: this._getModel()
                }
            );
            this.getAttributeManager()!.invalidateAll();
        }
    }

    getModels(): Model[] {
        if(this.state["shapeModel"]) {
            return [this.state["shapeModel"]];
        }
        return [];
    }

    protected _getModel(): Model {

        const gl = this.context.gl;

        const shape = this.shapes.get (this.props.shape);
        if (!shape) {
            return new Model (gl, {
                id: `${this.props.id}-empty-mesh`,
                vs: vsShader,
                fs: fsShader,
                isInstanced: true, 
            });
        }
        
        const model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,  
            geometry: new Geometry({   
                drawMode: shape.drawMode,                             
                attributes: {
                  positions: {size: 3, value: shape.positions}
                },                
            }),       
            modules: [project, picking, utilities],
            isInstanced: true,       
            instanceCount: this.getNumInstances()          
        });
        return model;
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: number[];
        context: LayerContext;
    }): void {
        if (!this.state["shapeModel"]) {
            return;
        }
        const { uniforms } = args;
        const model = this.state["shapeModel"];       
        model.setUniforms({
             ...uniforms,
        }).draw();        
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];
        
        const markerIndex = this.decodePickingColor (info.color);
        const markerData = this.props.data as WellMarkerDataT[];

        if (markerIndex >= 0 && markerIndex < markerData.length) {
            layer_properties.push(createPropertyData("Azimuth", markerData[markerIndex].azimuth));
            layer_properties.push(createPropertyData("Inclination", markerData[markerIndex].inclination));
        }
        
        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth = info.coordinate[2];
            layer_properties.push(createPropertyData("Depth", depth));
        }
        return {
            ...info,
            properties: layer_properties,
        };
    }


    private initShapes () {

        const triangle_positions = [
           -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,             
            0.0, 1.0, 0.0,             
        ];

        const circle_positions : number[] = [0.0, 0.0, 0.0];
        const N = 32;
        const R = 1.0;
        for (let i = 0; i <= N; ++i) {
            const angle = 2.0 * Math.PI / N * i;
            circle_positions.push (R * Math.cos(angle));
            circle_positions.push (R * Math.sin(angle));
            circle_positions.push (0.0);
        }

        const square_positions = [
            -1.0,  1.0, 0.0,
             1.0,  1.0, 0.0,
            -1.0, -1.0, 0.0,
             1.0, -1.0, 0.0
        ]

        this.shapes.set ("triangle", {
            drawMode: GL.TRIANGLES,
            positions: new Float32Array(triangle_positions)
        });

        this.shapes.set ("circle", {
            drawMode: GL.TRIANGLE_FAN,
            positions: new Float32Array(circle_positions)
        });

        this.shapes.set ("square", {
            drawMode: GL.TRIANGLE_STRIP,
            positions: new Float32Array(square_positions)
        });
    }
}

WellMarkersLayer.layerName = "WellMarkersLayer";
WellMarkersLayer.defaultProps = defaultProps;
