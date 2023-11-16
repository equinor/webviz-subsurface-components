/* eslint-disable prettier/prettier */
import GL from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import type { Accessor, Color, DefaultProps, LayerContext, Position, UpdateParameters , LayerProps} from "@deck.gl/core/typed";
import { Layer, project } from "@deck.gl/core/typed";
import type { ExtendedLayerProps } from "../utils/layerTools";



import vsShader from "./vertex.glsl";
import fsShader from "./fragment.glsl";

export type WellMarkersLayerProps = _WellMarkersLayerProps & LayerProps;

export type WellMarkerDataT = {
    position: Position;
    azimuth: number;
    inclination: number;
    color: Color;
}

export interface _WellMarkersLayerProps extends ExtendedLayerProps {

    getPosition?: Accessor<WellMarkerDataT, Position>;   
    getAzimuth?: Accessor<WellMarkerDataT, number>;
    getInclination?: Accessor<WellMarkerDataT, number>;
    getColor?: Accessor<WellMarkerDataT, Color>;
}

const defaultProps: DefaultProps<WellMarkersLayerProps> = {

    "@@type": "WellMarkersLayer",
    name: "Well Markers",
    id: "well-markers",
    visible: true, 
    getPosition: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.position}},
    getAzimuth:  {type: 'accessor', value: (x: WellMarkerDataT) => { return x.azimuth}},
    getInclination: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.inclination}},
    getColor: {type: 'accessor', value: (x: WellMarkerDataT) => { return x.color}},
};

export default class WellMarkersLayer extends Layer<WellMarkersLayerProps> {

    state!: {
        model?: Model;
    };

    constructor(props: WellMarkersLayerProps) {
        super(props);
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
    }

    updateState(params: UpdateParameters<this>) {
        super.updateState(params);
    
        if (params.changeFlags.extensionsChanged) {
          this.state.model?.clear({});
          this.state.model = this._getModel();
          this.getAttributeManager()!.invalidateAll();
        }
      }

    _getModel(): Model {

        const positions = [0.0, 0.0, 0.0, 
                           0.5, 0.0, 0.0,
                           0.0, 3.0, 0.0,
                           -0.5,0.0, 0.0,
                        ];

        const gl = this.context.gl;
        const model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,                      
            geometry: new Geometry({   
                drawMode: GL.TRIANGLE_STRIP,                             
                attributes: {
                  positions: {size: 3, value: new Float32Array(positions)}
                },                
            }),       
            isInstanced: true,          
            modules: [project],            
        });
        return model;
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: number[];
        context: LayerContext;
    }): void {
        if (!this.state["model"]) {
            return;
        }
        const { uniforms } = args;
        const model = this.state["model"];       
        model.setUniforms({
             ...uniforms,
        }).draw();        
    }
}

WellMarkersLayer.layerName = "WellMarkersLayer";
WellMarkersLayer.defaultProps = defaultProps;
