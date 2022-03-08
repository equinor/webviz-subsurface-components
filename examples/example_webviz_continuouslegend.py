# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import dash
import webviz_core_components as wcc
import webviz_subsurface_components as wsc

if __name__ == "__main__":
    COLOR_TABLES = (
        "https://raw.githubusercontent.com/emerson-eps/color-tables/"
        "main/react-app/src/component/color-tables.json"
    )

    legend_obj = wsc.WebVizContinuousLegend(
        min=0,
        max=0.35,
        title="ContinuousLegend",
        position=[16, 10],
        colorName="Rainbow",
        horizontal=True,
        colorTables=COLOR_TABLES,
    )

    app = dash.Dash(__name__)

    app.layout = wcc.FlexBox(
        children=[
            wcc.Frame(
                style={"flex": 10, "height": "90vh"},
                children=[legend_obj],
            ),
        ]
    )

    app.run_server(debug=True)
