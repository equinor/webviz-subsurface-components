import React, { Component, ReactNode } from "react";

import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import ScaleSelector from "./components/ScaleSelector";

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
    primary: string;
    infos: Info[];
}

class WellLogViewer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        //alert("props=" + props)

        this.state = {
            primary: "md",
            infos: [],
        };
    }

    onChangePrimaryScale(value: string): void {
        this.setState({ primary: value });
    }
    setInfo(infos: Info[]): void {
        this.setState({
            primary: this.state.primary,
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
                                primary={this.state.primary}
                                setInfo={this.setInfo.bind(this)}
                            />
                        </td>
                        <td valign="top" style={{ width: "250px" }}>
                            <ScaleSelector
                                header="Primary scale"
                                value={this.state.primary}
                                onChange={this.onChangePrimaryScale.bind(this)}
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
