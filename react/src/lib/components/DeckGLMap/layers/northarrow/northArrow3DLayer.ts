import { Layer } from "@deck.gl/core";
import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/core";
import { LayerProps } from "@deck.gl/core/lib/layer";
import { layersDefaultProps } from "../layersDefaultProps";
import fragmentShader from "./axes-fragment.glsl";
import gridVertex from "./grid-vertex.glsl";
import { project } from "deck.gl";
import { COORDINATE_SYSTEM } from "deck.gl";
import { DeckGLLayerContext } from "../../components/Map";

import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
// import {ConeGeometry} from '@luma.gl/engine';
import { Vector3 } from "@math.gl/core";

import { GLTF_JSON_NORTH_ARROW } from "../../utils/northArrow";

import { CompositeLayer } from "@deck.gl/core";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { ScenegraphLayerProps } from "@deck.gl/mesh-layers/scenegraph-layer/scenegraph-layer";


const text = JSON.stringify(GLTF_JSON_NORTH_ARROW);
const data = new Blob([text], { type: "text/plain" });
const url = window.URL.createObjectURL(data);

const scenegraph = load(url, GLTFLoader, {});

export interface NorthArrow3DLayerProps<D> extends LayerProps<D> {
   // lines: [number]; // from pt , to pt.
}



export default class NorthArrow3DLayer extends CompositeLayer<
    unknown,
    NorthArrow3DLayerProps<unknown>
> {
    initializeState(context: DeckGLLayerContext): void {
        console.log("initializeState")
        const { gl } = context;
        const bounds: [number, number, number, number, number, number] = [
            -100, -100, -100, 100, 100, 100,
        ];
        const box_lines = GetBoxLines(bounds);
        // this.setState({ ...models, box_lines });
        this.setState(this._getModels(gl));
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateStateInfo<NorthArrow3DLayerProps<unknown>>):
        | boolean
        | string
        | null {
        // Trenger denne rutinene for aa redrawe...
        //console.log("shouldUpdateState")
        return true;

        // console.log(changeFlags)
        // return super.shouldUpdateState({
        //     props,
        //     oldProps,
        //     context,
        //     changeFlags,
        // }) || changeFlags.viewportChanged;
    }

    updateState({ context }): void {
        //console.log("updateState")
        if (context.gl) {
            //console.log("updateState")
            const box_lines = this.state.box_lines;
            // console.log("updateState box_lines", box_lines)
            // this.setState({ ...this._getModels(context.gl, box_lines), box_lines });
            this.setState(this._getModels(context.gl));
        }
        // if (context.gl) {
        //     const cam_pos = new Vector3(this.context.viewport.cameraPosition);
        //     console.log(cam_pos)
        //     //const center = new Vector3(this.unproject([300, 300, 0.0]));
        //     const center = new Vector3([0.0, 0.0, 0.0]);
        //     const dir = new Vector3([
        //         center[0] - cam_pos[0],
        //         center[1] - cam_pos[1],
        //         center[2] - cam_pos[2],
        //     ]);
        //     dir.normalize();
        //     dir.scale(600.0); // XXX langt borte men stor..dvs bounds maa være store men de trenger ikke være proerty de boer hardcodes.

        //     // pos: World coordinate for north arrow.
        //     const pos = new Vector3([
        //         cam_pos[0] + dir[0],
        //         cam_pos[1] + dir[1],
        //         cam_pos[2] + dir[2],
        //     ]);
        //     this.setState({ pos });
        // }
    }
      
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms, context }: any): void {
        console.log("DRAW");
        super.draw({ moduleParameters, uniforms, context });
    }

    renderLayers(): ScenegraphLayer<unknown>[] {

        const cam_pos = new Vector3(this.context.viewport.cameraPosition);
        //console.log("cam_pos: ", cam_pos)
    
        //const center = new Vector3(this.context.viewport.center);
        //const center = new Vector3(this.unproject([100, 100, 0.0]));
        const center = new Vector3(this.unproject([300, 300, 0.0]));
        console.log("center: ", center)
    
        const dir = new Vector3([
            center[0] - cam_pos[0],
            center[1] - cam_pos[1],
            center[2] - cam_pos[2],
        ]);
        dir.normalize();
        dir.scale(600.0); // XXX langt borte men stor..dvs bounds maa være store men de trenger ikke være proerty de boer hardcodes.
    
        //console.log("dir: ", dir)
    
        // pos: World coordinate for north arrow.
        const pos = new Vector3([
            cam_pos[0] + dir[0],
            cam_pos[1] + dir[1],
            cam_pos[2] + dir[2],
        ]);
        // //const pos = new Vector3([0,0,0]);
        // console.log("pos: ", pos)

        // const pos = this.state.pos;
        // console.log("pos: ", pos)


        const layers = [
            new ScenegraphLayer({
                id: "north-arrow-scenegraph-layer",
                data: [{}],
                //scenegraph: load(url, GLTFLoader, {}),  // XXX loades en gang externt?
                scenegraph,
                getOrientation: [0.0, 0.0, 0.0],
                //getTranslation: [0.0, 0.0, 0.0],
                getTranslation: pos,
                getScale: [1, 1, 1],
                sizeScale: 500, // 200
                _lighting: "pbr",
                pickable: false,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            }),
        ];

        return layers;
    }

    //eslint-disable-next-line
    //_getModels(gl: any, box_lines: number[] ) {
    _getModels(gl: any) {
        const bounds: [number, number, number, number, number, number] = [
            -10, -10, -10, 10, 10, 10,
        ];
        const box_lines = GetBoxLines(bounds);

        const cam_pos = new Vector3(this.context.viewport.cameraPosition);

        //const center = new Vector3(this.context.viewport.center);
        const center = new Vector3(this.unproject([100, 100, 0.0]));
        console.log("center: ", center)

        const dir = new Vector3([
            center[0] - cam_pos[0],
            center[1] - cam_pos[1],
            center[2] - cam_pos[2],
        ]);
        dir.normalize();
        dir.scale(600.0); // XXX langt borte men stor..dvs bounds maa være store men de trenger ikke være proerty de boer hardcodes.

        // pos: World coordinate for north arrow.
        const pos = new Vector3([
            cam_pos[0] + dir[0],
            cam_pos[1] + dir[1],
            cam_pos[2] + dir[2],
        ]);

        const lines: number[] = [];

        //console.log(box_lines);
        for (let i = 0; i < box_lines.length / 3; i = i + 1) {
            const x = box_lines[i * 3 + 0] + pos[0];
            const y = box_lines[i * 3 + 1] + pos[1];
            const z = box_lines[i * 3 + 2] + pos[2];
            lines.push(x, y, z);
        }
        //console.log(lines);


        const grids = new Model(gl, {
            id: `${this.props.id}-gridssssss`,
            vs: gridVertex,
            fs: fragmentShader,
            geometry: new Geometry({
                drawMode: GL.LINES,
                attributes: {
                    positions: new Float32Array(lines),
                },
                vertexCount: lines.length / 3,
            }),

            //geometry: cone,

            modules: [project],
            isInstanced: false, // This only works when set to false.
        });

        return {
            model: grids,
            models: [grids].filter(Boolean),
            modelsByName: { grids },
        };
    }
}

