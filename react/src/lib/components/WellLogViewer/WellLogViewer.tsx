import React, { Component, ReactNode } from "react";

import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import { getAvailableAxes } from "./utils/tracks";

const labels: Record<string, string> = {
    md: "MD",
    tvd: "TVD",
    time: "TIME",
};

interface Props {
    welllog: [];
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
        //alert("props=" + props)

        const axes = getAvailableAxes(this.props.welllog);
        this.state = {
            primaryAxis: axes[0], //"md"
            axes: axes, //["md", "tvd"]
            infos: [],
        };
    }

    componentDidUpdate(prevProps /*, prevState*/): boolean {
        if (this.props.welllog !== prevProps.welllog) {
            const axes = getAvailableAxes(this.props.welllog);
            this.setState({
                primaryAxis: axes[0],
                axes: axes,
                infos: this.state.infos,
            });
        }
        return true;
    }
    onChangePrimaryAxis(value: string): void {
        this.setState({
            primaryAxis: value,
            infos: this.state.infos,
            axes: this.state.axes,
        });
    }
    setInfo(infos: Info[]): void {
        this.setState({
            primaryAxis: this.state.primaryAxis,
            infos: infos,
            axes: this.state.axes,
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
                                primaryAxis={this.state.primaryAxis}
                                setInfo={this.setInfo.bind(this)}
                            />
                        </td>
                        <td valign="top" style={{ width: "250px" }}>
                            <AxisSelector
                                header="Primary scale"
                                axes={this.state.axes}
                                axisLabels={labels}
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
