import json

import dash
import dash_colorscales
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_core_components as dcc
from webviz_subsurface_components import NewLayeredMap

# Constants
TOGGLE_SHADER_CLICKS = 'toggleShaderClicks'
COLORSCALE = 'colorscale'
GLOBAL_SLIDER_VALUE = 'globalSliderValue'
CUTOFF_SLIDER_VALUE = 'cutOffSliderValue'

def load_test_data():
    data = None
    with open('./example-data/test-data.json') as f:
        data = json.load(f)
    return data

def create_map_state():
    return {
       TOGGLE_SHADER_CLICKS: 0,
       COLORSCALE: ["#000000", "#ffffff"],
       GLOBAL_SLIDER_VALUE: [1000, 3000],
       CUTOFF_SLIDER_VALUE: [1000, 3000],
    }

if __name__ == "__main__":

    stateMap1 = create_map_state()
    stateMap2 = create_map_state()

    layers = load_test_data()

    app = dash.Dash(__name__)

    new_layered_map = NewLayeredMap(
        id='test-map',
        syncedMaps=['test-map-2'],
        layers=layers,
        bounds=[[0, 0], [-30, -30]],
        minZoom=-5,
        mouseCoords={
            "position": "bottomleft"
        },
        colorBar={
            "position": "bottomright"
        },
        scaleY={

        },
        drawTools={
            
        }
        
    )

    new_layered_map_2 = NewLayeredMap(
        id='test-map-2',
        syncedMaps=['test-map'],
        layers=layers,
        bounds=[[0, 0], [-30, -30]],
        crs='simple',
        minZoom=-5,
        mouseCoords={
            "position": "bottomright"
        },
        colorBar={
            "position": "bottomright"
        },
        scaleY={

        },
        drawTools={
            
        }
    )

    app.layout = html.Div(
        children=[
            html.Button('Toggle shader', id='layer-add-btn'),
            html.Div(
                children=[
                    html.Div(children=[
                        html.Div(children=[
                            html.H4('Global MinMax Slider', id='global-min-max'),
                            dcc.RangeSlider(
                                id='global-min-max-slider',
                                min=0,
                                max=3000,
                                step=100,
                                value=[1000, 3000]
                            ),
                        ]),
                        html.Div(children=[
                            html.H4('CutOff MinMax Slider', id='cutoff-min-max'),
                            dcc.RangeSlider(
                                id='cutoff-min-max-slider',
                                min=0,
                                max=3000,
                                step=100,
                                value=[1000, 3000]
                            ),
                        ]),
                        dash_colorscales.DashColorscales(
                            id='layer-colorscale',
                            nSwatches=7,
                            fixSwatches=True
                        ),
                        html.P(id='output', children='')
                    ]),
                    html.Div(
                        children=[
                            new_layered_map,
                            new_layered_map_2,
                        ]
                    , style={'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'minHeight': '90vh' })
                ], style={'display': 'grid', 'gridTemplateColumns': '400px auto'}
            )
        ]
    )

    #
    #    MAP FUNCTIONS
    #

    @app.callback(
        Output('test-map', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
            Input('layer-colorscale', 'colorscale'),
            Input('global-min-max-slider', 'value'),
            Input('cutoff-min-max-slider', 'value'),
        ]
    )
    def edit_first_map(n_clicks, colorscale, global_min_max, cutoff_min_max):
        return edit_map(stateMap1, n_clicks, colorscale, global_min_max, cutoff_min_max)

    @app.callback(
        Output('test-map-2', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
            Input('layer-colorscale', 'colorscale'),
            Input('global-min-max-slider', 'value'),
            Input('cutoff-min-max-slider', 'value'),
        ]
    )
    def edit_second_map(n_clicks, colorscale, global_min_max, cutoff_min_max):
        return edit_map(stateMap2, n_clicks, colorscale, global_min_max, cutoff_min_max)

    def edit_map(state, n_clicks, colorscale, global_min_max, cutoff_min_max):
        new_layers = []

        if n_clicks is not None and state[TOGGLE_SHADER_CLICKS] < n_clicks:
            new_layers = [
                {
                    "id": 1,            # Required,
                    "action": "update", # Required
                    "data": [
                        {
                            "type": "image",  # Required
                            "shader": {
                                "type": 'hillshading' if n_clicks%2 == 1 else None, 
                                "shadows": True,
                                "elevationScale": 1.0,
                                "pixelScale": 11000
                            },
                            "colorScale": {
                                "colors": colorscale if colorscale else state[COLORSCALE]
                            }
                        }
                    ]
                }
            ]
            state[TOGGLE_SHADER_CLICKS] = n_clicks
        elif colorscale is not None and state[COLORSCALE] != colorscale:
            new_layers = [
                {
                    "id": 1,
                    "action": "update",
                    "data": [
                        {
                            "type": "image",
                            "colorScale": {
                                "colors": colorscale,
                                "prefixZeroAlpha": True,
                            }
                        }
                    ],
                   
                }
            ]
            state[COLORSCALE] = colorscale
        elif global_min_max is not None and state[GLOBAL_SLIDER_VALUE] != global_min_max:
            new_layers = [
                {
                    "id": 1,
                    "action": "update",
                    "data": [
                        {
                            "type": "image",
                            "minvalue": global_min_max[0],
                            "maxvalue": global_min_max[1],
                        }
                    ]
                }
            ]
            state[GLOBAL_SLIDER_VALUE] = global_min_max
        elif cutoff_min_max is not None and state[CUTOFF_SLIDER_VALUE] != cutoff_min_max:
            new_layers = [
                {
                    "id": 1,
                    "action": "update",
                    "data": [
                        {
                            "type": "image",
                            "colorScale": {
                                "colors": colorscale,
                                "prefixZeroAlpha": True,
                                "cutOffMin": cutoff_min_max[0],
                                "cutOffMax": cutoff_min_max[1],
                            }
                        }
                    ]
                }
            ]
            state[CUTOFF_SLIDER_VALUE] = cutoff_min_max
            
        return new_layers

    #
    #   SLIDER FUNCTIONS
    #

    @app.callback(
        Output('global-min-max', 'children'),
        [
            Input('global-min-max-slider', 'value')
        ]
    )
    def display_global_minmax(value):
        return f'Global MinMax Slider: {value[0]}-{value[1]}'

    @app.callback(
        Output('cutoff-min-max', 'children'),
        [
            Input('cutoff-min-max-slider', 'value')
        ]
    )
    def display_cutoff_minmax(value):
        return f'CutOff MinMax Slider: {value[0]}-{value[1]}'

    #
    #   DRAW TOOLS
    #
    @app.callback(
        Output('output', 'children'),
        [
            Input('test-map', 'click_position'),
            Input('test-map', 'polyline_points'),
            Input('test-map', 'polygon_points'),
        ]
    )
    def clicked_position(click_position, polyline_points, polygon_points):
        print("CLICKED:", click_position)
        print("POLYLINE:", polyline_points)
        print("POLYGON:", polygon_points)
        return None

    app.run_server(debug=True)