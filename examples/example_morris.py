# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import webviz_subsurface_components
import dash
import dash_html_components as html

app = dash.Dash(__name__)

output = [
    {"mean": 0.0, "max": 0.0, "min": 0.0, "time": "2000-01-01T00:00:00"},
    {
        "mean": 1821300.2,
        "max": 2022804.5,
        "min": 900429.1,
        "time": "2001-01-01T00:00:00",
    },
    {
        "mean": 3595926.9,
        "max": 5060090.5,
        "min": 1161664.8,
        "time": "2002-01-01T00:00:00",
    },
    {
        "mean": 4919365.7,
        "max": 7102369.0,
        "min": 2150000.5,
        "time": "2003-01-01T00:00:00",
    },
]
parameters = [
    {
        "main": [0.0, 1327720.5, 3439176.1, 5311292.8],
        "name": "FWL",
        "interactions": [0.0, 1116199.0, 2541439.9, 2836076.4],
    },
    {
        "main": [0.0, 844.65, 5093.1, 12363.55],
        "name": "MULTFLT_F1",
        "interactions": [0.0, 1231.4, 4597.0, 13793.5],
    },
    {
        "main": [0.0, 908911.5, 1506246.1, 2000438.5],
        "name": "RANGE_PAR",
        "interactions": [0.0, 1396000.4, 1900671.3, 1933889.5],
    },
    {
        "main": [0.0, 10.1, 7413.1, 322.3],
        "name": "MULTZ_MIDREEK",
        "interactions": [0.0, 211.1, 3098.9, 5619.7],
    },
    {
        "main": [0.0, 1010601.3, 1822840.3, 2869195.5],
        "name": "AZIMUTH",
        "interactions": [0.0, 1262311.8, 1822908.7, 2833047.4],
    },
    {
        "main": [0.0, 167888.5, 398770.5, 598481.5],
        "name": "MEANPERMMULT",
        "interactions": [0.0, 114457.6, 180225.4, 201267.2],
    },
]
parameter = "FOPT"

app.layout = html.Div(
    children=[
        webviz_subsurface_components.Morris(
            id="morris_chart", output=output, parameters=parameters, parameter=parameter
        ),
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
