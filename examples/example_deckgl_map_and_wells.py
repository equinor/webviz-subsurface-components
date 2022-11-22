import glob

import numpy as np
import xtgeo
import dash
import webviz_subsurface_components as wsc

from utils.xtgeo_surface_to_float32 import get_surface_float32
from utils.xtgeo_wells_to_json import xtgeo_wells_to_geojson
from utils.xtgeo_polygons_to_json import xtgeo_polygons_to_polylines_geojson

# Import a depth surface
depth_surface = xtgeo.surface_from_file("examples/example-data/topvolantis_depth.gri")

# Import wells
wells = [
    xtgeo.well_from_file(wellfile, mdlogname="MDepth")
    for wellfile in glob.glob("examples/example-data/*.rmswell")
]

polygons = xtgeo.polygons_from_file(
    "examples/example-data/topvolantis_faultpolygons.pol"
)

app = dash.Dash(__name__)

app.layout = wsc.DeckGLMap(
    id="deckgl-map",
    layers=[
        {
            "@@type": "AxesLayer",
            "id": "axes-layer",
            "bounds": [
                depth_surface.xmin,
                depth_surface.ymin,
                -np.nanmax(depth_surface.values),
                depth_surface.xmax,
                depth_surface.ymax,
                np.nanmin(depth_surface.values),
            ],
        },
        {
            "@@type": "MapLayer",
            "id": "mesh-layer",
            "meshUrl": "/map/mesh",
            "frame": {
                "origin": [depth_surface.xori, depth_surface.yori],
                "count": [depth_surface.ncol, depth_surface.nrow],
                "increment": [depth_surface.xinc, depth_surface.yinc],
                "rotDeg": depth_surface.rotation,
            },
            "contours": [0, 20],
            "isContoursDepth": True,
            "gridLines": False,
            "material": True,
            "colorMapName": "Physics",
            "name": "mesh",
        },
        {
            "@@type": "WellsLayer",
            "id": "wells-layer",
            "data": "/wells/wells.json",
            "refine": False,
        },
        {
            "@@type": "FaultPolygonsLayer",
            "id": "fault-layer",
            "data": "/faults/faults.json",
            "refine": False,
        },
    ],
    views={
        "layout": [1, 2],
        "showLabel": True,
        "viewports": [
            {
                "id": "view_1",
                "show3D": True,
                "name": "Depth surface",
                "layerIds": ["axes-layer", "mesh-layer", "wells-layer"],
                "isSync": True,
            },
            {
                "id": "view_2",
                "show3D": True,
                "name": "Depth surface",
                "layerIds": ["axes-layer", "wells-layer", "fault-layer"],
                "isSync": True,
            },
        ],
    },
)


@app.server.route("/map/<map_name>")
def send_map(map_name: str):
    if map_name == "mesh":
        return get_surface_float32(depth_surface)


@app.server.route("/wells/wells.json")
def send_wells():
    return xtgeo_wells_to_geojson(wells)


@app.server.route("/faults/faults.json")
def send_faults():
    return xtgeo_polygons_to_polylines_geojson(polygons)


if __name__ == "__main__":
    app.run_server(debug=True)
