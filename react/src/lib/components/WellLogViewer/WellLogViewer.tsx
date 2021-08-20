import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";
import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";
import { WellLogController } from "./components/WellLogView";

import { getAvailableAxes } from "./utils/tracks";

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
    public static propTypes: Record<string, unknown>;

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

    componentDidUpdate(prevProps: Props): void {
        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template
        ) {
            const axes = getAvailableAxes(this.props.welllog, axisMnemos);
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) < 0) {
                    if (this.props.welllog === prevProps.welllog)
                        return /* false*/; // nothing to update
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
    }

    setInfo(infos: Info[]): void {
        this.setState({
            infos: infos,
        });
    }
    setController(controller: WellLogController): void {
        this.controller = controller;
        this._enableScroll();
    }

    setScrollPos(pos: number): void {
        console.log(pos);
        this._enableScroll();
    }

    onChangePrimaryAxis(value: string): void {
        this.setState({
            primaryAxis: value,
            // will be changed by callback! infos: [],
        });
    }

    onScrollUp(): void {
        if (this.controller) this.controller.scrollUp();
    }
    onScrollDown(): void {
        if (this.controller) this.controller.scrollDown();
    }

    _enableScroll(): void {
        const pos = this.controller ? this.controller.getScrollPos() : 0;
        const n = this.controller ? this.controller.getScrollMax() : 0;
        const down = document.getElementById("buttonDown") as HTMLButtonElement;
        const up = document.getElementById("buttonUp") as HTMLButtonElement;
        if (down) {
            if (pos + 1 < n) down.removeAttribute("disabled");
            else down.setAttribute("disabled", "true");
        }
        if (up) {
            if (pos > 0) up.removeAttribute("disabled");
            else up.setAttribute("disabled", "true");
        }
    }

    render(): ReactNode {
        return (
            <table style={{ height: "100%", width: "100%" }}>
                <tbody>
                    <tr>
                        <td style={{ height: "100%" }}>
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
                            />{" "}
                            {/*scroll={this.state.scroll}*/}
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
                                <br />
                                <button
                                    id="buttonUp"
                                    type="button"
                                    onClick={this.onScrollUp.bind(this)}
                                >
                                    {"\u25C4"}
                                </button>
                                <button
                                    id="buttonDown"
                                    type="button"
                                    onClick={this.onScrollDown.bind(this)}
                                >
                                    {"\u25BA"}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

WellLogViewer.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    // TODO: Add doc
    welllog: PropTypes.array,

    // TODO: Add doc
    template: PropTypes.object,
};

export default WellLogViewer;
