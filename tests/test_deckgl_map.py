# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json
import time
import pytest

import dash
import webviz_subsurface_components


# Basic test for the component rendering.
@pytest.mark.parametrize("dev_tools_serve_dev_bundles", [False, True])
def test_render_deckgl_map(
    dev_tools_serve_dev_bundles, dash_duo: dash.testing.composite.DashComposite
) -> None:

    with open(
        "react/src/demo/example-data/deckgl-map.json", encoding="utf8"
    ) as json_file:
        deckgl_data = json.load(json_file)[0]

    app = dash.Dash(__name__)
    app.layout = webviz_subsurface_components.DeckGLMap(**deckgl_data)

    dash_duo.start_server(app, dev_tools_serve_dev_bundles=dev_tools_serve_dev_bundles)
    time.sleep(5)
    assert dash_duo.get_logs() == []  # Console should have no errors
