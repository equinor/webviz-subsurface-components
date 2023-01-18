import glob

import numpy as np
import xtgeo
import dash
import webviz_subsurface_components as wsc

from utils.xtgeo_surface_to_float32 import get_surface_float32
from utils.xtgeo_wells_to_json import xtgeo_wells_to_geojson
from utils.xtgeo_polygons_to_json import xtgeo_polygons_to_geojson

polygons = xtgeo.polygons_from_file(
    "examples/example-data/topvolantis_faultpolygons.pol"
)

app = dash.Dash(__name__)

app.layout = dash.html.Div(
    style={"display": "flex", "height": "90vh"},
    children=[
        dash.html.Div(
            style={"flex": 1},
            children=dash.html.H1(id="selected-fault", children=[""]),
        ),
        dash.html.Div(
            style={"flex": "5", "position": "relative", "height": "90vh"},
            children=wsc.SubsurfaceViewerDashWrapper(
                id="deckgl-map",
                bounds=[456150, 5925800, 467400, 5939500],
                layers=[
                    {
                        "@@type": "SelectableGeoJsonLayer",
                        "id": "fault-layer",
                        "data": "/faults/faults.json",
                        "pickable": True,
                        "filled": True,
                        "lineWidthMinPixels": 4,
                        "getFillColor": "@@=[255,255/6*properties.name,0]",  # Just for fun
                        "getLineColor": "@@=[255,255/6*properties.name,0]",
                    },
                ],
                views={
                    "layout": [1, 2],
                    "showLabel": True,
                    "viewports": [
                        {
                            "id": "view_1",
                            "show3D": False,
                            "name": "Polygons",
                            "layerIds": ["fault-layer"],
                            "isSync": True,
                        },
                    ],
                },
            ),
        ),
    ],
)


@app.callback(
    dash.dependencies.Output("selected-fault", "children"),
    [dash.dependencies.Input("deckgl-map", "editedData")],
)
def display_selected_fault(edited_data):
    if edited_data is None:
        return "Selected fault: "
    faultname = edited_data["selectedGeoJsonFeature"]["properties"]["name"]
    return [f"Selected fault: {faultname}"]


@app.server.route("/faults/faults.json")
def send_faults():
    return xtgeo_polygons_to_geojson(polygons, xy_only=True)


if __name__ == "__main__":
    app.run_server(debug=True)
