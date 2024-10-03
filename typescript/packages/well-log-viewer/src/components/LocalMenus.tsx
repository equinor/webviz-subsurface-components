import type { ReactNode } from "react";
import React, { Component } from "react";

import ReactDOM from "react-dom";

import type { Track, GraphTrack } from "@equinor/videx-wellog";

import type { Plot } from "@equinor/videx-wellog";
import type { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";

import type WellLogView from "./WellLogView";

import type { ExtPlotOptions } from "../utils/tracks";
import { isScaleTrack } from "../utils/tracks";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { WellLogCollection } from "./WellLogTypes";
import { getCurveFromVidexPlotId } from "../utils/well-log";

export interface Props {
    anchorEl: HTMLElement;
    wellLogView: WellLogView;
    track: Track;
    type: string;
    plotName?: string;
}
export interface State {
    anchorEl: HTMLElement | null;
}

function getPlotTitle(plot: Plot, wellLog: WellLogCollection): string {
    let title = "";
    const extOptions = plot.options as ExtPlotOptions;
    const legend = extOptions.legendInfo();
    if (legend) {
        if (legend.label) title = legend.label;
        const legend2 = legend as DifferentialPlotLegendInfo;
        // DifferentialPlot - 2 names!
        if (legend2.serie1 && legend2.serie1.label)
            title = legend2.serie1.label;
        if (legend2.serie2 && legend2.serie2.label)
            title += " \u2013 " /*ndash*/ + legend2.serie2.label;
    }

    if (!title) {
        // Extract the title from the well log
        title = getCurveFromVidexPlotId(wellLog, plot.id as string).name;
    }
    return title;
}

export class SimpleMenu extends Component<Props, State> {
    addTrack: () => void;
    editTrack: () => void;
    removeTrack: () => void;

    addPlot: () => void;
    editPlots: () => void;
    removePlots: () => void;

    constructor(props: Props) {
        super(props);
        this.state = { anchorEl: this.props.anchorEl };

        const wellLogView = this.props.wellLogView;
        this.addTrack = wellLogView.addTrack.bind(
            wellLogView,
            this.state.anchorEl,
            this.props.track
        );
        this.editTrack = wellLogView.editTrack.bind(
            wellLogView,
            this.state.anchorEl,
            this.props.track
        );
        this.removeTrack = wellLogView.removeTrack.bind(
            wellLogView,
            this.props.track
        );

        this.addPlot = wellLogView.addPlot.bind(
            wellLogView,
            this.state.anchorEl,
            this.props.track
        );
        this.editPlots = editPlots.bind(
            null,
            this.state.anchorEl,
            wellLogView,
            this.props.track
        );
        this.removePlots = removePlots.bind(
            null,
            this.state.anchorEl,
            wellLogView,
            this.props.track
        );
    }
    componentDidUpdate(prevProps: Props): void {
        if (this.props.anchorEl !== prevProps.anchorEl) {
            this.setState((_state, props) => {
                return { anchorEl: props.anchorEl };
            });
        }
    }

    closeMenu(): void {
        this.setState({ anchorEl: null });
    }

    handleContextMenu(ev: React.MouseEvent<HTMLElement>): void {
        ev.preventDefault();
        this.closeMenu();
    }
    handleCloseMenu(/*ev: React.MouseEvent<HTMLElement>*/): void {
        this.closeMenu();
    }
    handleClickItem(action?: () => void): void {
        if (action) action();
        this.closeMenu();
    }

    createRemovePlotMenuItem(title: string, plot: Plot): ReactNode {
        return (
            <MenuItem
                key={plot.id}
                onClick={() =>
                    this.handleClickItem(
                        this.props.wellLogView.removeTrackPlot.bind(
                            this.props.wellLogView,
                            this.props.track as GraphTrack,
                            plot
                        )
                    )
                }
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{title}
            </MenuItem>
        );
    }

    menuRemovePlotItems(): ReactNode[] {
        const nodes: ReactNode[] = [];
        const wellLog = this.props.wellLogView.wellLogCollection;

        if (!wellLog.length) return nodes;

        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        for (const plot of plots) {
            const title = getPlotTitle(plot, wellLog);
            nodes.push(this.createRemovePlotMenuItem(title, plot));
        }
        return nodes;
    }

    createEditPlotMenuItem(title: string, plot: Plot): ReactNode {
        return (
            <MenuItem
                key={plot.id}
                onClick={() =>
                    this.handleClickItem(
                        this.props.wellLogView.editPlot.bind(
                            this.props.wellLogView,
                            this.state.anchorEl,
                            this.props.track,
                            plot
                        )
                    )
                }
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{title}
            </MenuItem>
        );
    }

    menuEditPlotItems(): ReactNode[] {
        const nodes: ReactNode[] = [];
        const wellLog = this.props.wellLogView.wellLogCollection;

        if (!wellLog.length) return nodes;

        const track = this.props.track;
        const plots = (track as GraphTrack).plots;
        for (const plot of plots) {
            const title = getPlotTitle(plot, wellLog);
            nodes.push(this.createEditPlotMenuItem(title, plot));
        }

        return nodes;
    }

    createMenuItem(title: string, action?: () => void): ReactNode {
        return (
            <MenuItem key={title} onClick={() => this.handleClickItem(action)}>
                &nbsp;&nbsp;&nbsp;&nbsp;{title}
            </MenuItem>
        );
    }

    render(): JSX.Element {
        if (this.props.type == "removePlots") {
            return (
                <div className="local-menu">
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        {this.menuRemovePlotItems()}
                    </Menu>
                </div>
            );
        }
        if (this.props.type == "editPlots") {
            return (
                <div className="local-menu">
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        {this.menuEditPlotItems()}
                    </Menu>
                </div>
            );
        }
        if (this.props.type == "title") {
            return (
                <div className="local-menu">
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        {this.createMenuItem("Add track", this.addTrack)}
                        {this.createMenuItem("Edit track", this.editTrack)}
                        {this.createMenuItem("Remove track", this.removeTrack)}
                    </Menu>
                </div>
            );
        }

        // For this.props.type == "legends" or this.props.type == "container"

        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        const createMenuItem = (track: GraphTrack): React.ReactNode => {
            if ((track as GraphTrack).options.plotFactory) {
                return [this.createMenuItem("Add plot", this.addPlot)];
            } else if (!isScaleTrack(track)) {
                return [this.createMenuItem("Edit track", this.editTrack)];
            }
            return [];
        };

        return (
            <div className="local-menu">
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleCloseMenu.bind(this)}
                    onContextMenu={this.handleContextMenu.bind(this)}
                >
                    {createMenuItem(track as GraphTrack)}
                    {/* TODO: Fix this the next time the file is edited. */}
                    {/* eslint-disable-next-line react/prop-types */}
                    {plots && plots.length
                        ? [
                              this.createMenuItem("Edit plot", this.editPlots),
                              this.createMenuItem(
                                  "Remove plot",
                                  this.removePlots
                              ),
                          ]
                        : []}
                </Menu>
            </div>
        );
    }
}

export function editPlots(
    parent: HTMLElement | null,
    wellLogView: WellLogView,
    track: Track
): void {
    const plots = (track as GraphTrack).plots;
    if (plots && plots.length <= 1) {
        if (plots.length === 1) wellLogView.editPlot(parent, track, plots[0]);
        return;
    }

    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    if (parent) parent.appendChild(el);
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(
        <SimpleMenu
            type="editPlots"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />,
        el
    );
}

export function removePlots(
    parent: HTMLElement | null,
    wellLogView: WellLogView,
    track: Track
): void {
    const plots = (track as GraphTrack).plots;
    if (plots && plots.length <= 1) {
        if (plots.length === 1) wellLogView.removeTrackPlot(track, plots[0]);
        return;
    }

    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    if (parent) parent.appendChild(el);
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(
        <SimpleMenu
            type="removePlots"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />,
        el
    );
}
