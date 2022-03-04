# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import io
from dash import Dash, html, Input, Output, State, callback
import webviz_core_components as wcc
import webviz_subsurface_components as wsc

if __name__ == "__main__":
    Color_Tables = "https://raw.githubusercontent.com/emerson-eps/color-tables/main/react-app/src/component/color-tables.json"

    legend_obj = wsc.WebVizContinuousLegend(
        "min"=0,
        "max"=0.35,
        "title"="Wells / PORO",
        "position"=[16, 10],
        "colorName"="Rainbow",
        "horizontal"=True,
        "colorTables"=Color_Tables,
    )

    app = Dash(__name__)

    # app.layout = wcc.FlexBox(
    #     children=[
    #         wcc.Frame(
    #             style={
    #                 "flex": 1,
    #             },
    #             children=[
    #                 colormap_dropdown,
    #                 html.Img(
    #                     id="colormap-img",
    #                 ),
    #             ],
    #         ),
    #         wcc.Frame(
    #             style={"flex": 10, "height": "90vh"},
    #             children=[legend_obj],
    #         ),
    #     ]
    # )
    app.layout = html.Div(
        style={"height": "80vh"},
        children=legend_obj,
    )

    app.run_server(debug=True)
