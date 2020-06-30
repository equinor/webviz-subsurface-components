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
            "data": [
                {
                    "type": "tile",
                    "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    "colormap": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAAuElEQVR4nI2NyxUDIQwDR6K0lJD+W1nnABgvIZ8DT7JGNnroieRAQjJYMFQ2SDBUk0mrl16odGce05de9Z2zzStLLhEuvurIZzeZOedizd7mT70f7JOe7v7XA/jBBaH4ztn3462z37l1c7/ys1f6QFNZuUZ+1+JZ3oVN79FxctLvLB/XIQuslbe3+eSv7LVyd/KmC9O13Vjf63zt7r3kW7dR/iVuvv/H8NBE1/SiIayhiCZjhDFN5gX8UYgJzVykqAAAAABJRU5ErkJggg==",
                    "shader": {
                        "type": "none",
                        "elevationScale": 0.01
                    }
                }
            ]
        },
        {
            "name": "Something",
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "allowHillshading": True,
                    "colormap": colormap,
                    "unit": "m",
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [-30, -30]],
                },
            ],
        }
    ]

    layered_map_component = webviz_subsurface_components.NewLayeredMap(
        id="example-map", 
        layers=layers, 
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            html.Div(id='hidden-div'),
            html.Button('Toggle shader', id='map-shader-toggle-btn'),
            layered_map_component,
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
        ]
    )

  

    @app.callback(
        Output('hidden-div', 'children'),
        [
            Input(component_id='map-shader-toggle-btn', component_property='n_clicks')
        ]
    )
    def toggle_between_shaders(n_clicks):
        print("n_clicks:", n_clicks)
        print("Current shader:", layers[0]['data'][0]['shader']['type'])
        layers[0]['data'][0]['shader']['type'] = None if layers[0]['data'][0]['shader']['type'] is 'hillshading' else 'hillshading'
        return layers[0]['data'][0]['shader']['type']
        

    app.run_server(debug=True)
