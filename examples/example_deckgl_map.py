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
import jsonpatch
import jsonpointer
import numpy as np
from PIL import Image

import webviz_subsurface_components


class MapSpec:
    def __init__(self, initialSpec={}):
        self._spec = initialSpec

    # Warning: modifying the spec directly might result in missing patches,
    # and getting out of sync with the frontend state.
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
        jsonpatch.apply_patch(self._spec, self.normalize_patch(patch))

    # Replace ids with indices in the patch paths
    def normalize_patch(self, patch, inplace=False):
        def replace_path_id(matched):
            parent = matched.group(1)
            id = matched.group(2)
            parent_array = jsonpointer.resolve_pointer(self._spec, parent)
            matched_id = -1
            for (i, elem) in enumerate(parent_array):
                if elem["id"] == id:
                    matched_id = i
                    break
            if matched_id < 0:
                raise f"Id {id} not found"
            return f"{parent}/{matched_id}"

        out_patch = patch if inplace else copy.deepcopy(patch)
        for p in out_patch:
            p["path"] = re.sub(r"([\w\/-]*)\/\[([\w-]+)\]", replace_path_id, p["path"])

        return out_patch


class LeftMapSpec(MapSpec):
    def __init__(self, bounds, width, height, colormap, min_val, max_val):
        super().__init__(
            {
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
                        "colormap": colormap,
                        "valueRange": [min_val, max_val],
                        "pickable": True,
                    },
                    {
                        "@@type": "Hillshading2DLayer",
                        "id": "hillshading-layer",
                        "bounds": bounds,
                        "opacity": 1.0,
                        "valueRange": [min_val, max_val],
                        "image": "@@#resources.propertyMap",
                        "pickable": True,
                    },
                    {
                        "@@type": "DrawingLayer",
                        "id": "drawing-layer",
                        "mode": "drawLineString",
                        "data": {"type": "FeatureCollection", "features": []},
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
            }
        )

    def update_drawing_mode(self, mode):
        spec = self.get_spec_clone()
        spec["layers"][2]["mode"] = mode
        self.update(spec)


class RightMapSpec(MapSpec):
    def __init__(self, bounds, width, height, colormap, min_val, max_val, wells):
        super().__init__(
            {
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
                        "colormap": colormap,
                        "valueRange": [min_val, max_val],
                        "pickable": True,
                    },
                    {
                        "@@type": "Hillshading2DLayer",
                        "id": "hillshading-layer",
                        "bounds": bounds,
                        "opacity": 1.0,
                        "valueRange": [min_val, max_val],
                        "image": "@@#resources.propertyMap",
                        "pickable": True,
                    },
                    {
                        "@@type": "DrawingLayer",
                        "id": "drawing-layer",
                        "mode": "view",
                        "data": {"type": "FeatureCollection", "features": []},
                    },
                    {
                        "@@type": "WellsLayer",
                        "id": "wells-layer",
                        "data": wells,
                        "opacity": 1.0,
                        "lineWidthScale": 5,
                        "pointRadiusScale": 8,
                        "outline": True,
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
            }
        )

    def sync_drawing(self, in_patch):
        drawing_layer_patches = list(
            filter(
                lambda patch: patch["path"].startswith("/layers/[drawing-layer]/data")
                or patch["path"].startswith("/layers/2/data"),
                in_patch,
            )
        )
        self.apply_patch(drawing_layer_patches)

        return drawing_layer_patches


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
    COLORMAP = "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster/assets/colormaps/plasma.png"
    WELLS = (
        "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/src"
        "/demo/example-data/volve_wells.json"
    )

    bounds = [432205, 6475078, 437720, 6481113]  # left, bottom, right, top
    width = bounds[2] - bounds[0]  # right - left
    height = bounds[3] - bounds[1]  # top - bottom

    left_map_spec = LeftMapSpec(bounds, width, height, COLORMAP, min_value, max_value)
    left_map = webviz_subsurface_components.DeckGLMap(
        id="DeckGL-Map-Left",
        resources={
            "propertyMap": map_data,
        },
        deckglSpecPatch=left_map_spec.create_patch(),
    )

    right_map_spec = RightMapSpec(
        bounds, width, height, COLORMAP, min_value, max_value, WELLS
    )
    right_map = webviz_subsurface_components.DeckGLMap(
        id="DeckGL-Map-Right",
        resources={
            "propertyMap": map_data,
        },
        deckglSpecPatch=right_map_spec.create_patch(),
    )

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            html.Div(
                style={"float": "left", "width": "50%", "height": "95vh"},
                children=[left_map],
            ),
            html.Button(
                id="toggle-drawing",
                children="Toggle drawing mode",
            ),
            html.Div(
                style={"float": "right", "width": "50%", "height": "95vh"},
                children=[right_map],
            ),
        ]
    )

    @app.callback(
        dash.dependencies.Output("DeckGL-Map-Left", "deckglSpecPatch"),
        dash.dependencies.Input("toggle-drawing", "n_clicks"),
    )
    def toggle_drawing(n_clicks):
        mode = "view" if n_clicks is None or n_clicks % 2 == 0 else "drawLineString"
        return left_map_spec.update_drawing_mode(mode)

    @app.callback(
        dash.dependencies.Output("DeckGL-Map-Right", "deckglSpecPatch"),
        dash.dependencies.Input("DeckGL-Map-Left", "deckglSpecPatch"),
    )
    def sync_drawing(in_patch):
        if not in_patch:
            return None
        # Update internal state of the left map
        left_map_spec.apply_patch(in_patch)

        # Update the right map
        return right_map_spec.sync_drawing(in_patch)

    app.run_server(debug=True)
