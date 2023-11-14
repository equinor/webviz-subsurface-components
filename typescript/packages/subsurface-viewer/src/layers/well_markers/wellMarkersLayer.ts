/* eslint-disable prettier/prettier */
import GL from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import type { Accessor, DefaultProps, LayerContext, LayerDataSource, Position, UpdateParameters , LayerProps} from "@deck.gl/core/typed";
import { Layer, project } from "@deck.gl/core/typed";
import type { ExtendedLayerProps } from "../utils/layerTools";



import vsShader from "./vertex.glsl";
import fsShader from "./fragment.glsl";

export type WellMarkersLayerProps<DataT = unknown> = _WellMarkersLayerProps<DataT> & LayerProps;

export interface _WellMarkersLayerProps<DataT = unknown> extends ExtendedLayerProps {

    getPosition?: Accessor<DataT, Position>;   
}

const defaultProps: DefaultProps<WellMarkersLayerProps> = {

    "@@type": "WellMarkersLayer",
    name: "Well Markers",
    id: "well-markers",
    visible: true, 
    getPosition: {type: 'accessor', value: (x: any) => { return x.position}},
};

export default class WellMarkersLayer<DataT = unknown> extends Layer<WellMarkersLayerProps<DataT>> {

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
                           1.0, 0.0, 0.0,
                           0.0, 1.0, 0.0,
                           -1.0,0.0, 0.0,
                           0.0,-1.0, 0.0,
                           1.0,0,0,0.0,
                         ];

        const gl = this.context.gl;
        const model = new Model(gl, {
            id: `${this.props.id}-mesh`,
            vs: vsShader,
            fs: fsShader,                      
            geometry: new Geometry({   
                drawMode: GL.TRIANGLE_FAN,                             
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
