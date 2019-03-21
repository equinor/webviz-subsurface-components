import dash
from dash.dependencies import Input, Output
import webviz_subsurface_components
import json
import dash_html_components as html
from pytest_dash.wait_for import (
    wait_for_text_to_equal,
    wait_for_element_by_css_selector
)
from pytest_dash.application_runners import import_app

# Basic test for the component rendering.
def test_render(dash_threaded):
    # dash_threaded is a fixture by pytest-dash

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

    driver = dash_threaded.driver
    dash_threaded(app)

    #  Get y-axis text with selenium
    my_component = wait_for_element_by_css_selector(
        driver, 
        '#sensitivity-slider-plot__graph-container > svg > g > text')

    assert 'FOPT' == my_component.text
