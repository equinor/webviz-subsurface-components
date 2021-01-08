import numpy as np
import dash
import dash_core_components as dcc
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

    leaflet_map_1 = webviz_subsurface_components.LeafletMap(
        id="example-map",
        syncedMaps=["example-map-2", "example-map"],
        syncDrawings=True,
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
                        "shader": {"type": "onepass", "setBlackToAlpha": True},
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
