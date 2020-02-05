import numpy as np

import dash
import dash_html_components as html
import webviz_subsurface_components

from example_layered_map import array_to_png
from PIL import Image
import io, base64

def img_to_b64_string(path):
    with open(path, 'rb') as img:
        b64 = base64.b64encode(img.read()).decode("ascii")
        return f"data:image/png;base64,{b64}"

leftImg = img_to_b64_string('./example-data/left.png')
rightImg = img_to_b64_string("./example-data/right.png")


arr = np.loadtxt("./example-data/layered-map-data.npz.gz")
imageUrl= array_to_png(arr)

imageBounds = [[0, 0], [1000, 1000]]
app = dash.Dash(__name__)

app.layout = html.Div(
    children=[
        html.Div(
            style={"display": "flex", "flexWrap": "wrap"},
            children=[
                html.Div(
                    style={"flex": 1, "margin": "10px"},
                    children=[
                    html.P("image"),
                        webviz_subsurface_components.Leaflet(
                        	height='400px',
                            id="image",
                            simpleCRS=True,
                            baseLayer={
                                "url": imageUrl,
                                "bounds": imageBounds,
                                "type": "image",
                            },
                        )
                    ],
                ),
                html.Div(
                    style={"flex": 1, "margin": "10px"},
                    children=[
                        html.P("Local tiles"),
                        webviz_subsurface_components.Leaflet(
                        	height='400px',
                            id="tile",
                            simpleCRS=True,
                            options={"center": [-100,75], 'zoom':0, 'maxZoom':5},
                            baseLayer={
                                "url": "./assets/tiles/{z}/{x}/{y}.png",
                                "type": "tiles",
                            },
                        )
                    ],
                ),
            ],
        ),
        html.Div(
            style={"display": "flex", "flexWrap": "wrap"},
            children=[
                html.Div(
                    style={"flex": 1, "margin": "10px"},
                    children=[
                    html.P("Image side-by-side"),
                        webviz_subsurface_components.Leaflet(
                        	height='400px',
                            id="image2",
                            simpleCRS=True,
                            baseLayer={
                                "url_left":leftImg,
                                "url_right":rightImg,
                                "bounds": imageBounds,
                                "type": "image_sidebyside",
                            },
                        )
                    ],
                ),
                html.Div(
                    style={"flex": 1, "margin": "10px"},
                    children=[
                    html.P("Tiles side-by-side"),
                        webviz_subsurface_components.Leaflet(
                        	height='400px',
                            id="tile2",
                            options={"center": [60.39, 5.32], 'zoom':10, 'maxZoom':20},
                            baseLayer={
                                "url_left": 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                "url_right": 'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                                "type": "tiles_sidebyside",
                            },
                        )
                    ],
                ),
            ],
        ),
    ]
)
app.run_server(debug=True)
