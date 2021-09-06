# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import json

import dash
import dash_html_components as html

import webviz_subsurface_components

with open("./react/src/demo/example-data/L898MUD.json", encoding="utf8") as json_file:
    logs = json.load(json_file)

with open(
    "./react/src/demo/example-data/welllog_template_1.json", encoding="utf8"
) as json_file:
    template = json.load(json_file)

app = dash.Dash(__name__)

app.layout = html.Div(
    style={"height": "800px"},
    children=[
        webviz_subsurface_components.WellLogViewer(
            id="well_completions", welllog=logs, template=template
        ),
    ],
)

if __name__ == "__main__":
    app.run_server(debug=True)