// export interface NorthArrow3DLayerProps<D> extends LayerProps<D> {
//    // lines: [number]; // from pt , to pt.
// }

// // const defaultProps = {
// //     // name: "Box",
// //     // id: "box-layer",
// //     coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
// //     visible: true,
// //     // lines: [],
// // };

// export default class NorthArrow3DLayer extends Layer<
//     unknown,
//     NorthArrow3DLayerProps<unknown>
// > {
//     initializeState(context: DeckGLLayerContext): void {
//         console.log("initializeState")
//         const { gl } = context;
//         const bounds: [number, number, number, number, number, number] = [
//             -100, -100, -100, 100, 100, 100,
//         ];
//         const box_lines = GetBoxLines(bounds);
//         //const models = this._getModels(gl, box_lines);
//         //console.log("initializeState models", models)
//         // this.setState({ ...models, box_lines });
//         this.setState(this._getModels(gl));
//         //console.log("state; ", this.state)
//     }

//     shouldUpdateState({
//         props,
//         oldProps,
//         context,
//         changeFlags,
//     }: UpdateStateInfo<NorthArrow3DProps<unknown>>): boolean | string | null {
//         //console.log("changeFlags.viewportChanged: ", changeFlags.viewportChanged)
//         console.log("shouldUpdateState")
//         return true;

//         return (
//             super.shouldUpdateState({
//                 props,
//                 oldProps,
//                 context,
//                 changeFlags,
//             }) || changeFlags.viewportChanged
//         );
//     } 

//     updateState({ context }): void {
//         console.log("updateState")
//         //console.log(context)
//         if (context.gl) {
//             //console.log("updateState")
//             const box_lines = this.state.box_lines;
//             // console.log("updateState box_lines", box_lines)
//             // this.setState({ ...this._getModels(context.gl, box_lines), box_lines });
//             this.setState(this._getModels(context.gl));
//         }

