# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

from pathlib import Path
import base64
from random import uniform
import json

from dash import Dash, Input, Output, State, callback, callback_context, html, no_update
from dash.exceptions import PreventUpdate
import pandas as pd
import xtgeo
import webviz_core_components as wcc
import webviz_subsurface_components as wsc


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
                        label="Visual Settings",
                        children=[colormap_layout, clear_drawing_btn],
                    ),
                    html.Pre(
                        style={"fontSize": "0.7em", "overflow-x": "auto"},
                        id="drawn-polyline",
                    ),
                ],
            ),
            html.Div(
                style={"flex": 5, "height": "90vh"},
                children=[
                    wcc.Frame(
                        style={"height": "90vh"},
                        children=[wsc.DeckGLMapAIO(aio_id="mapview")],
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
        Output(wsc.DeckGLMapAIO.ids.map("mapview"), "resources"),
        Input("surface-select", "value"),
        Input("well-select", "value"),
        State(wsc.DeckGLMapAIO.ids.map("mapview"), "resources"),
    )
    def _update_resources(surface_name, well_names, current_resources):
        """Handle resources (map and well data)"""
        ctx = callback_context.triggered[0]["prop_id"]

        if ctx == "." or "surface" in ctx:
            surface = SURFACES[surface_name]
            surface_data = wsc.XtgeoSurfaceArray(surface)
            current_resources.update(
                {
                    "mapImage": surface_data.map_image,
                    "mapRange": [surface_data.min_val, surface_data.max_val],
                    "mapBounds": surface_data.map_bounds,
                    "mapTarget": surface_data.view_target,
                }
            )
        if ctx == "." or "well-select" in ctx:
            wells = [well for name, well in WELLS.items() if name in well_names]
            well_data = wsc.XtgeoWellsJson(wells)
            current_resources.update({"wellData": well_data.feature_collection})
        return current_resources

    @callback(
        Output(wsc.DeckGLMapAIO.ids.colormap_image("mapview"), "data"),
        Input("colormap-select", "value"),
    )
    def _update_color_map_image(colormap):
        return COLORMAPS[colormap]

    @callback(
        Output(wsc.DeckGLMapAIO.ids.colormap_range("mapview"), "data"),
        Input("colormap-range", "value"),
    )
    def _update_color_map_range(colormap_range):
        return colormap_range

    @callback(
        Output("drawn-polyline", "children"),
        Input(wsc.DeckGLMapAIO.ids.polylines("mapview"), "data"),
    )
    def _show_polyline_coords(polylist):
        return json.dumps(polylist, indent=4)

    @callback(
        Output("well-log-viewer", "welllog"),
        Input(wsc.DeckGLMapAIO.ids.selected_well("mapview"), "data"),
    )
    def _update_logs(selected_well):
        """Update Well log view with the well selected in the map"""

        if selected_well is None:
            raise PreventUpdate
        well = WELLS[selected_well]
        logs = wsc.XtgeoLogsJson(well)
        return logs.data

    @callback(
        Output("colormap-range", "min"),
        Output("colormap-range", "max"),
        Output("colormap-range", "step"),
        Output("colormap-range", "value"),
        Output("colormap-range", "marks"),
        Input("surface-select", "value"),
        State("colormap-range", "value"),
    )
    def _update_allowed_colormap_range(surface_name, current_val):
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

    app.run_server(debug=True)
