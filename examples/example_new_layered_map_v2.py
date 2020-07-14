import dash
import dash_colorscales
from dash.dependencies import Input, Output
import dash_html_components as html
import webviz_subsurface_components




if __name__ == "__main__":

    layers = [
        {
            "id": 1,
            "name": "Test Image",
            "baseLayer": True,
            "checked": True,
            "data": [
                {
                    "type": "image",
                    "url": "TEST_IMAGE_HERE",
                    "bounds": [[0, 0], [-30, -30]],
                    
                }
            ]
        }
    ]

    app = dash.Dash(__name__)

    new_layered_map = webviz_subsurface_components.NewLayeredMap(
        id='test-map',
        layers=layers,
    )

    app.layout = html.Div(
        children=[
            new_layered_map,
            html.Button('Toggle shader', id='layer-add-btn'),
        ]
    )

    @app.callback(
        Output('test-map', 'layers'),
        [Input('layer-add-btn', 'n_clicks')]
    )
    def toggle_shader(n_clicks):
        print(n_clicks)
        if n_clicks is not None:
            return [
                {
                    "id": 1,            # Required,
                    "action": "update", # Required
                    "data": [
                        {
                            "type": "image",  # Required
                            "shader": {
                                "type": 'hillshading' if n_clicks%2 == 1 else None, 
                                "shadows": True,
                                "elevationScale": 4.0,
                                "pixelScale": 200
                            },
                            "colorScale": ['#032333', '#2a3393', '#754792', '#b15d81', '#ea7859', '#fbb33c', '#e7fa5a'],
                        }
                    ]
                }
            ]
        return []

    app.run_server(debug=True)