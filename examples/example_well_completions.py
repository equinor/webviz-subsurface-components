# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json

import dash
import dash_html_components as html

import webviz_subsurface_components

with open(
    "./react/src/demo/example-data/well-completions.json", encoding="utf8"
) as json_file:
    data = json.load(json_file)

app = dash.Dash(__name__)

app.layout = html.Div(
    style={"height": "600px"},
    children=[
        webviz_subsurface_components.WellCompletions(id="well_completions", data=data),
    ],
)

if __name__ == "__main__":
    app.run_server(debug=True)
