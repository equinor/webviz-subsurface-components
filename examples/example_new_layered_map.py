import io
import json
import base64
import numpy as np
from matplotlib import cm

import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import webviz_subsurface_components

from example_layered_map import array_to_png

if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt("./example-data/layered-map-data.npz.gz")

    min_value = int(np.nanmin(map_data))
    max_value = int(np.nanmax(map_data))

    map_data = array_to_png(map_data)
    colormap = array_to_png(
        cm.get_cmap("viridis", 256)([np.linspace(0, 1, 256)]), colormap=True
    )

    layers = [
        {
            "name": "A seismic horizon with colormap",
            "base_layer": True,
            "checked": True,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "allowHillshading": True,
                    "colormap": colormap,
                    "unit": "m",
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                },
            ],
        },
        {
            "name": "The same map without colormap",
            "base_layer": True,
            "checked": False,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                }
            ],
        },
        {
            "name": "Some overlay layer",
            "base_layer": False,
            "checked": False,
            "data": [
                {
                    "type": "polygon",
                    "positions": [
                        [436204, 6475077],
                        [438204, 6480077],
                        [432204, 6475077],
                    ],
                    "color": "blue",
                    "tooltip": "This is a blue polygon",
                },
                {
                    "type": "circle",
                    "center": [435200, 6478000],
                    "color": "red",
                    "radius": 2,
                    "tooltip": "This is a red circle",
                },
            ],
        },
    ]


    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            webviz_subsurface_components.NewLayeredMap(id="volve-map", layers=layers, bounds=[[432205, 6475078], [437720, 6481113]], minZoom=-5, crs='simple', controls={"scaleY": {}}),
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
        ]
    )

  

    app.run_server(debug=True)
