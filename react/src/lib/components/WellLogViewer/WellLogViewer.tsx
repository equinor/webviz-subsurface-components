import React, { Component, ReactNode } from "react";

import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

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
    scales: string[]; // scales available in welllog
    primaryAxis: string;
    infos: Info[];
}

class WellLogViewer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        //alert("props=" + props)

        this.state = {
            primaryAxis: "md",
            scales: [], 
            infos: [],
        };
    }

    onChangePrimaryAxis(value: string): void {
        this.setState(
            {
                primaryAxis: value,
                infos: this.state.infos,
                scales: this.state.scales
            }
        );
    }
    setInfo(infos: Info[]): void {
        this.setState({
            primaryAxis: this.state.primaryAxis,
            infos: infos,
            scales: this.state.scales
        });
    }
    setAvailableAxes(scales: string[]): void { // "md", "tvd", "time"
        this.setState({
            primaryAxis: scales[0],
            infos: this.state.infos,
            scales: scales
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
