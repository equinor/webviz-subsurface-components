import React, { Component, ReactNode } from "react";

import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import { Template, WellLogController } from "./components/WellLogView";
import { getAvailableAxes, WellLog } from "./utils/tracks";

const axisTitles: Record<string, string> = {
    // language dependent
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
    template: Template;
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

    scroll: number;
}

class WellLogViewer extends Component<Props, State> {
    controller?: WellLogController;

    constructor(props: Props) {
        super(props);

        const axes = getAvailableAxes(this.props.welllog, axisMnemos);
        let primaryAxis = axes[0];
        if (this.props.template && this.props.template.scale.primary) {
            if (axes.indexOf(this.props.template.scale.primary) >= 0)
                primaryAxis = this.props.template.scale.primary;
        }
        this.state = {
            primaryAxis: primaryAxis, //"md"
            axes: axes, //["md", "tvd"]
            infos: [],

            scroll: 0,
        };

        this.controller = undefined;
    }

    componentDidMount(): void {
        this._enableScroll();
    }

    componentDidUpdate(prevProps: Props): boolean {
        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template
        ) {
            const axes = getAvailableAxes(this.props.welllog, axisMnemos);
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) < 0) {
                    if (this.props.welllog === prevProps.welllog) return false; // nothing to update
                } else {
                    primaryAxis = this.props.template.scale.primary;
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

    setInfo(infos: Info[]): void {
        this.setState({
            infos: infos,
        });
    }
    setController(controller: WellLogController) {
        this.controller = controller;
        this._enableScroll();
    }
    setScrollPos(pos: number) {
        this._enableScroll();
    }

    onChangePrimaryAxis(value: string): void {
        this.setState({
            primaryAxis: value,
            // will be changed by callback! infos: [],
        });
    }

    onScrollUp() {
        if (this.controller)
            this.controller.scrollUp();
    }
    onScrollDown() {
        if (this.controller)
            this.controller.scrollDown();
    }

    _enableScroll() {
        const pos = this.controller? this.controller.getScrollPos(): 0;
        const n = this.controller? this.controller.getScrollMax(): 0;
        let down = document.getElementById("buttonDown") as HTMLButtonElement;
        let up = document.getElementById("buttonUp") as HTMLButtonElement;
        if (down) {
            if (pos + 1 < n)
                down.removeAttribute("disabled");
            else
                down.setAttribute("disabled", "true");
        }
        if (up) {
            if (pos > 0)
                up.removeAttribute("disabled");
            else
                up.setAttribute("disabled", "true");
        }
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
                                axisTitles={axisTitles}
                                axisMnemos={axisMnemos}
                                maxTrackNum={7}
                                setInfo={this.setInfo.bind(this)}
                                setController={this.setController.bind(this)}
                                setScrollPos={this.setScrollPos.bind(this)}
                            /> {/*scroll={this.state.scroll}*/}
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
                            <div>
                                <br/>
                                <button id="buttonUp" type="button" onClick={this.onScrollUp.bind(this)}>{"\u25C4"}</button> 
                                <button id="buttonDown" type="button" onClick={this.onScrollDown.bind(this)}>{"\u25BA"}</button> 
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
}

export default WellLogViewer;
