import dash
from dash.dependencies import Input, Output
import webviz_subsurface_components
import json
import dash_html_components as html

# Basic test for the component rendering.
def test_render(dash_duo):

    with open('tests/data/morris_data.json', 'r') as f:
        data = json.loads(f.read())

    app = dash.Dash(__name__)
    app.layout = html.Div([
    webviz_subsurface_components.Morris(
        id='morris_chart',
        output=data['output'],
        parameters=data['parameters'],
        parameter=data['parameter'])
    ])

    dash_duo.start_server(app)

    #  Get y-axis text with selenium
    my_component = dash_duo.wait_for_element_by_css_selector(
        '#sensitivity-slider-plot__graph-container > svg > g > text')

    assert 'FOPT' == my_component.text
