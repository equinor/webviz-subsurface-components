# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json
from pathlib import Path

import dash
import dash_html_components as html

import webviz_subsurface_components


# Basic test for the component rendering.
def test_render(dash_duo):

    data = json.loads(Path("tests/data/morris_data.json").read_text(encoding="utf8"))

    app = dash.Dash(__name__)
    app.layout = html.Div(
        [
            webviz_subsurface_components.Morris(
                id="morris_chart",
                output=data["output"],
                parameters=data["parameters"],
                parameter=data["parameter"],
            )
        ]
    )

    dash_duo.start_server(app)

    #  Get y-axis text with selenium
    my_component = dash_duo.wait_for_element_by_css_selector(
        "#sensitivity-slider-plot__graph-container > svg > g > text"
    )

    assert my_component.text == "FOPT"
