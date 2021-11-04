import React, { Component, ReactNode } from "react";

import ReactDOM from "react-dom";

import { TemplatePlot } from "./WellLogTemplateTypes";
import { PlotPropertiesDialog } from "./PlotDialog";

import { newGraphTrack } from "../utils/tracks";

import { Track, GraphTrack } from "@equinor/videx-wellog";

import WellLogView from "./WellLogView";

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

export class SimpleMenu extends Component<SimpleMenuProps, SimpleMenuState> {
    constructor(props: SimpleMenuProps) {
        super(props);
        this.state = { anchorEl: this.props.anchorEl };

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }
    componentDidUpdate(prevProps: SimpleMenuProps): void {
        if (this.props.anchorEl !== prevProps.anchorEl) {
            this.setState({ anchorEl: this.props.anchorEl });
        }
        /*if (
            this.props.welllog !== prevProps.welllog ||
            this.props.track !== prevProps.track
        ) {
        }*/
    }

    closeMenu(): void {
        this.setState({ anchorEl: null });
    }

    handleContextMenu(ev: React.MouseEvent<HTMLElement>): void {
        ev.preventDefault();
        this.closeMenu();
    }
    handleCloseMenu(ev: React.MouseEvent<HTMLElement>): void {
        ev;
        this.closeMenu();
    }
    handleClickItem(action?: () => void): void {
        if (action) action();
        this.closeMenu();
    }

    createRemovePlotMenuItem(item: string): ReactNode {
        return (
            <MenuItem
                key={item}
                onClick={() => {
                    this.handleClickItem(this.removePlot.bind(this, item));
                }}
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{item}
            </MenuItem>
        );
    }

    removePlot(item: string): void {
        console.log("removePlot(" + item + ")");
        const track = this.props.track;

        this.props.wellLogView.removeGraphTrackPlot(track as GraphTrack, item);
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
                nodes.push(this.createRemovePlotMenuItem(curves[iCurve].name));
            }
        }

        return nodes;
    }

    onOK(templatePlot: TemplatePlot): void {
        console.log("onOK(" + templatePlot + ")");
        const track = this.props.track;

        this.props.wellLogView.addGraphTrackPlot(
            track as GraphTrack,
            templatePlot
        );
    }
    addPlots(parent: HTMLElement | null): void {
        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);
            ReactDOM.render(
                <PlotPropertiesDialog
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                    onOK={this.onOK.bind(this)}
                />,
                el
            );
        }
    }
    editPlots(parent: HTMLElement | null): void {
        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);

            const templatePlot = {
                name: "DEPT",
                style: "",
                type: "line",
                color: "black",
            };

            ReactDOM.render(
                <PlotPropertiesDialog
                    templatePlot={templatePlot}
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                    onOK={this.onOK.bind(this)}
                />,
                el
            );
        }
    }
    removePlots(parent: HTMLElement | null): void {
        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);
            ReactDOM.render(
                <SimpleMenu
                    type="removePlots"
                    anchorEl={el}
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                />,
                el
            );
        }
    }

    addTrack(): void {
        //newScaleTrack
        //newDualScaleTrack
        const trackNew = newGraphTrack("new Track", [], []);
        this.props.wellLogView.addTrack(trackNew, this.props.track, true);
    }
    removeTrack(): void {
        this.props.wellLogView.removeTrack(this.props.track);
    }

    render(): ReactNode {
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
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(this.addTrack);
                            }}
                        >
                            {"Add track"}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(this.removeTrack);
                            }}
                        >
                            {"Remove track"}
                        </MenuItem>
                    </Menu>
                </div>
            );
        }

        if (this.props.type == "container") {
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
                        <MenuItem>{"Menu item 1"}</MenuItem>
                        <MenuItem>{"Menu item 2"}</MenuItem>
                    </Menu>
                </div>
            );
        }

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
        }

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
                    <MenuItem
                        onClick={this.handleClickItem.bind(
                            this,
                            this.addPlots.bind(this, this.state.anchorEl)
                        )}
                    >
                        {"Add plot"}
                    </MenuItem>

                    {!plots.length
                        ? []
                        : [
                              <MenuItem
                                  key="111"
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

                    {!plots.length
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
