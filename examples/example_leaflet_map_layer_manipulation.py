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
            "name": "A seismic horizon without colormap",
            "id": 44,
            "baseLayer": True,
            "checked": False,
            "action": None,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "allowHillshading": True,
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [30, 30]],
                    "shader": {"setBlackToAlpha": True},
                },
            ],
        },
        {
            "name": "Map",
            "id": 3,
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
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
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
                    html.Button("Add layer", id="layer-add-btn"),
                    dcc.Input(
                        id="delete-layer-id",
                        type="number",
                        size="2",
                        placeholder="Delete layer by id",
                    ),
                    html.Button("Submit", id="delete-submit", n_clicks=0),
                ]
            ),
            html.Div(
                children=[leaflet_map_1,],
                style={
                    "display": "grid",
                    "gridTemplateColumns": "1fr 1fr",
                    "minHeight": "90vh",
                },
            ),
        ]
    )

    @cg.callback(Output("example-map", "layers"), [Input("layer-add-btn", "n_clicks"),])
    def add_layer(add_n_clicks):
        global layers
        layers.append(
            {
                "name": "a very cool layer",
                "id": 55,
                "baseLayer": True,
                "checked": False,
                "action": "add",
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
                        "allowHillshading": True,
                        "minvalue": min_value,
                        "maxvalue": max_value,
                        "bounds": [[0, 0], [-30, -30]],
                    },
                ],
            }
        )
        return layers

    @cg.callback(
        Output("example-map", "layers"),
        [Input("delete-submit", "n_clicks")],
        State("delete-layer-id", "value"),
    )
    def delete_layer(n_clicks, layer_id):
        update_layer = [{"id": int(layer_id), "action": "delete",}]
        return update_layer

    cg.register(app)

    app.run_server(debug=True)
