# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json

import dash
import webviz_subsurface_components


# Basic test for the component rendering.
def test_render_leaflet_map(dash_duo: dash.testing.composite.DashComposite) -> None:

    with open(
        "react/src/demo/example-data/leaflet-map.json", encoding="utf8"
    ) as json_file:
        leaflet_data = json.load(json_file)["layers"][1:]

    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        style={"height": "90vh"},
        children=webviz_subsurface_components.LeafletMap(
            id="leaflet", minZoom=-5, crs="simple", layers=leaflet_data
        ),
    )
    dash_duo.start_server(app)
    assert dash_duo.get_logs() == []  # Console should have no errors
