import io
import json
import base64
import numpy as np
from matplotlib import cm
from typing import List

import dash
import dash_colorscales
import dash_core_components as dcc
from dash_extensions.callback import CallbackGrouper
from dash.dependencies import Input, Output
import dash_html_components as html
import webviz_subsurface_components

from example_layered_map import array_to_png
from tile_server import tile_server

DEFAULT_COLORSCALE_COLORS = ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"]

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
        'switch': { "value": False },
        'colorscale': DEFAULT_COLORSCALE_COLORS,
        'scale_type': "linear",
        'cut_point_min': min_value,
        'cut_point_max': max_value,
    }
    
    layers = [
        {
            "name": "A seismic horizon with colormap",
            "id": 1, 
            "baseLayer": True,
            "checked": True,
            "action": "update",
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "colorScale":  {
                        "colors": DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value,
                        },
                    "allowHillshading": True,
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [-30, -30]]
                },
            ],
        }
    
    ]

    layered_map_component = webviz_subsurface_components.NewLayeredMap(
        id="example-map",
        syncedMaps=["example-map2"],
        # syncDrawings=True, 
        layers=layers,
        colorBar={
            "position": 'bottomleft'
        },
        mouseCoords={
            "coordinatePosition": "bottomright",
        },
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
    cg = CallbackGrouper()

    # initialize server for providing tiles at the same localhost as dash is running
    # server = tile_server(app.server)


    app.layout = html.Div(
        children=[
            html.Button('Add layer', id='layer-add-btn'),
            html.Button('Toggle log', id='log-toggle-btn'),
            html.Div(["Delete layer by id: ", dcc.Input(id='delete-layer-id', type='number')]),
            html.Div(children = [          
                html.Div(children = [
                    html.H4(id='min-max-output-container'),
                    dcc.RangeSlider(
                    id='min-max-slider',
                    min=min_value - 1000,
                    max=max_value + 1000,
                    step=0.5,
                    value=[min_value, max_value],
                    vertical=True,
                    verticalHeight= 300,
                    ),
                ]),
                html.Div(children = [
                    html.H4(id='cut-output-container'),
                    dcc.RangeSlider(
                    id='cut-slider',
                    min=min_value,
                    max=max_value,
                    step=0.5,
                    value=[min_value, max_value],
                    vertical=True,
                    verticalHeight= 300,
                    ),
                ]),

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
                # layered_map_component2,
            ],  style={'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'minHeight': '90vh' })
            ]),


        ]
    )

    @cg.callback(
        Output('example-map', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
        ]
    )

    def add_layer(add_n_clicks):
        global layers
        layers.append(
        {
            "name": "a very cool layer",
            "id": 2, 
            "baseLayer": True,
            "checked": False,
            "action": "add",
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "colorScale":  {
                        "colors":DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value 
                        },
                    "allowHillshading": True,
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [-30, -30]]
                },
            ],
        })

        state['add_n_clicks'] = add_n_clicks or 0

        return layers


    @cg.callback(
        Output('example-map', 'layers'),
        [
            Input('layer-colorscale', 'colorscale'),

        ]
    )

    def update_colorcsale(colorScale):
        global layers 
        layers.append( 
        {
            "id": 1,
            "action": "update",
            "data": [
                {
                    "type": "image",
                    "colorScale": {
                        "colors": colorScale,
                        "scaleType": state['scale_type'],
                        "prefixZeroAlpha": True,
                    }
                }
            ]
        })
        state['colorscale'] = colorScale
        return layers


    @cg.callback(
        Output('example-map', 'layers'),
        [
            Input('delete-layer-id', 'value'),
        ]
    )

    def delete_layer(layer_id):
        global layers
        layers.append(
            {
                "id": layer_id,
                "action": "delete",
            }
        )
        return layers


    @cg.callback(
        dash.dependencies.Output('example-map', 'layers'),
        [dash.dependencies.Input('min-max-slider', 'value')])

    def update_global_min_max(value):
        global layers
        layers.append(
            {
                "id": 1,
                "action": "update",
                "data": [
                    {   
                        "type": 'image',
                        "minvalue": value[0],
                        "maxvalue": value[1],
                    }
                ]
            }
        )
        return layers

    #updates the text for min/max values
    @cg.callback(
        dash.dependencies.Output('min-max-output-container', 'children'),
        [dash.dependencies.Input('min-max-slider', 'value')])

    def update_min_max_text(value): 
        return 'Min/max"{}"'.format(value)



    @cg.callback(
        dash.dependencies.Output('example-map', 'layers'),
        [dash.dependencies.Input('cut-slider', 'value')])

    def update_global_min_max(value):
        global layers
        state['cut_point_min'] = value[0]
        state['cut_point_max'] = value[1]
        layers.append(
            {
                "id": 1,
                "action": "update",
                "data": [
                    {   
                        "type": 'image',
                        "colorScale":  {
                            "colors": state['colorscale'],
                            "cutPointMin": value[0],
                            "cutPointMax": value[1],
                            "scaleType": state['scale_type']
                        },
                    }
                ]
            }
        )
        return layers

    #updates the text for min/max values
    @cg.callback(
        dash.dependencies.Output('cut-output-container', 'children'),
        [dash.dependencies.Input('cut-slider', 'value')])

    def update_cut_points_text(value): 
        return 'Cut Min/max"{}"'.format(value)

    @cg.callback(
        Output('example-map', 'layers'),
        [
            Input('log-toggle-btn', 'n_clicks'),
        ]
    )

    def toggle_log(n_clicks):
        global layers
        log_value = "linear"
        if n_clicks % 2 != 0:
            log_value = "log"
        else:
            log_value = "linear"

        layers.append(
            {
                "id": 1,
                "action": "update",
                "data": [
                    {   
                        "type": 'image',
                        "colorScale":  {
                            "colors": state['colorscale'],
                            "scaleType": log_value,
                            "cutPointMin": state['cut_point_min'],
                            "cutPointMax": state['cut_point_max'],
                        },
                    }
                ]
            }
        )
        state['scale_type'] = log_value
        return layers



    cg.register(app)     

    app.run_server(debug=True)