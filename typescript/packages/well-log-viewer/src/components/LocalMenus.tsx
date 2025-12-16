import type { ReactNode } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

import type { Track, GraphTrack } from "@equinor/videx-wellog";

import type { Plot } from "@equinor/videx-wellog";
import type { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";

import type WellLogView from "./WellLogView";

import type { ExtPlotOptions } from "../utils/plots";
import { isScaleTrack } from "../utils/tracks";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { WellLogSet } from "./WellLogTypes";
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

function getPlotTitle(plot: Plot, wellLogSets: WellLogSet[]): string {
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
        title =
            getCurveFromVidexPlotId(wellLogSets, plot.id as string)?.name ?? "";
    }
    return title;
}

export const SimpleMenu: React.FC<Props> = ({
    anchorEl: initialAnchorEl,
    wellLogView,
    track,
    type,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(
        initialAnchorEl
    );

    useEffect(() => {
        setAnchorEl(initialAnchorEl);
    }, [initialAnchorEl]);

    const addTrack = useCallback(() => {
        wellLogView.addTrack(anchorEl, track);
    }, [wellLogView, anchorEl, track]);

    const editTrack = useCallback(() => {
        wellLogView.editTrack(anchorEl, track);
    }, [wellLogView, anchorEl, track]);

    const removeTrack = useCallback(() => {
        wellLogView.removeTrack(track);
    }, [wellLogView, track]);

    const addPlot = useCallback(() => {
        wellLogView.addPlot(anchorEl, track);
    }, [wellLogView, anchorEl, track]);

    const editPlots = useCallback(() => {
        editPlotsFunctionHelper(anchorEl, wellLogView, track);
    }, [anchorEl, wellLogView, track]);

    const removePlots = useCallback(() => {
        removePlotsFunctionHelper(anchorEl, wellLogView, track);
    }, [anchorEl, wellLogView, track]);

    const closeMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleContextMenu = useCallback(
        (ev: React.MouseEvent<HTMLElement>) => {
            ev.preventDefault();
            closeMenu();
        },
        [closeMenu]
    );

    const handleCloseMenu = useCallback(() => {
        closeMenu();
    }, [closeMenu]);

    const handleClickItem = useCallback(
        (action?: () => void) => {
            if (action) action();
            closeMenu();
        },
        [closeMenu]
    );

    const createRemovePlotMenuItem = useCallback(
        (title: string, plot: Plot): ReactNode => {
            return (
                <MenuItem
                    key={plot.id}
                    onClick={() =>
                        handleClickItem(() =>
                            wellLogView.removeTrackPlot(
                                track as GraphTrack,
                                plot
                            )
                        )
                    }
                >
                    &nbsp;&nbsp;&nbsp;&nbsp;{title}
                </MenuItem>
            );
        },
        [handleClickItem, wellLogView, track]
    );

    const menuRemovePlotItems = useCallback((): ReactNode[] => {
        const nodes: ReactNode[] = [];
        const wellLogSets = wellLogView.wellLogSets;

        if (!wellLogSets.length) return nodes;

        const plots = (track as GraphTrack).plots;

        for (const plot of plots) {
            const title = getPlotTitle(plot, wellLogSets);
            nodes.push(createRemovePlotMenuItem(title, plot));
        }
        return nodes;
    }, [wellLogView.wellLogSets, track, createRemovePlotMenuItem]);

    const createEditPlotMenuItem = useCallback(
        (title: string, plot: Plot): ReactNode => {
            return (
                <MenuItem
                    key={plot.id}
                    onClick={() =>
                        handleClickItem(() =>
                            wellLogView.editPlot(anchorEl, track, plot)
                        )
                    }
                >
                    &nbsp;&nbsp;&nbsp;&nbsp;{title}
                </MenuItem>
            );
        },
        [handleClickItem, wellLogView, anchorEl, track]
    );

    const menuEditPlotItems = useCallback((): ReactNode[] => {
        const nodes: ReactNode[] = [];
        const wellLogSets = wellLogView.wellLogSets;

        if (!wellLogSets.length) return nodes;

        const plots = (track as GraphTrack).plots;
        for (const plot of plots) {
            const title = getPlotTitle(plot, wellLogSets);
            nodes.push(createEditPlotMenuItem(title, plot));
        }

        return nodes;
    }, [wellLogView.wellLogSets, track, createEditPlotMenuItem]);

    const createMenuItem = useCallback(
        (title: string, action?: () => void): ReactNode => {
            return (
                <MenuItem key={title} onClick={() => handleClickItem(action)}>
                    &nbsp;&nbsp;&nbsp;&nbsp;{title}
                </MenuItem>
            );
        },
        [handleClickItem]
    );

    if (type === "removePlots") {
        return (
            <div className="local-menu">
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    onContextMenu={handleContextMenu}
                >
                    {menuRemovePlotItems()}
                </Menu>
            </div>
        );
    }
    if (type === "editPlots") {
        return (
            <div className="local-menu">
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    onContextMenu={handleContextMenu}
                >
                    {menuEditPlotItems()}
                </Menu>
            </div>
        );
    }
    if (type === "title") {
        return (
            <div className="local-menu">
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    onContextMenu={handleContextMenu}
                >
                    {createMenuItem("Add track", addTrack)}
                    {createMenuItem("Edit track", editTrack)}
                    {createMenuItem("Remove track", removeTrack)}
                </Menu>
            </div>
        );
    }

    // For type === "legends" or type === "container"
    const plots = (track as GraphTrack).plots;

    const createMenuItemForTrack = (track: GraphTrack): React.ReactNode => {
        if ((track as GraphTrack).options.plotFactory) {
            return [createMenuItem("Add plot", addPlot)];
        } else if (!isScaleTrack(track)) {
            return [createMenuItem("Edit track", editTrack)];
        }
        return [];
    };

    return (
        <div className="local-menu">
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onContextMenu={handleContextMenu}
            >
                {createMenuItemForTrack(track as GraphTrack)}
                {plots && plots.length
                    ? [
                          createMenuItem("Edit plot", editPlots),
                          createMenuItem("Remove plot", removePlots),
                      ]
                    : []}
            </Menu>
        </div>
    );
};

export function editPlotsFunctionHelper(
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
    createRoot(el).render(
        <SimpleMenu
            type="editPlots"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />
    );
}

export function removePlotsFunctionHelper(
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
    createRoot(el).render(
        <SimpleMenu
            type="removePlots"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />
    );
}

// Legacy function names for backward compatibility
export const editPlots = editPlotsFunctionHelper;
export const removePlots = removePlotsFunctionHelper;
