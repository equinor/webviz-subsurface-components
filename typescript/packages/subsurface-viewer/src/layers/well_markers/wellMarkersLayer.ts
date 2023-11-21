/* eslint-disable prettier/prettier */
import GL from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import type { Accessor, Color, DefaultProps, LayerContext, Position, PickingInfo, UpdateParameters , LayerProps, Unit} from "@deck.gl/core/typed";
import { Layer, project, picking, UNIT } from "@deck.gl/core/typed";

import type { ExtendedLayerProps, LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import { utilities } from "../shader_modules";


import {vsShader} from "./vertex.glsl";
import {fsShader} from "./fragment.glsl";

export type WellMarkersLayerProps = _WellMarkersLayerProps & LayerProps;

export type WellMarkerDataT = {
    position: Position;
    size: number;
    azimuth: number;
    inclination: number;
    color: Color;    
    outlineColor: Color;
}

export interface _WellMarkersLayerProps extends ExtendedLayerProps {

    shape: "triangle" | "circle" | "square";
    sizeUnits: Unit;
    ZIncreasingDownwards: boolean;
    getPosition?: Accessor<WellMarkerDataT, Position>; 
    getSize?:Accessor<WellMarkerDataT, number>;  
    getAzimuth?: Accessor<WellMarkerDataT, number>;
    getInclination?: Accessor<WellMarkerDataT, number>;
    getColor?: Accessor<WellMarkerDataT, Color>;
    getOutlineColor?: Accessor<WellMarkerDataT, Color>;        
}

const normalizeColor = (color: Color | undefined) : Color => {

    if(!color) {
        return new Uint8Array([0, 0, 0, 255]);
    }

    if (color.length > 4) {
        return new Uint8Array(color.slice(0,4));
    }

    switch(color.length) {
        case 0: return new Uint8Array([0, 0, 0, 255]);
        case 1: return new Uint8Array([...color, 0, 0, 255]);
        case 2: return new Uint8Array([...color, 0, 255]);
        case 3: return new Uint8Array([...color, 255]);
        default: return color;
    }
}

const defaultProps: DefaultProps<WellMarkersLayerProps> = {

    "@@type": "WellMarkersLayer",
    name: "Well Markers",
    id: "well-markers",
    shape: "circle",
    sizeUnits: "meters",
    visible: true, 
    ZIncreasingDownwards: false,
    getPosition: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.position}},
    getSize: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.size}},
    getAzimuth:  {type: 'accessor', value: (x: WellMarkerDataT) => { return x.azimuth}},
    getInclination: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.inclination}},
    getColor: {type: 'accessor', value: (x: WellMarkerDataT) => { return normalizeColor(x.color)}},
    getOutlineColor: {type: 'accessor', value: (x: WellMarkerDataT) => { return normalizeColor(x.outlineColor)}},
};

interface IMarkerShape {
    positions: Float32Array;
    outline: Float32Array;
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
            instanceSizes : {
                size: 1,
                type: GL.DOUBLE,
                transition: true,
                accessor: 'getSize',
                defaultValue: 1.0
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
                size: 4,
                type: GL.UNSIGNED_BYTE,    
                transition: true,                  
                accessor: 'getColor',
                defaultValue: [255, 0, 0, 255],
            },
            instanceOutlineColors: {
                size: 4,
                type: GL.UNSIGNED_BYTE,    
                transition: true,                  
                accessor: 'getOutlineColor',
                defaultValue: [255, 0, 255, 255],
            },
        });
        const models = this._createModels ();
        this.setState ({shapeModel: models[0], outlineModel: models[1]});
    }

    updateState(params: UpdateParameters<this>) {
        super.updateState(params);
    
        if (params.changeFlags.extensionsChanged || params.changeFlags.propsChanged) {
            this.state?.["shapeModel"]?.delete();
            this.state?.["outlineModel"]?.delete();
            const models = this._createModels ();
            this.setState (
                {   ...this.state,
                    shapeModel: models[0],
                    outlineModel: models[1],
                }
            );
            this.getAttributeManager()!.invalidateAll();
        }
    }

    getModels(): Model[] {
        if(this.state["shapeModel"] && this.state["outlineModel"]) {
            return [this.state["shapeModel"], this.state["outlineModel"]];
        }
        return [];
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
        const models = this.getModels ();
        if (models.length && models.length < 2) {
            return;
        }
        models[0].setUniforms({
            ...uniforms,
            sizeUnits: UNIT[this.props.sizeUnits],
            ZIncreasingDownwards: this.props.ZIncreasingDownwards
        }).draw();        
        models[1].setUniforms({
            ...uniforms,
            ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            sizeUnits: UNIT[this.props.sizeUnits],
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
            let depth = info.coordinate[2];
            depth = this.props.ZIncreasingDownwards ? -depth : depth;
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

        const square_outline = [
            -1.0,  1.0, 0.0,
             1.0,  1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0,
        ]

        this.shapes.set ("triangle", {
            drawMode: GL.TRIANGLES,
            positions: new Float32Array(triangle_positions),
            outline: new Float32Array(triangle_positions),
        });

        this.shapes.set ("circle", {
            drawMode: GL.TRIANGLE_FAN,
            positions: new Float32Array(circle_positions),
            outline: new Float32Array(circle_positions.slice(3)),
        });

        this.shapes.set ("square", {
            drawMode: GL.TRIANGLE_STRIP,
            positions: new Float32Array(square_positions),
            outline: new Float32Array(square_outline),
        });
    }

    protected _createModels(): Model[] {

        const gl = this.context.gl;

        const shape = this.shapes.get (this.props.shape);
        if (!shape) {
            return this._createEmptyModels();
        }
        
        const shapeModel = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,  
            geometry: new Geometry({   
                drawMode: shape.drawMode,                             
                attributes: {
                  positions: {size: 3, value: shape.positions}
                },                
            }),       
            uniforms : {
                useOutlineColor: false,
            },
            modules: [project, picking, utilities],
            isInstanced: true,       
            instanceCount: this.getNumInstances()          
        });

        const outlineModel = new Model(gl, {
            id: `${this.props.id}-outline`,
            vs: vsShader,
            fs: fsShader,  
            geometry: new Geometry({   
                drawMode: GL.LINE_LOOP,                             
                attributes: {
                  positions: {size: 3, value: shape.outline}
                },                
            }),     
            uniforms : {
                useOutlineColor: true,
            },  
            modules: [project, picking, utilities],
            isInstanced: true,       
            instanceCount: this.getNumInstances()          
        });

        return [shapeModel, outlineModel];
    }

    protected _createEmptyModels () : Model[] {
        return [new Model (this.context.gl, {
            id: `${this.props.id}-empty-mesh`,
            vs: vsShader,
            fs: fsShader,
            isInstanced: true, 
            instanceCount: 0
        }),
        new Model (this.context.gl, {
            id: `${this.props.id}-empty-outline`,
            vs: vsShader,
            fs: fsShader,
            isInstanced: true, 
            instanceCount: 0
        })
        ];  
    }
}

WellMarkersLayer.layerName = "WellMarkersLayer";
WellMarkersLayer.defaultProps = defaultProps;
