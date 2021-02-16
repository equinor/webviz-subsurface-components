# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import io
import numpy as np
import base64
from PIL import Image

import dash
import dash_core_components as dcc
import dash_html_components as html
import webviz_subsurface_components

def array2d_to_png(Z):
    """The DeckGL map dash component takes in pictures as base64 data
    (or as a link to an existing hosted image). I.e. for containers wanting
    to create pictures on-the-fly from numpy arrays, they have to be converted
    to base64. This is an example function of how that can be done.

    This function encodes the numpy array to a RGBA png.
    The array is encoded as a heightmap, in a format similar to Mapbox TerrainRGB
    (https://docs.mapbox.com/help/troubleshooting/access-elevation-data/),
    but without the -10000 offset and the 0.1 scale.
    The undefined values are set as having alpha = 0. The height values are
    shifted to start from 0.
    """

    shape = Z.shape
    Z = np.repeat(Z, 4) # This will flatten the array

    Z[0::4][np.isnan(Z[0::4])] = 0  # Red
    Z[1::4][np.isnan(Z[1::4])] = 0  # Green
    Z[2::4][np.isnan(Z[2::4])] = 0  # Blue

    Z[0::4] = np.floor((Z[0::4] / (256*256)) % 256) # Red
    Z[1::4] = np.floor((Z[1::4] / 256) % 256)       # Green
    Z[2::4] = np.floor(Z[2::4] % 256)               # Blue
    Z[3::4] = np.where(np.isnan(Z[3::4]), 0, 255)   # Alpha

    # Back to 2d shape + 1 dimension for the rgba values.
    Z = Z.reshape((shape[0], shape[1], 4))
    image = Image.fromarray(np.uint8(Z), "RGBA")

    byte_io = io.BytesIO()
    image.save(byte_io, format="png")
    byte_io.seek(0)

    # image.save("debug_image.png")

    base64_data = base64.b64encode(byte_io.read()).decode("ascii")
    return f"data:image/png;base64,{base64_data}"

if __name__ == "__main__":

    # The data below is a modified version of one of the surfaces
    # taken from the Volve data set provided by Equinor and the former
    # Volve Licence partners under CC BY-NC-SA 4.0 license, and only
    # used here as an example data set.
    # https://creativecommons.org/licenses/by-nc-sa/4.0/
    map_data = np.loadtxt("examples/example-data/layered-map-data.npz.gz")

    min_value = np.nanmin(map_data)
    max_value = np.nanmax(map_data)
    value_range = max_value - min_value

    # Shift the values to start from 0 and scale them to cover
    # the whole RGB range for increased precision.
    # The client will need to reverse this operation.
    scale_factor = (256*256*256 - 1) / value_range
    map_data = (map_data - min_value) * scale_factor

    map_data = array2d_to_png(map_data)
    colormap = "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster/assets/colormaps/plasma.png"

    deckgl_map_1 = webviz_subsurface_components.DeckGLMap(
        id = "DeckGL-Map",
        jsonData = {
            "initialViewState": {
                "target": [0, 0, 0],
                "zoom": 3
            },
            "layers": [
                {
                    "@@type": "ColormapLayer",
                    "id": "colormap-layer",
                    "bounds": [-50, 50, 50, -50],
                    "image": map_data,
                    "colormap": colormap
                },
                {
                    "@@type": "Hillshading2DLayer",
                    "id": "hillshading-layer",
                    "bounds": [-50, 50, 50, -50],
                    "opacity": 1.0,
                    "valueRange": value_range,
                    "image": map_data
                }
            ],
            "views": [
                {
                    "@@type": "OrthographicView",
                    "id": "main",
                    "controller": True,
                    "x": "0%",
                    "y": "0%",
                    "width": "100%",
                    "height": "100%"
                },
                {
                    "@@type": "OrthographicView",
                    "id": "minimap",
                    "controller": False,
                    "x": "80%",
                    "y": "75%",
                    "width": "20%",
                    "height": "25%",
                    "clear": {
                        "color": [0.9, 0.9, 0.9, 1]
                    },
                    "viewState": {
                        "id": "main",
                        "zoom": 1
                    }
                }
            ]
        }
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        style = {"height": "95vh"},
        children = [
            deckgl_map_1,
            html.Img(src=colormap)
        ]
    )

    app.run_server(debug=True)
