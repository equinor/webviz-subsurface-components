import json
import dash
from dash.dependencies import Input, Output
import webviz_subsurface_components
import dash_html_components as html

# Basic test for the component rendering.
def test_render_hm(dash_duo):

    with open("tests/data/hm_data.json", "r") as json_file:
        hm_data = json.load(json_file)

    app = dash.Dash(__name__)

    app.layout = html.Div(
        [webviz_subsurface_components.HistoryMatch(id="parameters", data=hm_data),]
    )

    dash_duo.start_server(app)

    # Get text of first data series
    my_component = dash_duo.wait_for_element_by_css_selector(
        "#g_history_matching_plot > text", timeout=4
    )

    assert my_component.text == "Misfit overview for Iteration 0"
