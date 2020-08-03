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
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                    "shader": {"setBlackToAlpha": True},
                },
            ],
        },
        {
            "name": "A seismic horizon without colormap",
            "id": 44,
            "baseLayer": True,
            "checked": False,
            "action": None,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "allowHillshading": True,
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                    "shader": {"setBlackToAlpha": True},
                },
            ],
        },
        {
            "name": "Map",
            "id": 3,
            "baseLayer": True,
            "checked": False,
            "action": None,
            "data": [
                {
                    "colorScale": {
                        "colors": DEFAULT_COLORSCALE_COLORS,
                        "prefixZeroAlpha": False,
                        "scaleType": "linear",
                        "cutPointMin": min_value,
                        "cutPointMax": max_value,
                    },
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "type": "tile",
                    "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    "colormap": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAAuElEQVR4nI2NyxUDIQwDR6K0lJD+W1nnABgvIZ8DT7JGNnroieRAQjJYMFQ2SDBUk0mrl16odGce05de9Z2zzStLLhEuvurIZzeZOedizd7mT70f7JOe7v7XA/jBBaH4ztn3462z37l1c7/ys1f6QFNZuUZ+1+JZ3oVN79FxctLvLB/XIQuslbe3+eSv7LVyd/KmC9O13Vjf63zt7r3kW7dR/iVuvv/H8NBE1/SiIayhiCZjhDFN5gX8UYgJzVykqAAAAABJRU5ErkJggg==",
                    "shader": {"type": "none", "elevationScale": 0.01,},
                }
            ],
        },
    ]

    leaflet_map_1 = webviz_subsurface_components.LeafletMap(
        id="example-map",
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        defaultBounds=[[0, 0], [30, 30]],
        mouseCoords={"coordinatePosition": "bottomright",},
        switch={"value": False, "label": "Hillshading",},
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",
        },
        scaleY={"scaleY": 1, "minScaleY": 1, "maxScaleY": 10, "position": "topleft",},
        updateMode="",
        minZoom=-5,
    )

    leaflet_map_2 = webviz_subsurface_components.LeafletMap(
        id="example-map-2",
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
        layers=layers,
        colorBar={"position": "bottomleft"},
        mouseCoords={"coordinatePosition": "bottomright",},
        switch={"value": False, "label": "Hillshading",},
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright",
        },
        updateMode="",
        minZoom=-5,
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
                    html.Div(
                        [
                            "Layer to edit:",
                            dcc.Dropdown(
                                id="selected-layer",
                                options=[
                                    {
                                        "label": "A seismic horizon with colormap",
                                        "value": "1",
                                    },
                                    {
                                        "label": "A seismic horizon without colormap",
                                        "value": "44",
                                    },
                                    {"label": "Map", "value": "3"},
                                ],
                                value="1",
                            ),
                        ]
                    ),
                    html.Div(
                        [
                            "Layer update method",
                            dcc.RadioItems(
                                id="layer-change-method",
                                options=[
                                    {"label": "Update", "value": "update"},
                                    {"label": "Replace", "value": "replace"},
                                ],
                                value="update",
                            ),
                        ]
                    ),
                    html.Button("Toggle sync map 1", id="sync-map1-btn"),
                    html.Button("Toggle sync map 2", id="sync-map2-btn"),
                    html.Button("Add layer", id="layer-add-btn"),
                    html.Button("Toggle log", id="log-toggle-btn"),
                    html.Button(
                        "Toggle shader - replace", id="shader-toggle-replace-btn"
                    ),
                    html.Button("Toggle shadows", id="shading-submit-val", n_clicks=0),
                    dcc.Input(
                        id="delete-layer-id",
                        type="number",
                        size="2",
                        placeholder="Delete layer by id",
                    ),
                    html.Button("Submit", id="delete-submit", n_clicks=0),
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
                children=[
                    html.Div(
                        children=[
                            html.Div(
                                children=[
                                    html.H6(
                                        "Elevation scale value",
                                        id="elevation-scale-container",
                                    ),
                                    dcc.Slider(
                                        id="elevation-scale",
                                        min=0.0,
                                        max=10.0,
                                        step=0.1,
                                        value=1.0,
                                        marks={0: {"label": "0"}, 10: {"label": "10"}},
                                    ),
                                ]
                            ),
                            html.Div(
                                children=[
                                    html.H6(
                                        "Pixel scale value", id="pixel-scale-container"
                                    ),
                                    dcc.Slider(
                                        id="pixel-scale",
                                        min=2500,
                                        max=25000,
                                        step=10,
                                        value=11000,
                                        marks={
                                            2500: {"label": "2500"},
                                            25000: {"label": "25000"},
                                        },
                                    ),
                                ]
                            ),
                            html.Div(
                                children=[
                                    html.H6(
                                        "Minimum, maximum map values",
                                        id="min-max-output-container",
                                    ),
                                    dcc.RangeSlider(
                                        id="min-max-slider",
                                        min=min_value - 1000,
                                        max=max_value + 1000,
                                        step=1,
                                        value=[min_value, max_value],
                                        marks={
                                            str(min_value - 1000): str(
                                                min_value - 1000
                                            ),
                                            str(max_value + 1000): str(
                                                max_value + 1000
                                            ),
                                        },
                                    ),
                                ]
                            ),
                            html.Div(
                                children=[
                                    html.H6("Cutoff points", id="cut-output-container"),
                                    dcc.RangeSlider(
                                        id="cut-slider",
                                        min=min_value,
                                        max=max_value,
                                        step=1,
                                        value=[min_value, max_value],
                                        marks={
                                            min_value: str(min_value),
                                            max_value: str(max_value),
                                        },
                                    ),
                                ]
                            ),
                            dash_colorscales.DashColorscales(
                                id="layer-colorscale", nSwatches=7, fixSwatches=True
                            ),
                            html.P(id="output", children=""),
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
                ],
                style={"display": "grid", "gridTemplateColumns": "400px auto"},
            ),
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
            html.Pre(id="clicked_shape"),
        ]
    )

    #
    #                           SUPPORTIVE FUNCTIONS
    #
    def change_layer(layers, update_layer):
        update_layer_id = update_layer["id"]
        for n in range(len(layers)):
            if layers[n]["id"] == update_layer_id:
                layers[n] = update_layer
        return layers

    def get_layer_type(layer_id, layers):
        for layer in layers:
            if str(layer["id"]) == str(layer_id):
                if layer["data"][0]["type"] == "image":
                    return "image"
        return "tile"

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

        @cg.callback(Output(map, "updateMode"), [Input("layer-change-method", "value")])
        def change_layer_change_method(value):
            return value

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

        # Updates elevation and pixel scales based on their corresponding sliders
        @cg.callback(
            Output(map, "layers"),
            [Input("elevation-scale", "value"), Input("pixel-scale", "value")],
            [State("selected-layer", "value"), State("shading-submit-val", "n_clicks")],
        )
        def update_shadow_scales(elevation_scale, pixel_scale, layer_id, n_clicks):
            layer_type = get_layer_type(layer_id, layers)

            state["elevation_scale"] = elevation_scale if n_clicks % 2 else None
            state["pixel_scale"] = pixel_scale if n_clicks % 2 else None

            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {
                            "type": layer_type,
                            "shader": {
                                "type": "hillshading" if n_clicks % 2 else None,
                                "shadows": True if n_clicks % 2 else False,
                                "elevationScale": state["elevation_scale"],
                                "pixelScale": state["pixel_scale"],
                                "setBlackToAlpha": True,
                            },
                        }
                    ],
                }
            ]
            return update_layer

        @cg.callback(
            Output(map, "layers"),
            [Input("shading-submit-val", "n_clicks"),],
            [
                State("elevation-scale", "value"),
                State("pixel-scale", "value"),
                State("selected-layer", "value"),
            ],
        )
        def update_hillshading_with_shadows(
            n_clicks, elevation_scale, pixel_scale, layer_id
        ):
            layer_type = get_layer_type(layer_id, layers)

            state["elevation_scale"] = elevation_scale
            state["pixel_scale"] = pixel_scale
            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {
                            "type": layer_type,
                            "shader": {
                                "type": "hillshading" if n_clicks % 2 else None,
                                "shadows": True if n_clicks % 2 else False,
                                "elevationScale": state["elevation_scale"],
                                "pixelScale": state["pixel_scale"],
                                "setBlackToAlpha": True,
                            },
                        }
                    ],
                }
            ]
            return update_layer

        @cg.callback(Output(map, "layers"), [Input("layer-add-btn", "n_clicks"),])
        def add_layer(add_n_clicks):
            new_layer = [
                {
                    "name": "a very cool layer",
                    "id": 2,
                    "baseLayer": True,
                    "checked": False,
                    "action": "add",
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
                            "allowHillshading": True,
                            "minvalue": min_value,
                            "maxvalue": max_value,
                            "bounds": [[0, 0], [-30, -30]],
                        },
                    ],
                }
            ]
            return new_layer

        @cg.callback(
            Output(map, "layers"),
            [Input("layer-colorscale", "colorscale"),],
            State("selected-layer", "value"),
        )
        def update_colorcsale(colorScale, layer_id):
            layer_type = get_layer_type(layer_id, layers)
            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {"type": layer_type, "colorScale": {"colors": colorScale,}}
                    ],
                }
            ]
            return update_layer

        @cg.callback(
            Output(map, "layers"),
            [Input("delete-submit", "n_clicks")],
            State("delete-layer-id", "value"),
        )
        def delete_layer(n_clicks, layer_id):
            update_layer = [{"id": int(layer_id), "action": "delete",}]
            return update_layer

        @cg.callback(
            Output(map, "layers"),
            [Input("min-max-slider", "value")],
            State("selected-layer", "value"),
        )
        def update_global_min_max(min_max_value, layer_id):
            layer_type = get_layer_type(layer_id, layers)

            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {
                            "type": layer_type,
                            "minvalue": min_max_value[0],
                            "maxvalue": min_max_value[1],
                        }
                    ],
                }
            ]

            return update_layer

        # Updates the text for min/max slider
        @cg.callback(
            Output("min-max-output-container", "children"),
            [Input("min-max-slider", "value")],
        )
        def update_min_max_text(value):
            return 'Global Min / Max"{}"'.format(value)

        @cg.callback(Output("cut-slider", "min"), [Input("min-max-slider", "value")])
        def update_min_cutoffpoints_in_dash(value):
            return int(value[0])

        @cg.callback(Output("cut-slider", "max"), [Input("min-max-slider", "value")])
        def update_max_cutoffpoints_in_dash(value):
            return int(value[1])

        @cg.callback(Output("cut-slider", "marks"), [Input("min-max-slider", "value")])
        def update_cutoff_marks(value):
            return {
                round(value[0]): str(round(value[0])),
                round(value[1]): str(round(value[1])),
            }

        @cg.callback(
            Output(map, "layers"),
            [Input("cut-slider", "value")],
            State("selected-layer", "value"),
        )
        def update_cut_points(value, layer_id):
            layer_type = get_layer_type(layer_id, layers)

            state["cut_point_min"] = value[0]
            state["cut_point_max"] = value[1]
            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {
                            "type": layer_type,
                            "colorScale": {
                                "cutPointMin": value[0],
                                "cutPointMax": value[1],
                            },
                        }
                    ],
                }
            ]

            return update_layer

        # Updates the text for cut-off slider
        @cg.callback(
            Output("cut-output-container", "children"), [Input("cut-slider", "value")]
        )
        def update_cut_points_text(value):
            return 'Cutoff Min / Max"{}"'.format(value)

        # updates the text for elevation scale
        @cg.callback(
            Output("elevation-scale-container", "children"),
            [Input("elevation-scale", "value")],
        )
        def update_elevation_text(value):
            return 'Elevation scale value: "{}"'.format(value)

        # updates the text for pixel scale
        @cg.callback(
            Output("pixel-scale-container", "children"), [Input("pixel-scale", "value")]
        )
        def update_pixel_text(value):
            return 'Pixel scale value: "{}"'.format(value)

        @cg.callback(
            Output(map, "layers"),
            [Input("log-toggle-btn", "n_clicks"),],
            State("selected-layer", "value"),
        )
        def toggle_log(n_clicks, layer_id):
            layer_type = get_layer_type(layer_id, layers)

            log_value = "linear" if n_clicks % 2 == 0 else "log"
            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {"type": layer_type, "colorScale": {"scaleType": log_value,},}
                    ],
                }
            ]
            return update_layer

        @cg.callback(
            Output(map, "layers"),
            [Input(map, "switch"),],
            State("selected-layer", "value"),
        )
        def toggle_shading(switch, layer_id):
            layer_type = get_layer_type(layer_id, layers)

            update_layer = [
                {
                    "id": int(layer_id),
                    "action": "update",
                    "data": [
                        {
                            "type": layer_type,
                            "shader": {
                                "type": "hillshading" if switch["value"] else None,
                            },
                        }
                    ],
                }
            ]
            return update_layer

        @cg.callback(
            Output(map, "layers"),
            [Input("shader-toggle-replace-btn", "n_clicks"),],
            State("selected-layer", "value"),
        )
        def toggle_shading_with_replace(n_clicks, layer_id):
            layer_type = get_layer_type(layer_id, layers)

            update_layer = [
                {
                    "id": int(layer_id),
                    "name": "A seismic horizon without colormap",
                    "baseLayer": True,
                    "checked": True,
                    "data": [
                        {
                            "url": map_data,
                            "allowHillshading": True,
                            "minvalue": min_value,
                            "maxvalue": max_value,
                            "bounds": [[0, 0], [30, 30]],
                            "type": layer_type,
                            "allowHillshading": True,
                            "colorScale": {
                                "colors": DEFAULT_COLORSCALE_COLORS,
                                "prefixZeroAlpha": False,
                                "scaleType": "linear",
                                "cutPointMin": min_value,
                                "cutPointMax": max_value,
                            },
                            "shader": {
                                "type": "hillshading" if n_clicks % 2 == 1 else None,
                                # "shadows": False,
                                # "elevationScale": 1.0,
                                # "pixelScale": 11000
                            },
                        }
                    ],
                }
            ]
            return update_layer

    #
    #                               OTHER CALLBACKS
    #

    @app.callback(
        Output("polyline", "children"), [Input("example-map", "polyline_points")]
    )
    def get_edited_line(coords):
        return f"Edited polyline: {json.dumps(coords)}"

    @app.callback(Output("marker", "children"), [Input("example-map", "marker_point")])
    def get_edited_line(coords):
        return f"Edited marker: {json.dumps(coords)}"

    @app.callback(
        Output("polygon", "children"), [Input("example-map", "polygon_points")]
    )
    def get_edited_line(coords):
        return f"Edited closed polygon: {json.dumps(coords)}"

    @app.callback(
        Output("clicked_shape", "children"), [Input("example-map", "clicked_shape")]
    )
    def get_clicked_shape(coords):
        return f"Clicked shape: {json.dumps(coords)}"

    cg.register(app)

    app.run_server(debug=True)
