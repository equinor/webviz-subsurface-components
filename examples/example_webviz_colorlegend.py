# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import dash
import webviz_subsurface_components as wsc


COLOR_TABLES = (
    "https://raw.githubusercontent.com/emerson-eps/color-tables/"
    "main/react-app/src/component/color-tables.json"
)

legend_obj = wsc.WebVizColorLegend(
    min=0,
    max=1,
    title="ColorLegend",
    colorName="Rainbow",
    horizontal=True,
    colorTables=COLOR_TABLES,
    cssLegendStyles={"left": "0vw", "top": "0vh"},
    discreteData={},
    reverseRange=False,
    isModal=False,
    isRangeShown=False,
    legendFontSize=18,
    tickFontSize=12,
    numberOfTicks=3,
    legendScaleSize=200,
    openColorSelector=False,
)

app = dash.Dash(__name__)

app.layout = dash.html.Div(
    style={"height": "90vh", "width": "100%"},
    children=[legend_obj],
)


if __name__ == "__main__":
    app.run_server(debug=True)
