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

function getPlotTitle(plot: Plot): string {
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.state = { anchorEl: this.props.anchorEl };

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const wellLogView = this.props.wellLogView;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.addTrack = wellLogView.addTrack.bind(
            wellLogView,
            this.state.anchorEl,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.editTrack = wellLogView.editTrack.bind(
            wellLogView,
            this.state.anchorEl,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.removeTrack = wellLogView.removeTrack.bind(
            wellLogView,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.addPlot = wellLogView.addPlot.bind(
            wellLogView,
            this.state.anchorEl,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );
        this.editPlots = editPlots.bind(
            null,
            this.state.anchorEl,
            wellLogView,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );
        this.removePlots = removePlots.bind(
            null,
            this.state.anchorEl,
            wellLogView,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.track
        );
    }
    componentDidUpdate(prevProps: Props): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.anchorEl !== prevProps.anchorEl) {
            this.setState((_state, props) => {
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
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
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        this.props.wellLogView.removeTrackPlot.bind(
                            // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
                            this.props.wellLogView, // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const welllog = this.props.wellLogView.props.welllog;
        if (welllog) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const track = this.props.track;
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const plots = (track as GraphTrack).plots;
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const curves = welllog.curves;
            for (const plot of plots) {
                const iCurve = plot.id as number;
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                const title = getPlotTitle(plot) || curves[iCurve].name;
                nodes.push(this.createRemovePlotMenuItem(title, plot));
            }
        }
        return nodes;
    }

    createEditPlotMenuItem(title: string, plot: Plot): ReactNode {
        return (
            <MenuItem
                key={plot.id}
                onClick={() =>
                    this.handleClickItem(
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        this.props.wellLogView.editPlot.bind(
                            // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
                            this.props.wellLogView,
                            this.state.anchorEl, // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const welllog = this.props.wellLogView.props.welllog;
        if (welllog) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const track = this.props.track;
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const plots = (track as GraphTrack).plots;
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const curves = welllog.curves;
            for (const plot of plots) {
                const iCurve = plot.id as number;
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                const title = getPlotTitle(plot) || curves[iCurve].name;
                nodes.push(this.createEditPlotMenuItem(title, plot));
            }
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
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

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const track = this.props.track;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const plots = (track as GraphTrack).plots;

        const createMenuItem = (track: GraphTrack): React.ReactNode => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
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
