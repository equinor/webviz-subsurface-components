import React, { Component, ReactNode } from "react";

import ReactDOM from "react-dom";

import { Track, GraphTrack } from "@equinor/videx-wellog";

import WellLogView from "./WellLogView";

import { Plot } from "@equinor/videx-wellog";
import { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";

import { ExtPlotOptions } from "../utils/tracks";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

export interface SimpleMenuProps {
    anchorEl: HTMLElement;
    wellLogView: WellLogView;
    track: Track;
    type: string;
    plotName?: string;
}
export interface SimpleMenuState {
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

export class SimpleMenu extends Component<SimpleMenuProps, SimpleMenuState> {
    constructor(props: SimpleMenuProps) {
        super(props);
        this.state = { anchorEl: this.props.anchorEl };

        this.addTrack = this.addTrack.bind(this);
        this.editTrack = this.editTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }
    componentDidUpdate(prevProps: SimpleMenuProps): void {
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
        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        const welllog = this.props.wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const curves = welllog[0].curves;

            for (const plot of plots) {
                const iCurve = plot.id as number;
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
        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        const welllog = this.props.wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const curves = welllog[0].curves;

            for (const plot of plots) {
                const iCurve = plot.id as number;
                const title = getPlotTitle(plot) || curves[iCurve].name;
                nodes.push(this.createEditPlotMenuItem(title, plot));
            }
        }

        return nodes;
    }

    removePlots(parent: HTMLElement | null): void {
        if (parent)
            removePlots(parent, this.props.wellLogView, this.props.track);
    }
    editPlots(parent: HTMLElement | null): void {
        if (parent) editPlots(parent, this.props.wellLogView, this.props.track);
    }

    addTrack(): void {
        this.props.wellLogView.addTrack(this.state.anchorEl, this.props.track);
    }
    editTrack(): void {
        this.props.wellLogView.editTrack(this.state.anchorEl, this.props.track);
    }
    removeTrack(): void {
        this.props.wellLogView.removeTrack(this.props.track);
    }

    createMenuItem(title: string, action?: () => void): ReactNode {
        return (
            <MenuItem key={title} onClick={() => this.handleClickItem(action)}>
                &nbsp;&nbsp;&nbsp;&nbsp;{title}
            </MenuItem>
        );
    }

    render(): ReactNode {
        if (this.props.type == "removePlots") {
            return (
                <div>
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
        } else if (this.props.type == "editPlots") {
            return (
                <div>
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
                <div>
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

        return (
            <div>
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleCloseMenu.bind(this)}
                    onContextMenu={this.handleContextMenu.bind(this)}
                >
                    {!(track as GraphTrack).options.plotFactory
                        ? []
                        : [
                              <MenuItem
                                  key="333"
                                  onClick={this.handleClickItem.bind(
                                      this,
                                      this.props.wellLogView.addPlot.bind(
                                          this.props.wellLogView,
                                          this.state.anchorEl,
                                          track
                                      )
                                  )}
                              >
                                  {"Add plot"}
                              </MenuItem>,
                          ]}

                    {!plots || !plots.length
                        ? []
                        : [
                              <MenuItem
                                  key="222"
                                  onClick={this.handleClickItem.bind(
                                      this,
                                      this.editPlots.bind(
                                          this,
                                          this.state.anchorEl
                                      )
                                  )}
                              >
                                  {"Edit plot"}
                              </MenuItem>,
                          ]}

                    {!plots || !plots.length
                        ? []
                        : [
                              <MenuItem
                                  key="111"
                                  onClick={this.handleClickItem.bind(
                                      this,
                                      this.removePlots.bind(
                                          this,
                                          this.state.anchorEl
                                      )
                                  )}
                              >
                                  {"Remove plot"}
                              </MenuItem>,
                          ]}
                </Menu>
            </div>
        );
    }
}

export function editPlots(
    parent: HTMLElement,
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
    parent.appendChild(el);
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
    parent: HTMLElement,
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
    parent.appendChild(el);
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
