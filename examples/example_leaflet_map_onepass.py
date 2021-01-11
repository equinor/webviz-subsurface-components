import io
import numpy as np
import base64
from PIL import Image

import dash
import dash_core_components as dcc
import dash_html_components as html
import webviz_subsurface_components

def array2d_to_png(Z):
    """The leaflet map dash component takes in pictures as base64 data
    (or as a link to an existing hosted image). I.e. for containers wanting
    to create pictures on-the-fly from numpy arrays, they have to be converted
    to base64. This is an example function of how that can be done.

    This function encodes the numpy array to a RGBA png.
    The array is encoded as a heightmap, in Mapbox Terrain RGB format
    (https://docs.mapbox.com/help/troubleshooting/access-elevation-data/).
    The undefined values are set as having alpha = 0. The height values are
    shifted to start from 0.
    """

    shape = Z.shape

    Z -= np.nanmin(Z)
    Z = 10 * Z + 100000
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
                            "prefixZeroAlpha": False,
                            "scaleType": "linear",
                            "cutPointMin": min_value,
                            "cutPointMax": max_value,
                        },
                        "minvalue": min_value,
                        "maxvalue": max_value,
                        "bounds": [[432205, 6475078], [437720, 6481113]],
                        "shader": {
                            "type": "onepass",
                            "applyColorScale": True,
                            "applyHillshading": True,
                            "ambientLightIntensity": 0.5,
                            "diffuseLightIntensity": 0.5
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
        minZoom=-5,
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        style={"height": "80vh"},
        children=leaflet_map_1,
    )

    app.run_server(debug=True)
