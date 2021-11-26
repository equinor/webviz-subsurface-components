# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json

import dash
import webviz_subsurface_components


# Basic test for the component rendering.
def test_render_deckgl_map(dash_duo: dash.testing.composite.DashComposite) -> None:

    with open(
        "react/src/demo/example-data/deckgl-map.json", encoding="utf8"
    ) as json_file:
        deckgl_data = json.load(json_file)[0]

    app = dash.Dash(__name__)
    app.layout = webviz_subsurface_components.DeckGLMap(**deckgl_data)

    dash_duo.start_server(app)
    assert dash_duo.get_logs() == []  # Console should have no errors
