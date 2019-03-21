import dash
from dash.dependencies import Input, Output
import webviz_subsurface_components
import dash_html_components as html
from pytest_dash.wait_for import (
    wait_for_text_to_equal,
    wait_for_element_by_css_selector
)
from pytest_dash.application_runners import import_app

# Basic test for the component rendering.
def test_render_hm(dash_threaded):
    # dash_threaded is a fixture by pytest-dash

    with open('tests/data/hm_data.json', 'r') as f:
        hm_data = f.read()

    app = dash.Dash(__name__)

    app.layout = html.Div([
    webviz_subsurface_components.HistoryMatch(
        id='parameters',
        data=hm_data),
    ])

    driver = dash_threaded.driver
    dash_threaded(app)

    # Get text of first data series
    my_component = wait_for_element_by_css_selector(driver, '#g_history_matching_plot > text')

    assert 'Misfit overview for Iteration 0' == my_component.text
