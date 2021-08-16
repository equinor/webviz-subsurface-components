# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import io
import base64
import copy
import re

import dash
import dash_html_components as html
import dash_core_components as dcc
import jsonpatch
import jsonpointer
import numpy as np
from PIL import Image

import webviz_subsurface_components


class MapSpec:
    def __init__(self, initialSpec=None, initialPatch=None):
        self._spec = initialSpec
        if initialPatch:
            self.apply_patch(initialPatch)

    def get_spec(self):
        return self._spec

    def get_spec_clone(self):
        return copy.deepcopy(self._spec)

    def update(self, new_spec):
        updated_spec = new_spec
        if callable(new_spec):
            updated_spec = new_spec(self.get_spec_clone())

        patch = jsonpatch.make_patch(self._spec, updated_spec).patch

        self._spec = updated_spec
        return patch

    def create_patch(self, new_spec=None):
        if new_spec is None:
            return jsonpatch.make_patch(None, self._spec).patch

        comp_with = new_spec
        if callable(new_spec):
            comp_with = new_spec(self.get_spec_clone())

        return jsonpatch.make_patch(self._spec, comp_with).patch

    def apply_patch(self, patch):
        jsonpatch.apply_patch(self._spec, self.normalize_patch(patch), True)

    # Replace ids with indices in the patch paths
    def normalize_patch(self, in_patch, inplace=False):
        def replace_path_id(matched):
            parent = matched.group(1)
            obj_id = matched.group(2)
            parent_array = jsonpointer.resolve_pointer(self._spec, parent)
            matched_id = -1
            for (i, elem) in enumerate(parent_array):
                if elem["id"] == obj_id:
                    matched_id = i
                    break
            if matched_id < 0:
                raise f"Id {obj_id} not found"
            return f"{parent}/{matched_id}"

        out_patch = in_patch if inplace else copy.deepcopy(in_patch)
        for patch in out_patch:
            patch["path"] = re.sub(
                r"([\w\/-]*)\/\[([\w-]+)\]", replace_path_id, patch["path"]
            )

        return out_patch


def array2d_to_png(z_array):
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
    COLOR_MAP = "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster/assets/colormaps/plasma.png"
    WELLS = (
        "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/"
        "master/react/src/demo/example-data/volve_wells.json"
    )
    LOGS = (
        "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/"
        "master/react/src/demo/example-data/volve_logs.json"
    )

    bounds = [432205, 6475078, 437720, 6481113]  # left, bottom, right, top
    width = bounds[2] - bounds[0]  # right - left
    height = bounds[3] - bounds[1]  # top - bottom

    map_obj = webviz_subsurface_components.DeckGLMap(
        id="deckgl-map",
        resources={
            "propertyMap": map_data,
        },
        deckglSpecBase={
            "initialViewState": {
                "target": [bounds[0] + width / 2, bounds[1] + height / 2, 0],
                "zoom": -3,
            },
            "layers": [
                {
                    "@@type": "ColormapLayer",
                    "id": "colormap-layer",
                    "bounds": bounds,
                    "image": "@@#resources.propertyMap",
                    "colormap": COLOR_MAP,
                    "valueRange": [min_value, max_value],
                    "pickable": True,
                },
                {
                    "@@type": "Hillshading2DLayer",
                    "id": "hillshading-layer",
                    "bounds": bounds,
                    "opacity": 1.0,
                    "valueRange": [min_value, max_value],
                    "image": "@@#resources.propertyMap",
                    "pickable": True,
                },
                {
                    "@@type": "DrawingLayer",
                    "id": "drawing-layer",
                    "data": {"type": "FeatureCollection", "features": []},
                },
                {
                    "@@type": "WellsLayer",
                    "id": "wells-layer",
                    "data": WELLS,
                    "logData": LOGS,
                    "opacity": 1.0,
                    "lineWidthScale": 5,
                    "pointRadiusScale": 8,
                    "outline": True,
                    "logRadius": 6,
                    "logrunName": "BLOCKING",
                    "logName": "ZONELOG",
                    "logCurves": True,
                    "refine": True,
                },
            ],
            "views": [
                {
                    "@@type": "OrthographicView",
                    "id": "main",
                    "controller": {"doubleClickZoom": False},
                    "x": "0%",
                    "y": "0%",
                    "width": "100%",
                    "height": "100%",
                    "flipY": False,
                }
            ],
        },
    )

    colormap_dropdown = dcc.Dropdown(
        id="colormap-select",
        options=[
            {
                "label": "Black & White",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/binary_r.png",
            },
            {
                "label": "Plasma",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/plasma.png",
            },
            {
                "label": "Seismic",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/seismic.png",
            },
            {
                "label": "Spectral",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/spectral.png",
            },
            {
                "label": "Terrain",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/terrain.png",
            },
            {
                "label": "Viridis",
                "value": "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
                "colormaps/viridis.png",
            },
        ],
        value="https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/"
        "colormaps/plasma.png",
        clearable=False,
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            html.Div(
                style={"float": "left", "width": "256px"},
                children=[
                    colormap_dropdown,
                    html.Img(
                        id="colormap-img",
                    ),
                ],
            ),
            html.Div(
                style={"float": "left", "width": "95%", "height": "90vh"},
                children=[map_obj],
            ),
        ]
    )

    @app.callback(
        dash.dependencies.Output("colormap-img", "src"),
        [dash.dependencies.Input("colormap-select", "value")],
    )
    def update_img(value):
        return value

    @app.callback(
        dash.dependencies.Output("deckgl-map", "deckglSpecBase"),
        dash.dependencies.Output("deckgl-map", "deckglSpecPatch"),
        dash.dependencies.Input("colormap-select", "value"),
        dash.dependencies.State("deckgl-map", "deckglSpecBase"),
        dash.dependencies.State("deckgl-map", "deckglSpecPatch"),
    )
    def sync_drawing(colormap, spec_base, spec_patch):
        if not colormap:
            return None

        map_spec = MapSpec(spec_base, spec_patch)

        def apply_colormap(spec):
            # Update the colormap layer then return the full spec.
            # The MapSpec class will create a patch from it.
            spec["layers"][0]["colormap"] = colormap
            return spec

        # Send the updated base spec (the input base+patch) and the colormap patch.
        # This can be done in a number of ways:
        # - Apply input patch and local modifications to the input base and send just deckglSpecBase
        # - Apply input patch to the input base and send it as deckglSpecBase.
        #   Send local modifications as deckglSpecBase. (Current solution)
        # - Send just the input patch and local modifications as deckglSpecBase
        return map_spec.get_spec(), map_spec.create_patch(apply_colormap)

    app.run_server(debug=True)
