import io
import json
import base64
from typing import List

import numpy as np
from matplotlib import cm
import dash
import dash_colorscales
import dash_core_components as dcc
from dash_extensions.callback import CallbackGrouper
from dash.dependencies import Input, Output, State
import dash_html_components as html
import webviz_subsurface_components

from example_layered_map import array_to_png

DEFAULT_COLORSCALE_COLORS = [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
]

if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt("examples/example-data/layered-map-data.npz.gz")

    min_value = int(np.nanmin(map_data))
    max_value = int(np.nanmax(map_data))

    map_data = array_to_png(map_data)
    colormap = array_to_png(
        cm.get_cmap("magma", 256)([np.linspace(0, 1, 256)]), colormap=True
    )

    state = {
        "switch": {"value": False},
        "pixel_scale": 10000,
        "elevation_scale": 1,
    }

    layers = [
        {
            "name": "A seismic horizon with colormap",
            "id": 1,
            "baseLayer": True,
            "checked": True,
            "action": None,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "colorScale": {
                        "colors": DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value,
                    },
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[0, 0], [30, 30]],
                    "shader": {"setBlackToAlpha": True},
                },
            ],
        }
    ]

    leaflet_map_1 = webviz_subsurface_components.LeafletMap(
        id="example-map",
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",
        },
        updateMode="",
    )

    leaflet_map_2 = webviz_subsurface_components.LeafletMap(
        id="example-map-2",
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",
        },
        updateMode="",
    )
    # ID's of the maps for which the callbacks are going to be made for. Required for shared callbacks
    callbackMaps = ["example-map", "example-map-2"]

    app = dash.Dash(__name__)

    # Dash extension used to call multiple callbacks on the same output
    cg = CallbackGrouper()

    app.layout = html.Div(
        children=[
            html.Div(
                [
                    html.Button("Toggle sync map 1", id="sync-map1-btn"),
                    html.Button("Toggle sync map 2", id="sync-map2-btn"),
                    html.Div(
                        [
                            "Draw tools",
                            dcc.Checklist(
                                id="draw-tools-options",
                                options=[
                                    {"label": "Polyline", "value": "drawPolyline"},
                                    {"label": "Polygon", "value": "drawPolygon"},
                                    {"label": "Marker", "value": "drawMarker"},
                                ],
                                value=["drawMarker", "drawPolygon", "drawPolyline"],
                                labelStyle={"display": "inline-block"},
                            ),
                        ]
                    ),
                ]
            ),
            html.Div(
                children=[leaflet_map_1, leaflet_map_2,],
                style={
                    "display": "grid",
                    "gridTemplateColumns": "1fr 1fr",
                    "minHeight": "90vh",
                },
            ),
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
            html.Pre(id="polyline2"),
            html.Pre(id="marker2"),
            html.Pre(id="polygon2"),
        ]
    )

    #
    #                           MAP 1 CALLBACKS
    #

    @cg.callback(
        Output("example-map", "syncDrawings"), [Input("sync-map1-btn", "n_clicks"),]
    )
    def sync_map(n_clicks):
        return False if n_clicks % 2 else True

    #
    #                           MAP 2 CALLBACKS
    #

    @cg.callback(
        Output("example-map-2", "syncDrawings"), [Input("sync-map2-btn", "n_clicks"),]
    )
    def sync_map_2(n_clicks):
        return False if n_clicks % 2 else True

    #
    #                           SHARED CALLBACKS
    #
    # Callbacks are made for each of the maps as specified in callbackMaps defined above
    for map in callbackMaps:

        @cg.callback(Output(map, "drawTools"), [Input("draw-tools-options", "value")])
        def update_draw_tools_options(value):
            new_options = {
                "drawMarker": False,
                "drawPolygon": False,
                "drawPolyline": False,
                "drawRectangle": False,
                "drawCircle": False,
            }
            for draw_option in value:
                new_options[draw_option] = True

            return new_options

        @cg.callback(Output("polyline", "children"), [Input(map, "polyline_points")])
        def get_edited_line(coords):
            return f"Edited polyline: {json.dumps(coords)}"

        @cg.callback(Output("marker", "children"), [Input(map, "marker_point")])
        def get_edited_line(coords):
            return f"Edited marker: {json.dumps(coords)}"

        @cg.callback(Output("polygon", "children"), [Input(map, "polygon_points")])
        def get_edited_line(coords):
            return f"Edited closed polygon: {json.dumps(coords)}"

    cg.register(app)

    app.run_server(debug=True)
