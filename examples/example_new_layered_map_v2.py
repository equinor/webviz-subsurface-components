import json

import dash
import dash_colorscales
from dash.dependencies import Input, Output
import dash_html_components as html
from webviz_subsurface_components import NewLayeredMap


def load_test_data():
    data = None
    with open('./example-data/test-data.json') as f:
        data = json.load(f)
    return data

if __name__ == "__main__":

    TOGGLE_SHADER_CLICKS = 'toggleShaderClicks'
    COLORSCALE = 'colorscale'

    stateMap1 = {
       TOGGLE_SHADER_CLICKS: 0,
       COLORSCALE: ["#000000", "#ffffff"],
    }

    stateMap2 = {
       TOGGLE_SHADER_CLICKS: 0,
       COLORSCALE: ["#000000", "#ffffff"],
    }

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
        colorBar={}
        
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
        }
    )

    app.layout = html.Div(
        children=[
            html.Button('Toggle shader', id='layer-add-btn'),
            html.Div(
                children=[
                    html.Div(children=[
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

    @app.callback(
        Output('test-map', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
             Input('layer-colorscale', 'colorscale'),
        ]
    )
    def edit_first_map(n_clicks, colorscale):
        return edit_map(stateMap1, n_clicks, colorscale)

    @app.callback(
        Output('test-map-2', 'layers'),
        [
            Input('layer-add-btn', 'n_clicks'),
             Input('layer-colorscale', 'colorscale'),
        ]
    )
    def edit_second_map(n_clicks, colorscale):
        return edit_map(stateMap2, n_clicks, colorscale)

    def edit_map(state, n_clicks, colorscale):
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
                                "colors": colorscale
                            },
                        }
                    ],
                   
                }
            ]
            state[COLORSCALE] = colorscale


        return new_layers

    app.run_server(debug=True)