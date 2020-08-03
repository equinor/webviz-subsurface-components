import io
import json
import base64
from typing import List

import numpy as np
from matplotlib import cm
import dash
import dash_colorscales
import dash_core_components as dcc
from dash_extensions.callback import CallbackGrouper
from dash.dependencies import Input, Output, State
import dash_html_components as html
import webviz_subsurface_components

from example_layered_map import array_to_png

DEFAULT_COLORSCALE_COLORS = [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
]

if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt("examples/example-data/layered-map-data.npz.gz")

    min_value = int(np.nanmin(map_data))
    max_value = int(np.nanmax(map_data))

    map_data = array_to_png(map_data)
    colormap = array_to_png(
        cm.get_cmap("magma", 256)([np.linspace(0, 1, 256)]), colormap=True
    )

    state = {
        "switch": {"value": False},
        "pixel_scale": 10000,
        "elevation_scale": 1,
    }

    layers = [
        {
            "name": "A seismic horizon with colormap",
            "id": 1,
            "baseLayer": True,
            "checked": True,
            "action": None,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "colorScale": {
                        "colors": DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value,
                    },
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [30, 30]],
                    "shader": {"setBlackToAlpha": True},
                },
            ],
        },
        {
            "name": "Tile Map",
            "id": 2,
            "baseLayer": True,
            "checked": False,
            "action": None,
            "data": [
                {
                    "colorScale": {
                        "colors": DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value,
                    },
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "type": "tile",
                    "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    "colormap": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAAuElEQVR4nI2NyxUDIQwDR6K0lJD+W1nnABgvIZ8DT7JGNnroieRAQjJYMFQ2SDBUk0mrl16odGce05de9Z2zzStLLhEuvurIZzeZOedizd7mT70f7JOe7v7XA/jBBaH4ztn3462z37l1c7/ys1f6QFNZuUZ+1+JZ3oVN79FxctLvLB/XIQuslbe3+eSv7LVyd/KmC9O13Vjf63zt7r3kW7dR/iVuvv/H8NBE1/SiIayhiCZjhDFN5gX8UYgJzVykqAAAAABJRU5ErkJggg==",
                    "shader": {"type": "none", "elevationScale": 0.01,},
                }
            ],
        },
    ]

    leaflet_map_1 = webviz_subsurface_components.LeafletMap(
        id="example-map",
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
        updateMode="",
    )

    app = dash.Dash(__name__)

    # Dash extension used to call multiple callbacks on the same output
    cg = CallbackGrouper()

    app.layout = html.Div(
        children=[
            html.Div(
                [
                    "Layer to edit:",
                    dcc.Dropdown(
                        id="selected-layer",
                        options=[
                            {"label": "A seismic horizon with colormap", "value": "1"},
                            {"label": "Tile Map", "value": "2"},
                        ],
                        value="1",
                    ),
                ]
            ),
            html.Div(
                [
                    html.Div(
                        [
                            html.H6(
                                "Minimum, maximum map values",
                                id="min-max-output-container",
                            ),
                            dcc.RangeSlider(
                                id="min-max-slider",
                                min=min_value - 1000,
                                max=max_value + 1000,
                                step=1,
                                value=[min_value, max_value],
                                marks={
                                    str(min_value - 1000): str(min_value - 1000),
                                    str(max_value + 1000): str(max_value + 1000),
                                },
                            ),
                        ]
                    ),
                    html.Div(
                        [
                            html.H6("Cutoff points", id="cut-output-container"),
                            dcc.RangeSlider(
                                id="cut-slider",
                                min=min_value,
                                max=max_value,
                                step=1,
                                value=[min_value, max_value],
                                marks={
                                    min_value: str(min_value),
                                    max_value: str(max_value),
                                },
                            ),
                        ]
                    ),
                ]
            ),
            html.Div(
                [
                    html.Button("Toggle log", id="log-toggle-btn"),
                    dash_colorscales.DashColorscales(
                        id="layer-colorscale", nSwatches=7, fixSwatches=True
                    ),
                    html.P(id="output", children=""),
                ]
            ),
            html.Div(
                children=[leaflet_map_1,],
                style={
                    "display": "grid",
                    "gridTemplateColumns": "1fr 1fr",
                    "minHeight": "90vh",
                    "padding-left": "25%",
                },
            ),
        ]
    )

    def get_layer_type(layer_id, layers):
        for layer in layers:
            if (
                str(layer["id"]) == str(layer_id)
                and layer["data"][0]["type"] == "image"
            ):
                return "image"
        return "tile"

    @cg.callback(
        Output("example-map", "layers"),
        [Input("log-toggle-btn", "n_clicks"),],
        State("selected-layer", "value"),
    )
    def toggle_log(n_clicks, layer_id):
        layer_type = get_layer_type(layer_id, layers)

        log_value = "linear" if n_clicks % 2 == 0 else "log"
        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {"type": layer_type, "colorScale": {"scaleType": log_value,},}
                ],
            }
        ]
        return update_layer

    @cg.callback(
        Output("example-map", "layers"),
        [Input("layer-colorscale", "colorscale"),],
        State("selected-layer", "value"),
    )
    def update_colorcsale(colorScale, layer_id):
        layer_type = get_layer_type(layer_id, layers)
        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [{"type": layer_type, "colorScale": {"colors": colorScale,}}],
            }
        ]
        return update_layer

    @cg.callback(
        Output("example-map", "layers"),
        [Input("min-max-slider", "value")],
        State("selected-layer", "value"),
    )
    def update_global_min_max(min_max_value, layer_id):
        layer_type = get_layer_type(layer_id, layers)

        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {
                        "type": layer_type,
                        "minvalue": min_max_value[0],
                        "maxvalue": min_max_value[1],
                    }
                ],
            }
        ]

        return update_layer

    # Updates the text for min/max slider
    @cg.callback(
        Output("min-max-output-container", "children"),
        [Input("min-max-slider", "value")],
    )
    def update_min_max_text(value):
        return 'Global Min / Max"{}"'.format(value)

    @cg.callback(Output("cut-slider", "min"), [Input("min-max-slider", "value")])
    def update_min_cutoffpoints_in_dash(value):
        return int(value[0])

    @cg.callback(Output("cut-slider", "max"), [Input("min-max-slider", "value")])
    def update_max_cutoffpoints_in_dash(value):
        return int(value[1])

    @cg.callback(Output("cut-slider", "marks"), [Input("min-max-slider", "value")])
    def update_cutoff_marks(value):
        return {
            round(value[0]): str(round(value[0])),
            round(value[1]): str(round(value[1])),
        }

    @cg.callback(
        Output("example-map", "layers"),
        [Input("cut-slider", "value")],
        State("selected-layer", "value"),
    )
    def update_cut_points(value, layer_id):
        layer_type = get_layer_type(layer_id, layers)

        state["cut_point_min"] = value[0]
        state["cut_point_max"] = value[1]
        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {
                        "type": layer_type,
                        "colorScale": {
                            "colors": DEFAULT_COLORSCALE_COLORS,
                            "prefixZeroAlpha": False,
                            "scaleType": "linear",
                            "cutPointMin": value[0],
                            "cutPointMax": value[1],
                        },
                    }
                ],
            }
        ]

        return update_layer

    # Updates the text for cut-off slider
    @cg.callback(
        Output("cut-output-container", "children"), [Input("cut-slider", "value")]
    )
    def update_cut_points_text(value):
        return 'Cutoff Min / Max"{}"'.format(value)

    cg.register(app)

    app.run_server(debug=True)
