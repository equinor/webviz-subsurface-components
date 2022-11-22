import glob

import orjson as json
import numpy as np
import xtgeo
import dash
import webviz_subsurface_components as wsc

from utils.xtgeo_grid_to_vtk_polydata import get_surface

xtgeo_grid = xtgeo.grid_from_file("examples/example-data/eclgrid.roff")
xtgeo_grid_property = xtgeo.gridproperty_from_file(
    "examples/example-data/eclgrid_poro.roff"
)
grid_polys, grid_points, grid_scalar = get_surface(xtgeo_grid, xtgeo_grid_property)
grid_geometrics = xtgeo_grid.get_geometrics(allcells=True, return_dict=True)
app = dash.Dash(__name__)

app.layout = wsc.DeckGLMap(
    id="deckgl-map",
    layers=[
        {
            "@@type": "AxesLayer",
            "id": "axes-layer",
            "bounds": [
                grid_geometrics["xmin"],
                grid_geometrics["ymin"],
                -grid_geometrics["zmax"],
                grid_geometrics["xmax"],
                grid_geometrics["ymax"],
                -grid_geometrics["zmin"],
            ],
        },
        {
            "@@type": "Grid3DLayer",
            "id": "grid3d-layer",
            "material": True,
            "colorMapName": "Rainbow",
            "scaleZ": 1,
            "pointsUrl": "grid/points",
            "polysUrl": "grid/polys",
            "propertiesUrl": "grid/scalar",
        },
    ],
    views={
        "layout": [1, 1],
        "showLabel": True,
        "viewports": [
            {
                "id": "view_1",
                "show3D": True,
                "name": "3D Grid",
                "layerIds": ["axes-layer", "grid3d-layer"],
            },
        ],
    },
)


@app.server.route("/grid/<array>")
def send_grid_data(array: str):
    if array == "polys":
        return json.dumps(grid_polys.tolist())
    elif array == "points":
        return json.dumps(grid_points.tolist())
    elif array == "scalar":
        return json.dumps(grid_scalar.tolist())


if __name__ == "__main__":
    app.run_server(debug=True)
