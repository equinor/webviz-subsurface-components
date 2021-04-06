# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import io
import base64

import dash
import dash_html_components as html
import numpy as np
from PIL import Image

import webviz_subsurface_components


def array2d_to_png(z_array):
    """The leaflet map dash component takes in pictures as base64 data
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

    shape = z_array.shape
    z_array = np.repeat(z_array, 4)  # This will flatten the array

    z_array[0::4][np.isnan(z_array[0::4])] = 0  # Red
    z_array[1::4][np.isnan(z_array[1::4])] = 0  # Green
    z_array[2::4][np.isnan(z_array[2::4])] = 0  # Blue

    z_array[0::4] = np.floor((z_array[0::4] / (256 * 256)) % 256)  # Red
    z_array[1::4] = np.floor((z_array[1::4] / 256) % 256)  # Green
    z_array[2::4] = np.floor(z_array[2::4] % 256)  # Blue
    z_array[3::4] = np.where(np.isnan(z_array[3::4]), 0, 255)  # Alpha

    # Back to 2d shape + 1 dimension for the rgba values.
    z_array = z_array.reshape((shape[0], shape[1], 4))
    image = Image.fromarray(np.uint8(z_array), "RGBA")

    byte_io = io.BytesIO()
    image.save(byte_io, format="png")
    byte_io.seek(0)

    # image.save("debug_image.png")

    base64_data = base64.b64encode(byte_io.read()).decode("ascii")
    return f"data:image/png;base64,{base64_data}"


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

    min_value = np.nanmin(map_data)
    max_value = np.nanmax(map_data)

    # Shift the values to start from 0 and scale them to cover
    # the whole RGB range for increased precision.
    # The client will need to reverse this operation.
    scale_factor = (256 * 256 * 256 - 1) / (max_value - min_value)
    map_data = (map_data - min_value) * scale_factor

    map_data = array2d_to_png(map_data)

    leaflet_map_1 = webviz_subsurface_components.LeafletMap(
        id="example-map",
        layers=[
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
                            "prefixz_arrayeroAlpha": False,
                            "scaleType": "linear",
                            "cutPointMin": 0,
                            "cutPointMax": 1,
                            "remapPointMin": 0,
                            "remapPointMax": 1,
                        },
                        "minvalue": min_value,
                        "maxvalue": max_value,
                        "bounds": [[432205, 6475078], [437720, 6481113]],
                        "shader": {
                            "type": "terrainRGB",
                            "applyColorScale": True,
                            "applyHillshading": True,
                            "ambientLightIntensity": 0.5,
                            "diffuseLightIntensity": 0.5,
                        },
                    },
                ],
            },
        ],
        colorBar={"position": "bottomleft"},
        defaultBounds=[[0, 0], [30, 30]],
        mouseCoords={
            "coordinatePosition": "bottomright",
        },
        updateMode="",
        minz_arrayoom=-5,
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        style={"height": "80vh"},
        children=leaflet_map_1,
    )

    app.run_server(debug=True)
