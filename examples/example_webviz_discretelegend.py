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

    Discrete_Data = {
        "Above_BCU": [[255, 13, 186, 255], 0],
        "ABOVE": [[255, 64, 53, 255], 1],
        "H12": [[247, 255, 164, 255], 2],
        "BELOW": [[73, 255, 35, 255], 14],
        "H3": [[255, 144, 1, 255], 11],
    }

    legend_obj = wsc.WebVizDiscreteLegend(
        discreteData=Discrete_Data,
        title="DiscreteLegend",
        position=[16, 10],
        colorName="Stratigraphy",
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
