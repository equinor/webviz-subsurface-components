# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

from pathlib import Path
import base64
from random import uniform
from webviz_subsurface_components.deckgl_map_wrapper.deckgl_map_controller import (
    DeckGLMapController,
)

from dash import Dash, Input, Output, State, callback, callback_context, html, no_update
from dash.exceptions import PreventUpdate
import pandas as pd
import xtgeo
import webviz_core_components as wcc
import webviz_subsurface_components as wsc


def make_pies(coords):
    properties = [
        {"color": [253, 231, 37], "label": "swat"},
        {"color": [33, 201, 98], "label": "soil"},
        {"color": [68, 1, 84], "label": "sgas"},
    ]
    pies = []
    for _, row in coords.iterrows():
        swat = uniform(0, 0.5)
        soil = uniform(0, 0.5)
        sgas = 1 - soil - swat
        pies.append(
            {
                "x": row["utm_x"],
                "y": row["utm_y"],
                "R": 300,
                "fractions": [
                    {"value": swat, "idx": 0},
                    {"value": soil, "idx": 1},
                    {"value": sgas, "idx": 2},
                ],
            }
        )
    return {"pies": pies, "properties": properties}


if __name__ == "__main__":

    # Example data
    WELLS = [
        xtgeo.well_from_file(fn) for fn in Path().glob("../testdata/wells/*.rmswell")
    ]
    WELLS = {well.name: well for well in WELLS}

    SURFACES = {
        fn.stem: xtgeo.surface_from_file(fn)
        for fn in Path().glob("../testdata/surfaces/*.gri")
    }
    COLORMAPS = {
        fn.stem: f"data:image/png;base64,{base64.b64encode(open(fn, 'rb').read()).decode('ascii')}"
        for fn in Path().glob("../testdata/colormaps/*.png")
    }
    rft = pd.read_csv("../testdata/rft.csv")

    rft_dates = sorted(list(rft["time"].unique()))
    rft_realizations = sorted(list(rft["REAL"].unique()))
    rft_zones = sorted(list(rft["zone"].unique()))
    rft_coords = rft.groupby(["utm_x", "utm_y"]).size().reset_index()

    colormap_layout = html.Div(
        children=[
            wcc.Dropdown(
                label="Colormap",
                id="colormap-select",
                options=[{"label": name, "value": name} for name in COLORMAPS.keys()],
                value="viridis",
                clearable=False,
            ),
            wcc.RangeSlider(label="Value range", id="colormap-range"),
        ],
    )
    clear_drawing_btn = html.Button("Clear drawings", id="clear-drawing-layer")
    map_dropdown = wcc.Dropdown(
        label="Surface",
        id="surface-select",
        options=[
            {
                "label": surface_name,
                "value": surface_name,
            }
            for surface_name in SURFACES.keys()
        ],
        value=next(iter(SURFACES)),
        clearable=False,
    )
    map_refine_dropdown = wcc.Dropdown(
        label="Refine surface",
        id="surface-refine",
        options=[
            {
                "label": "Refine by 2",
                "value": 2,
            },
            {
                "label": "Refine by 4",
                "value": 4,
            },
            {
                "label": "Refine by 8",
                "value": 8,
            },
        ],
        placeholder="Refine resolution by a factor of...",
        value=None,
        clearable=True,
    )
    well_dropdown = wcc.SelectWithLabel(
        label="Wells",
        id="well-select",
        options=[
            {
                "label": well_name,
                "value": well_name,
            }
            for well_name in WELLS.keys()
        ],
        value=list(WELLS.keys()),
        size=10,
    )

    rft_layout = html.Div(
        children=[
            wcc.Slider(
                label="Date",
                id="rft-date",
                value=0,
                min=0,
                max=len(rft_dates) - 1,
                included=False,
                marks={
                    idx: {
                        "label": rft_dates[idx],
                        "style": {
                            "white-space": "nowrap",
                        },
                    }
                    for idx in [0, len(rft_dates) - 1]
                },
                updatemode="drag",
            ),
            wcc.Slider(
                label="Realization",
                id="rft-real",
                value=rft_realizations[0],
                min=rft_realizations[0],
                max=rft_realizations[-1],
                updatemode="drag",
            ),
            wcc.RadioItems(
                label="Zone",
                id="rft-zone",
                options=[{"label": zone, "value": zone} for zone in rft_zones],
                value=rft_zones[0],
            ),
        ],
    )
    app = Dash(__name__)

    app.layout = wcc.FlexBox(
        children=[
            wcc.Frame(
                style={
                    "flex": 1,
                },
                children=[
                    wcc.Selectors(
                        label="Data",
                        children=[map_dropdown, map_refine_dropdown, well_dropdown],
                    ),
                    wcc.Selectors(
                        label="Simulated saturation points", children=[rft_layout]
                    ),
                    wcc.Selectors(
                        label="Visual Settings",
                        children=[colormap_layout, clear_drawing_btn],
                    ),
                    html.Pre(
                        style={"fontSize": "0.7em", "overflow-x": "auto"},
                        id="surface-details",
                    ),
                ],
            ),
            html.Div(
                style={"flex": 5, "height": "90vh"},
                children=[
                    wcc.Frame(
                        style={"height": "90vh"},
                        children=[
                            wsc.DeckGLMapViewer(
                                id="deckgl-map",
                                surface=True,
                                wells=True,
                                pie_charts=True,
                                # drawing=True,
                            )
                        ],
                    )
                ],
            ),
            wcc.Frame(
                style={"flex": 5, "height": "90vh", "overflow-y": "scroll"},
                children=[
                    wsc.WellLogViewer(
                        id="well-log-viewer",
                        template={
                            "name": "All logs",
                            "scale": {"primary": "MD", "allowSecondary": True},
                            "tracks": [
                                {
                                    "title": "Porosity",
                                    "plots": [
                                        {
                                            "name": "PHIT",
                                            "type": "area",
                                            "color": "green",
                                        },
                                        {"name": "PHIT_ORIG", "type": "line"},
                                    ],
                                },
                                {"plots": [{"name": "ZONE", "type": "area"}]},
                                {"plots": [{"name": "FACIES", "type": "area"}]},
                                {"plots": [{"name": "VSH", "type": "area"}]},
                                {"plots": [{"name": "SW", "type": "dot"}]},
                                {"plots": [{"name": "VP", "type": "line"}]},
                                {"plots": [{"name": "VS", "type": "line"}]},
                                {"plots": [{"name": "AI", "type": "line"}]},
                                {"plots": [{"name": "DENS", "type": "line"}]},
                                {"plots": [{"name": "SI", "type": "line"}]},
                                {"plots": [{"name": "VPVS", "type": "line"}]},
                                {"plots": [{"name": "VPHYL", "type": "line"}]},
                            ],
                            "styles": [],
                        },
                    )
                ],
            ),
        ],
    )

    @callback(
        Output("deckgl-map", "resources"),
        Output("surface-details", "children"),
        Input("surface-select", "value"),
        Input("surface-refine", "value"),
        Input("well-select", "value"),
        State("deckgl-map", "resources"),
    )
    def _update_resources(surface_name, surface_refine, well_names, current_resources):
        """Handle resources (map and well data)"""
        map_controller = wsc.DeckGLMapController(current_resources=current_resources)
        ctx = callback_context.triggered[0]["prop_id"]

        surface_describe = no_update
        if ctx == "." or "surface" in ctx:
            surface = SURFACES[surface_name]
            if surface_refine:
                surface = surface.copy()
                surface.refine(surface_refine)

            surface_describe = surface.describe(flush=False)
            surface_data = wsc.XtgeoSurfaceArray(surface)

            map_controller.set_surface_data(
                image=surface_data.map_image,
                bounds=surface_data.map_bounds,
                target=surface_data.view_target,
                range=[surface_data.min_val, surface_data.max_val],
            )

        if ctx == "." or "well-select" in ctx:
            wells = [well for name, well in WELLS.items() if name in well_names]
            for well in WELLS.values():
                print(well.name)
            well_data = wsc.XtgeoWellsJson(wells)
            map_controller.set_well_data(well_data.feature_collection)

        return map_controller.resources, surface_describe

    @callback(
        Output("deckgl-map", "deckglSpecPatch"),
        Input("deckgl-map", "deckglSpecBase"),
        Input("colormap-select", "value"),
        Input("colormap-range", "value"),
        Input("rft-date", "value"),
        Input("rft-real", "value"),
        Input("rft-zone", "value"),
        Input("clear-drawing-layer", "n_clicks"),
        State("deckgl-map", "deckglSpecBase"),
        State("deckgl-map", "deckglSpecPatch"),
    )
    def update_color_map(
        spec,
        colormap,
        colormap_range,
        _rft_date,
        _rft_real,
        _rft_zone,
        _clear_drawing,
        current_spec,
        client_patch,
    ):
        """Patch based update to modify parts of the map specification."""

        ctx = callback_context.triggered[0]["prop_id"]

        map_controller = wsc.DeckGLMapController(
            current_spec, client_patch=client_patch
        )
        if ctx == "." or "colormap-select" in ctx:
            map_controller.update_colormap(COLORMAPS[colormap])
        if ctx == "." or "colormap-range" in ctx:
            map_controller.update_colormap_range(colormap_range)
        if ctx == "." or "rft" in ctx:
            map_controller.update_pie_data(make_pies(rft_coords))

        if "clear-drawing-layer" in ctx:
            print("ok")
            map_controller.clear_drawing_layer()

        return map_controller.spec_patch

    @callback(
        Output("colormap-range", "min"),
        Output("colormap-range", "max"),
        Output("colormap-range", "step"),
        Output("colormap-range", "value"),
        Output("colormap-range", "marks"),
        Input("surface-select", "value"),
        State("colormap-range", "value"),
    )
    def _update_colormap_range(surface_name, current_val):
        ctx = callback_context.triggered[0]["prop_id"]
        surface_data = wsc.XtgeoSurfaceArray(SURFACES[surface_name])
        min_val = surface_data.min_val
        max_val = surface_data.max_val
        if ctx == ".":
            value = no_update
        elif current_val is not None:
            value = current_val
        else:
            value = [min_val, max_val]
        return (
            min_val,
            max_val,
            (max_val - min_val) / 100,
            value,
            {
                str(min_val): {"label": f"{min_val:.2f}"},
                str(max_val): {"label": f"{max_val:.2f}"},
            },
        )

    @callback(
        Output("well-log-viewer", "welllog"),
        Input("deckgl-map", "deckglSpecPatch"),
    )
    def _update_logs(client_patches):
        """Update Well log view with the well selected in the map"""
        well_list = DeckGLMapController.selected_wells_from_patch(client_patches)
        if well_list:
            well = WELLS[well_list[0]]
            logs = wsc.XtgeoLogsJson(well)
            return logs.data
        raise PreventUpdate

    app.run_server(debug=False)
