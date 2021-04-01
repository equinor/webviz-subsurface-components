# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json
import dash
import dash_html_components as html

import webviz_subsurface_components


# Basic test for the component rendering.
def test_render_hm(dash_duo):

    with open("tests/data/hm_data.json", "r") as json_file:
        hm_data = json.load(json_file)

    app = dash.Dash(__name__)

    app.layout = html.Div(
        [
            webviz_subsurface_components.HistoryMatch(id="parameters", data=hm_data),
        ]
    )

    dash_duo.start_server(app)

    # Get text of first data series
    my_component = dash_duo.wait_for_element_by_css_selector(
        "#g_history_matching_plot > text", timeout=4
    )

    assert my_component.text == "Misfit overview for Iteration 0"