//         //console.log("state: ", this.state)
//         //HER KAN JEG MULIGENS berenge og sette modelMatrix
//     }

//     // Signature from the base class, eslint doesn't like the any type.
//     // eslint-disable-next-line
//     draw({ moduleParameters, uniforms, context }: any): void {
//         console.log("DRAW");
//         super.draw({ moduleParameters, uniforms, context });
//     }


//     //eslint-disable-next-line
//     //_getModels(gl: any, box_lines: number[] ) {
//     _getModels(gl: any) {

//         const bounds: [number, number, number, number, number, number] = [
//             -10, -10, -10, 10, 10, 10,
//         ];
//         const box_lines = GetBoxLines(bounds);

//         console.log("_getModels")

//         //console.log(this.context)

//         const cam_pos = new Vector3(this.context.viewport.cameraPosition);
//         console.log("cam_pos: ", cam_pos)

//         //const center = new Vector3(this.context.viewport.center);
//         const center = new Vector3(this.unproject([100, 100, 0.0]));
//         console.log("center: ", center)

//         const dir = new Vector3([
//             center[0] - cam_pos[0],
//             center[1] - cam_pos[1],
//             center[2] - cam_pos[2],
//         ]);
//         dir.normalize();
//         dir.scale(600.0); // XXX langt borte men stor..dvs bounds maa være store men de trenger ikke være proerty de boer hardcodes.

//         console.log("dir: ", dir)

//         // pos: World coordinate for north arrow.
//         const pos = new Vector3([
//             cam_pos[0] + dir[0],
//             cam_pos[1] + dir[1],
//             cam_pos[2] + dir[2],
//         ]);

//         console.log("pos: ", pos)

//         const lines: number[] = [];

//         //console.log(box_lines);
//         for (let i = 0; i < box_lines.length / 3; i = i + 1) {
//             const x = box_lines[i * 3 + 0] + pos[0];
//             const y = box_lines[i * 3 + 1] + pos[1];
//             const z = box_lines[i * 3 + 2] + pos[2];
//             lines.push(x, y, z);
//         }
//         //console.log(lines);

//         // const cone = new ConeGeometry({
//         //     radius: 20,
//         //     height: 100,
//         //     cap: true
//         // });

//         const grids = new Model(gl, {
//             id: `${this.props.id}-gridssssss`,
//             vs: gridVertex,
//             fs: fragmentShader,
//             geometry: new Geometry({
//                 drawMode: GL.LINES,
//                 attributes: {
//                     positions: new Float32Array(lines),
//                 },
//                 vertexCount: lines.length / 3,
//             }),

//             //geometry: cone,

//             modules: [project],
//             isInstanced: false, // This only works when set to false.
//         });

//         return {
//             model: grids,
//             models: [grids].filter(Boolean),
//             modelsByName: { grids },
//         };
//     }
// }

// // NorthArrow3DLayer.layerName = "NorthArrow3D";
// // NorthArrow3DLayer.defaultProps = defaultProps;

// NorthArrow3DLayer.layerName = "NorthArrow3DLayer";
// NorthArrow3DLayer.defaultProps = layersDefaultProps[
//     "NorthArrow3DLayer"
// ] as NorthArrow3DLayerProps<unknown>;


// //-- Local functions. --------------------------------------

function GetBoxLines(
    bounds: [number, number, number, number, number, number]
): number[] {
    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

    // ADD LINES OF BOUNDING BOX.
    const lines = [
        // TOP
        x_min,
        y_min,
        z_min,

        x_max,
        y_min,
        z_min,

        x_min,
        y_min,
        z_min,

        x_min,
        y_max,
        z_min,

        x_min,
        y_max,
        z_min,

        x_max,
        y_max,
        z_min,

        x_max,
        y_max,
        z_min,

        x_max,
        y_min,
        z_min,

        // BOTTOM
        x_min,
        y_min,
        z_max,

        x_max,
        y_min,
        z_max,

        x_min,
        y_min,
        z_max,

        x_min,
        y_max,
        z_max,

        x_min,
        y_max,
        z_max,

        x_max,
        y_max,
        z_max,

        x_max,
        y_max,
        z_max,

        x_max,
        y_min,
        z_max,

        // PILLARS
        x_min,
        y_min,
        z_min,

        x_min,
        y_min,
        z_max,

        x_max,
        y_min,
        z_min,

        x_max,
        y_min,
        z_max,

        x_max,
        y_max,
        z_min,

        x_max,
        y_max,
        z_max,

        x_min,
        y_max,
        z_min,

        x_min,
        y_max,
        z_max,
    ];

    return lines;
}
