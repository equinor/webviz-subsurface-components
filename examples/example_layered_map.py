# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import io
import json
import base64
from PIL import Image
import numpy as np
from matplotlib import cm

import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import webviz_subsurface_components


def array_to_png(Z, shift=True, colormap=False):
    """The layered map dash component takes in pictures as base64 data
    (or as a link to an existing hosted image). I.e. for containers wanting
    to create pictures on-the-fly from numpy arrays, they have to be converted
    to base64. This is an example function of how that can be done.

    1) Scale the input array (Z) to the range 0-255.
    2) If shift=True and colormap=False, the 0 value in the scaled range
       is reserved for np.nan (while the actual data points utilize the
       range 1-255.

       If shift=True and colormap=True, the 0 value in the colormap range
       has alpha value equal to 0.0 (i.e. full transparency). This makes it
       possible for np.nan values in the actual map becoming transparent in
       the image.
    3) If the array is two-dimensional, the picture is stored as greyscale.
       Otherwise it is either stored as RGB or RGBA (depending on if the size
       of the third dimension is three or four, respectively).
    """

    Z -= np.nanmin(Z)

    if shift:
        Z *= 254.0 / np.nanmax(Z)
        Z += 1.0
    else:
        Z *= 255.0 / np.nanmax(Z)

    Z[np.isnan(Z)] = 0

    if colormap:
        if Z.shape[0] != 1:
            raise ValueError("The first dimension of a " "colormap array should be 1")
        if Z.shape[1] != 256:
            raise ValueError(
                "The second dimension of a " "colormap array should be 256"
            )
        if Z.shape[2] not in [3, 4]:
            raise ValueError(
                "The third dimension of a colormap " "array should be either 3 or 4"
            )
        if shift:
            if Z.shape[2] != 4:
                raise ValueError(
                    "Can not shift a colormap which " "is not utilizing alpha channel"
                )
            else:
                Z[0][0][3] = 0.0  # Make first color channel transparent

    if Z.ndim == 2:
        image = Image.fromarray(np.uint8(Z), "L")
    elif Z.ndim == 3:
        if Z.shape[2] == 3:
            image = Image.fromarray(np.uint8(Z), "RGB")
        elif Z.shape[2] == 4:
            image = Image.fromarray(np.uint8(Z), "RGBA")
        else:
            raise ValueError(
                "Third dimension of array must " "have length 3 (RGB) or 4 (RGBA)"
            )
    else:
        raise ValueError("Incorrect number of dimensions in array")

    byte_io = io.BytesIO()
    image.save(byte_io, format="png")
    byte_io.seek(0)

    base64_data = base64.b64encode(byte_io.read()).decode("ascii")
    return f"data:image/png;base64,{base64_data}"


if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt("./example-data/layered-map-data.npz.gz")

    min_value = int(np.nanmin(map_data))
    max_value = int(np.nanmax(map_data))

    map_data = array_to_png(map_data)
    colormap = array_to_png(
        cm.get_cmap("viridis", 256)([np.linspace(0, 1, 256)]), colormap=True
    )

    layers = [
        {
            "name": "A seismic horizon with colormap",
            "base_layer": True,
            "checked": True,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "allowHillshading": True,
                    "colormap": colormap,
                    "unit": "m",
                    "minvalue": min_value,
                    "maxvalue": max_value,
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                },
            ],
        },
        {
            "name": "The same map without colormap",
            "base_layer": True,
            "checked": False,
            "data": [
                {
                    "type": "image",
                    "url": map_data,
                    "bounds": [[432205, 6475078], [437720, 6481113]],
                }
            ],
        },
        {
            "name": "Some overlay layer",
            "base_layer": False,
            "checked": False,
            "data": [
                {
                    "type": "polygon",
                    "positions": [
                        [436204, 6475077],
                        [438204, 6480077],
                        [432204, 6475077],
                    ],
                    "color": "blue",
                    "tooltip": "This is a blue polygon",
                },
                {
                    "type": "circle",
                    "center": [435200, 6478000],
                    "color": "red",
                    "radius": 2,
                    "tooltip": "This is a red circle",
                },
            ],
        },
    ]

    with open("../src/demo/example-data/layered-map.json", "w") as fh:
        json.dump({"layers": layers}, fh)

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            webviz_subsurface_components.LayeredMap(id="volve-map", layers=layers),
            html.Pre(id="polyline"),
            html.Pre(id="marker"),
            html.Pre(id="polygon"),
        ]
    )

    @app.callback(
        Output("polyline", "children"), [Input("volve-map", "polyline_points")]
    )
    def get_edited_line(coords):
        return f"Edited polyline: {json.dumps(coords)}"

    @app.callback(Output("marker", "children"), [Input("volve-map", "marker_point")])
    def get_edited_line(coords):
        return f"Edited marker: {json.dumps(coords)}"

    @app.callback(Output("polygon", "children"), [Input("volve-map", "polygon_points")])
    def get_edited_line(coords):
        return f"Edited closed polygon: {json.dumps(coords)}"

    app.run_server(debug=True)
