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
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
        switch={"value": False, "label": "Hillshading",},
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",
        },
        scaleY={"scaleY": 1, "minScaleY": 1, "maxScaleY": 10, "position": "topleft",},
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
                            {"label": "Map", "value": "3"},
                        ],
                        value="1",
                    ),
                ]
            ),
            html.Div(
                [
                    html.Div(
                        [
                            "Layer update method",
                            dcc.RadioItems(
                                id="layer-change-method",
                                options=[
                                    {"label": "Update", "value": "update"},
                                    {"label": "Replace", "value": "replace"},
                                ],
                                value="update",
                            ),
                        ]
                    ),
                    html.Button(
                        "Toggle shader - replace", id="shader-toggle-replace-btn"
                    ),
                    html.Button("Toggle shadows", id="shading-submit-val", n_clicks=0),
                ]
            ),
            html.Div(
                [
                    html.Div(
                        [
                            html.H6(
                                "Elevation scale value", id="elevation-scale-container"
                            ),
                            dcc.Slider(
                                id="elevation-scale",
                                min=0.0,
                                max=10.0,
                                step=0.1,
                                value=1.0,
                                marks={0: {"label": "0"}, 10: {"label": "10"}},
                            ),
                        ]
                    ),
                    html.Div(
                        [
                            html.H6("Pixel scale value", id="pixel-scale-container"),
                            dcc.Slider(
                                id="pixel-scale",
                                min=2500,
                                max=25000,
                                step=10,
                                value=11000,
                                marks={
                                    2500: {"label": "2500"},
                                    25000: {"label": "25000"},
                                },
                            ),
                        ]
                    ),
                ]
            ),
            html.Div(
                children=[leaflet_map_1,],
                style={
                    "display": "grid",
                    "gridTemplateColumns": "1fr 1fr",
                    "minHeight": "90vh",
                    "padding-left": "30%",
                },
            ),
        ]
    )

    def get_layer_type(layer_id, layers):
        for layer in layers:
            if str(layer["id"]) == str(layer_id):
                if layer["data"][0]["type"] == "image":
                    return "image"
        return "tile"

    # Callbacks are made for each of the maps as specified in callbackMaps defined above

    @cg.callback(
        Output("example-map", "updateMode"), [Input("layer-change-method", "value")]
    )
    def change_layer_change_method(value):
        return value

    # Updates elevation and pixel scales based on their corresponding sliders
    @cg.callback(
        Output("example-map", "layers"),
        [Input("elevation-scale", "value"), Input("pixel-scale", "value")],
        [State("selected-layer", "value"), State("shading-submit-val", "n_clicks")],
    )
    def update_shadow_scales(elevation_scale, pixel_scale, layer_id, n_clicks):
        layer_type = get_layer_type(layer_id, layers)

        state["elevation_scale"] = elevation_scale if n_clicks % 2 else None
        state["pixel_scale"] = pixel_scale if n_clicks % 2 else None

        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {
                        "type": layer_type,
                        "shader": {
                            "type": "hillshading" if n_clicks % 2 else None,
                            "shadows": True if n_clicks % 2 else False,
                            "elevationScale": state["elevation_scale"],
                            "pixelScale": state["pixel_scale"],
                            "setBlackToAlpha": True,
                        },
                    }
                ],
            }
        ]
        return update_layer

    @cg.callback(
        Output("example-map", "layers"),
        [Input("shading-submit-val", "n_clicks"),],
        [
            State("elevation-scale", "value"),
            State("pixel-scale", "value"),
            State("selected-layer", "value"),
        ],
    )
    def update_hillshading_with_shadows(
        n_clicks, elevation_scale, pixel_scale, layer_id
    ):
        layer_type = get_layer_type(layer_id, layers)

        state["elevation_scale"] = elevation_scale
        state["pixel_scale"] = pixel_scale
        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {
                        "type": layer_type,
                        "shader": {
                            "type": "hillshading" if n_clicks % 2 else None,
                            "shadows": True if n_clicks % 2 else False,
                            "elevationScale": state["elevation_scale"],
                            "pixelScale": state["pixel_scale"],
                            "setBlackToAlpha": True,
                        },
                    }
                ],
            }
        ]
        return update_layer

    # updates the text for elevation scale
    @cg.callback(
        Output("elevation-scale-container", "children"),
        [Input("elevation-scale", "value")],
    )
    def update_elevation_text(value):
        return 'Elevation scale value: "{}"'.format(value)

    # updates the text for pixel scale
    @cg.callback(
        Output("pixel-scale-container", "children"), [Input("pixel-scale", "value")]
    )
    def update_pixel_text(value):
        return f'Pixel scale value: "{value}"'

    @cg.callback(
        Output("example-map", "layers"),
        [Input("example-map", "switch"),],
        State("selected-layer", "value"),
    )
    def toggle_shading(switch, layer_id):
        layer_type = get_layer_type(layer_id, layers)

        update_layer = [
            {
                "id": int(layer_id),
                "action": "update",
                "data": [
                    {
                        "type": layer_type,
                        "shader": {"type": "hillshading" if switch["value"] else None,},
                    }
                ],
            }
        ]
        return update_layer

    @cg.callback(
        Output("example-map", "layers"),
        [Input("shader-toggle-replace-btn", "n_clicks"),],
        State("selected-layer", "value"),
    )
    def toggle_shading_with_replace(n_clicks, layer_id):
        layer_type = get_layer_type(layer_id, layers)

        update_layer = [
            {
                "id": int(layer_id),
                "name": "A seismic horizon with colormap",
                "baseLayer": True,
                "checked": True,
                "data": [
                    {
                        "url": map_data,
                        "allowHillshading": True,
                        "minvalue": min_value,
                        "maxvalue": max_value,
                        "bounds": [[0, 0], [30, 30]],
                        "type": layer_type,
                        "allowHillshading": True,
                        "colorScale": {
                            "colors": DEFAULT_COLORSCALE_COLORS,
                            "prefixZeroAlpha": False,
                            "scaleType": "linear",
                            "cutPointMin": min_value,
                            "cutPointMax": max_value,
                        },
                        "shader": {
                            "type": "hillshading" if n_clicks % 2 == 1 else None,
                            # "shadows": False,
                            # "elevationScale": 1.0,
                            # "pixelScale": 11000
                        },
                    }
                ],
            }
        ]
        return update_layer

    cg.register(app)

    app.run_server(debug=True)
