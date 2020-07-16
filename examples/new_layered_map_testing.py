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
# TODO: Remove tile_server before pushing
from tile_server import tile_server

if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt('examples/example-data/layered-map-data.npz.gz')

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
            "name": "A seismic horizon with colormap",
            "id": 3, 
            "baseLayer": True,
            "checked": True,
            "action": "update",
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "shader": {
                        "type": "hillshading",
                        "shadows": True,
                        "noColor": False
                    },
                    "colorScale":  {
                        "colors":["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": 2782,
                        "cutPointMax": 3513
                    },
                    "unit": "m",
                    "minvalue": 2782,
                    "maxvalue": 3513,
                    "bounds": [[432205, 6475078], [437720, 6481113]]
                },
            ],
        },
    ]

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
            ], style={'display': 'grid', 'gridTemplateColumns': '400px auto'})
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

    # changes the arrays to the desired view
    def get_surface_arr(surface, unrotate=True, flip=True):
                if unrotate:
                    surface.unrotate()
                x, y, z = surface.get_xyz_values()
                if flip:
                    x = np.flip(x.transpose(), axis=0)
                    y = np.flip(y.transpose(), axis=0)
                    z = np.flip(z.transpose(), axis=0)
                z.filled(np.nan)
                return [x, y, z]
    
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
                "id": 2,
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
    

    # @app.callback(Output("polyline", "children"), [Input("example-map", "polyline_points")])
    # def get_edited_line(coords):
    #     return f"Edited polyline: {json.dumps(coords)}"

    # @app.callback(Output("marker", "children"), [Input("example-map", "marker_point")])
    # def get_edited_line(coords):
    #     return f"Edited marker: {json.dumps(coords)}"

    # @app.callback(Output("polygon", "children"), [Input("example-map", "polygon_points")])
    # def get_edited_line(coords):
    #     return f"Edited closed polygon: {json.dumps(coords)}"
       

    app.run_server(debug=True)