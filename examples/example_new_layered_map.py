import io
import json
import base64
import numpy as np
from matplotlib import cm
from typing import List

import dash
import dash_colorscales
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
    map_data = np.loadtxt("examples/example-data/layered-map-data.npz.gz")

    min_value = int(np.nanmin(map_data))
    max_value = int(np.nanmax(map_data))

    map_data = array_to_png(map_data)
    colormap = array_to_png(
        cm.get_cmap("magma", 256)([np.linspace(0, 1, 256)]), colormap=True
    )

    state = {
        'add_n_clicks': 0,
        'delete_n_clicks': 0,
        'switch': { "value": False },
        'colorscale': None,
    }
    
    layers = [
                {
            "name": "Some overlay layer",
            "base_layer": False,
            "id": 0,
            "action": None,
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
        {
            "name": "Map",
            "id": 3,
            "baseLayer": True,
            "checked": True,
            "action": None,
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
    ]

    layered_map_component = webviz_subsurface_components.NewLayeredMap(
        id="example-map", 
        layers=layers,
        switch={
            "value": False,
            "label": "Hillshading",
        },
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",   
        }
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            html.Div(id='hidden-div'),
            html.Div(id='hidden-div2'),
            html.Button('Toggle shader', id='map-shader-toggle-btn'),
            
            # dcc.Dropdown('Select colorscale', id='layer-colorscale'), # Use this one -> https://github.com/plotly/dash-colorscales
            html.Button('Delete layer', id='layer-delete-btn'),
            html.Button('Add layer', id='layer-add-btn'),
            html.Div(children=[
                html.Div([
                    dash_colorscales.DashColorscales(
                        id='layer-colorscale',
                        nSwatches=7,
                        fixSwatches=True
                    ),
                    html.P(id='output', children=''),
                ]),
                layered_map_component,
            ], style={'display': 'grid', 'gridTemplateColumns': '400px auto'}),
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
        ]
    )
 

    @app.callback(
        Output('example-map', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
            Input('layer-delete-btn', 'n_clicks'),
            Input('layer-colorscale', 'colorscale'),
            Input('example-map', 'switch'),
        ]
    )

    def change_layer(add_n_clicks, delete_n_clicks, colorscale, switch):
        global layers
        # print("n_clicks ",  add_n_clicks, delete_n_clicks, update_n_clicks)
        
        newLayers = []
        newLayers.extend(layers)
        if (add_n_clicks is not None and add_n_clicks > state['add_n_clicks']):            
            newLayers = add_layer(newLayers)
     
        elif (delete_n_clicks is not None and delete_n_clicks > state['delete_n_clicks']):
            newLayers = delete_layer(newLayers)
        elif (colorscale is not None and colorscale != state['colorscale']):
            newLayers = update_layer(newLayers, colorscale)
        elif (switch is not None and state['switch']['value'] is not switch['value']):
            newLayers = toggle_shader(newLayers, switch)
        
        state['add_n_clicks'] = add_n_clicks or 0
        state['delete_n_clicks'] = delete_n_clicks or 0
        state['colorscale'] = colorscale
        state['switch'] = switch

        
        layers = newLayers


        return newLayers

    def delete_layer(layers):
        layers[1]['action'] = 'delete'
        return layers
        
    def add_layer(layers):
        if len(layers) < 5:
            layers.append({
                "name": "Something",
                "id": 2,
                "baseLayer": True,
                "checked": False,
                "action": "add",
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
            })
        return layers

    def update_layer(layers: List, colorScale: List[str]) -> List:
        update = [
            {
                "id": 3,
                "action": "update",
                "data": [
                    {   
                        "type": 'tile',
                        "colorScale": colorScale, 
                    }
                ]
            },
            {
                "id": 2,
                "action": "update",
                "data": [
                    {
                        "type": "image",
                        "colorScale": {
                            "colors": colorScale,
                            "prefixZeroAlpha": True,
                        }
                    }
                ]
            }
        ]
        return update


    def toggle_shader(new_layers: List, switch) -> List:
        layer_to_change = [x for x in new_layers if x['id'] == 3][0]
        cur_data = layer_to_change["data"][0]

        update = [
            {
                "id": 3,
                "action": "update",
                "data": [
                    {
                        "type": "tile",
                        "shader": {
                            "type": 'hillshading' if switch['value'] is True else None,
                        }
                    }
                ]
            },
            {
                "id": 2,
                "action": "update",
                "data": [
                    {
                        "type": "image",
                        "shader": {
                            "type": 'hillshading' if switch['value'] is True else None,
                        }
                    }
                ]
            }
        ]

        return update
    
    print("App: ", app)

    app.run_server(debug=True)