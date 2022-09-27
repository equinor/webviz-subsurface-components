import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import "!vue-style-loader!css-loader!sass-loader!./styles.scss";

import { WellLogController, WellPickProps, getWellPicks } from "./WellLogView";
import WellLogView from "./WellLogView";


import { ColorTable } from "./ColorTableTypes";


interface Props {
    width?: number;

    controllers: (WellLogController | null)[];   
 
    /**
     * Prop containing color table data.
     */
    colorTables: ColorTable[];
    /**
     * Well Picks data
     */
    wellpicks?: WellPickProps[];

    distance?: number;

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;
    /**
     * Show Titles on the tracks
     */
    hideTitles?: boolean;
    /**
     * Hide Legends on the tracks
     */
    hideLegend?: boolean;

    onCreateSpacer?: (spacer: WellLogSpacer) => void;
}

interface State {
}


class WellLogSpacer extends Component<Props, State> {
    container: HTMLElement;

    constructor(props: Props) {
        super(props);
    }

    update()
    {
        this.forceUpdate();
    }
   


    componentDidUpdate(prevProps: Props, prevState: State): void {
        // Typical usage (don't forget to compare props):
        if (this.props.onCreateSpacer !== prevProps.onCreateSpacer) {
            // update callback to component's caller
            if (this.props.onCreateSpacer)
                this.props.onCreateSpacer(this);
        }
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        if (this.props.colorTables !== nextProps.colorTables) return true;
        if (this.props.controllers !== nextProps.controllers) return true;
        if (this.props.wellpicks !== nextProps.wellpicks) return true;
     
        return false;
    }

    render(): ReactNode {
        const width= this.container? this.container.clientWidth: 10;
        //const primaryAxis = parent.props.primaryAxis;
        let ymax=0;
        let lines:{color:string, d:string}[]=[]
        let polygons:{color:string, path:string}[]=[]
        let picks:{color:string, from:number, to:number}[]=[]


        let offsetTop=1157;
        let clientHeight=1;
        const controller = this.props.controllers[0] as WellLogView;
        const logViewer = controller?.logController;
        const controller2 = this.props.controllers[1] as WellLogView;
        const logViewer2 = controller2?.logController;
        const wps=controller? getWellPicks(controller): null;
        const wps2=controller2? getWellPicks(controller2): null;
        if(wps && wps2 && logViewer) {
            let overlay=logViewer?.overlay;
            let overlay2=logViewer2?.overlay;
            const source = overlay?.elm.node();            
            const source2 = overlay2?.elm.node();  
            
            if(source) {
                offsetTop=source.offsetTop; 
                clientHeight=source.clientHeight;
            }
            
            const wpSize = 3; //9;
            const offset = wpSize / 2;

            for(const wp of wps) {
                const horizon = wp.horizon;
                const vMD = wp.vMD;
                const vPrimary = wp.vPrimary;
                const vSecondary = wp.vSecondary;
                const color = wp.color

                const rgba =
                    "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.8)";
                
                let vCur = vPrimary
                if (vCur === undefined) 
                    continue;
                const v = logViewer?.scale(vCur);
                if (!Number.isFinite(v) || v===undefined) 
                    continue;
            
                for(const wp2 of wps2) {
                    const horizon2 = wp2.horizon;
                    if(horizon === horizon2) {
                        const vPrimary2 = wp2.vPrimary;

                        let vCur2 = vPrimary2
                        if(vCur2===undefined) 
                            continue;
                        const v2 = logViewer2?.scale(vCur2);
                        if (!Number.isFinite(v2) || v2===undefined) 
                            continue;
                        if(ymax<v) ymax=v;
                        if(ymax<v2) ymax=v2;

                        picks.push({
                            from:v, 
                            to:v2,
                            color:rgba
                        });

                        break;
                    }
                }
            }
        }

        const _selection = controller?.getContentSelection();
        const _selection2 = controller2?.getContentSelection();


        let selection: { from:number|undefined, to:number|undefined } []= [
            { from: _selection?.[0]===undefined? undefined: logViewer?.scale(_selection?.[0]), 
                to:_selection2?.[0]===undefined? undefined: logViewer2?.scale(_selection2?.[0]) },
            { from: _selection?.[1]===undefined? undefined: logViewer?.scale(_selection?.[1]), 
                to:_selection2?.[1]===undefined? undefined: logViewer2?.scale(_selection2?.[1]) }
        ]

        if(selection[0].from!==undefined && selection[1].from!==undefined && selection[0].to!==undefined && selection[1].to!==undefined)
        if(selection[0].from<selection[1].from !== selection[0].to<selection[1].to) {
            const tmp=selection[0].to;
            selection[0].to=selection[1].to;
            selection[1].to=tmp;
        }

        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                }}
                ref={(el) => (this.container = el as HTMLElement)}
            >
                <div style={{ height:offsetTop+"px", width: width+"px" }} >
                    <br />
                    {
                    !this.props.hideLegend && this.props.distance?
                        <div style={{ fontSize: 12, textAlign: "center" }}>{"←"+this.props.distance.toFixed(0)+"m→"}</div>:
                        null
                    }
                </div>
                <div style={{ width: width+"px" }} >
                <svg xmlns="http://www.w3.org/2000/svg" 
                    viewBox={"0 0 " + width + " "+ymax}
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <defs>
                        <clipPath id="myClip">
                            <rect x="0" y="0" width={width} height={clientHeight} />
                        </clipPath>
                    </defs> 
                    <g clip-path="url(#myClip)">
                        {picks.map( (value, index) => (index+1<picks.length)? (
                            <polygon fill={value.color} stroke="none" points={
                            "0 "+value.from.toFixed(1)+
                            " " + width + " "+value.to.toFixed(1) +
                            " " + width + " "+picks[index+1].to.toFixed(1)+
                            " 0 "+picks[index+1].from.toFixed(1)
                        } />): null )}
                        {picks.map( (value) => (<path fill="none" stroke={value.color} d={
                            "M 0 "+value.from.toFixed(1)+
                            " L " + width + " "+value.to.toFixed(1)
                        } />) )}

                            <polygon fill="rgba(0, 0, 0, 0.1)" stroke="none" points={
                                "0 "+selection[0]?.from?.toFixed(1)+
                                " " + width + " "+selection[0]?.to?.toFixed(1) +
                                " " + width + " "+selection[1]?.to?.toFixed(1)+
                                " 0 "+selection[1]?.from?.toFixed(1)
                            } />
                            <path fill="none" stroke="rgba(255, 0, 0, 0.1)" d={
                                "M 0 "+selection[0]?.from?.toFixed(1)+
                                " L " + width + " "+selection[0]?.to?.toFixed(1)
                            } />
                            <path fill="none" stroke="rgba(0, 255, 0, 0.1)" d={
                                "M 0 "+selection[1]?.from?.toFixed(1)+
                                " L " + width + " "+selection[1]?.to?.toFixed(1)
                            } />
                    </g>   
                </svg>
                </div>
            </div>
        );
    }
}

export default WellLogSpacer;
