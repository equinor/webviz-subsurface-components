import React, { Component, ReactNode } from "react";

import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import { getAvailableAxes, WellLog } from "./utils/tracks";


const axisTitles: Record<string, string> = { // language dependent
    md: "MD",
    tvd: "TVD",
    time: "TIME",
};

// mnemos could be case insentitive ("Depth")
const axisMnemos: Record<string, string[]> = {
    md: ["DEPTH", "DEPT", "MD", "TDEP" /*"Tool Depth"*/], // depth based logging data,
    tvd: ["TVD", "TVDSS", "DVER" /*"TRUE Vertical depth"*/],
    time: ["TIME"], //  time based logging data
};



interface Props {
    welllog: WellLog;
    template: Record<string, any>;
}

interface Info {
    name?: string;
    units?: string;
    color: string;
    value: string;
    type: string; // line, linestep, area, ?dot?
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
    infos: Info[];
}

class WellLogViewer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const axes = getAvailableAxes(this.props.welllog, axisMnemos);
        let primaryAxis = axes[0];
        if (this.props.template && this.props.template.scale.primary) {
            if (axes.indexOf(this.props.template.scale.primary)>=0) 
                primaryAxis = this.props.template.scale.primary
        }
        this.state = {
            primaryAxis: axes[0], //"md"
            axes: axes, //["md", "tvd"]
            infos: [],
        };
    }

    componentDidUpdate(prevProps: Props): boolean {
        if (this.props.welllog !== prevProps.welllog || this.props.template !== prevProps.template) {
            const axes = getAvailableAxes(this.props.welllog, axisMnemos);
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) < 0) {
                    if (this.props.welllog === prevProps.welllog)
                        return false; // nothing to update
                }
                else {
                    primaryAxis = this.props.template.scale.primary
                }
            }
            this.setState({
                primaryAxis: primaryAxis,
                axes: axes,
                // will be changed by callback! infos: [],
            });
        }
        return true;
    }
    onChangePrimaryAxis(value: string): void {
        this.setState({
            primaryAxis: value,
            // will be changed by callback! infos: [],
        });
    }
    setInfo(infos: Info[]): void {
        this.setState({
            infos: infos,
        });
    }

    render(): ReactNode {
        return (
            <div>
                <table style={{ height: "100%", width: "100%" }}>
                    <tr>
                        <td>
                            <WellLogView
                                welllog={this.props.welllog}
                                template={this.props.template}
                                primaryAxis={this.state.primaryAxis}
                                setInfo={this.setInfo.bind(this)}
                                axisTitles={axisTitles}
                                axisMnemos={axisMnemos}
                            />
                        </td>
                        <td valign="top" style={{ width: "250px" }}>
                            <AxisSelector
                                header="Primary scale"
                                axes={this.state.axes}
                                axisLabels={axisTitles}
                                value={this.state.primaryAxis}
                                onChange={this.onChangePrimaryAxis.bind(this)}
                            />
                            <InfoPanel
                                header="Readout"
                                infos={this.state.infos}
                            />
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
}

export default WellLogViewer;
