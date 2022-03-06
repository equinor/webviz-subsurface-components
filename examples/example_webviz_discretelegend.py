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
    Discrete_Data = {
        Above_BCU: [[255, 13, 186, 255], 0],
        ABOVE: [[255, 64, 53, 255], 1],
        H12: [[247, 255, 164, 255], 2],
        BELOW: [[73, 255, 35, 255], 14],
        H3: [[255, 144, 1, 255], 11],
    }

    legend_obj = wsc.WebVizDiscreteLegend(
<<<<<<< HEAD
        discreteData=Discrete_Data,
        title="Wells / ZONELOG",
        position=[16, 10],
        colorName="Stratigraphy",
        horizontal=True,
        colorTables=Color_Tables,
=======
        "discreteData"=Discrete_Data,
        "title"="Wells / ZONELOG",
        "position"=[16, 10],
        "colorName"="Stratigraphy",
        "horizontal"=True,
        "colorTables"=Color_Tables,
>>>>>>> 840512e11f96cf78c1ef4f9df73d61c1d4b7b47f
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
