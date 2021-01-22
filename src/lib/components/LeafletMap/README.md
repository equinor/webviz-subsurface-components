This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

Copyright (C) 2020 - Equinor ASA.

# 🌍 LeafletMap Component
The new leafletMap component is a component for layered map data, like tile-data and WebGL images.

## 📋 Table of contents
- [Usage](#-usage)
    <br>
- [Props](#-props)
    - [Map specifics](#props-map-specifics)
    - [Map tools](#props-map-tools)
    - [Map syncronization](#props-map-syncronization)

    <br>
- [Layers](#-layers)
    - [Structure](#structure)
    - [Layer types](#layer-types)
        - [Image layers](#image-layers)
        - [Tile layers](#tile-layers)
        - [Shapes and drawings](#shapes-and-drawings)
    <br>

    - [Updating layers](#updating-layers)
        - [With action](#updating-layers-with-action)
        - [With replace](#updating-layers-with-replace)

    - [Color scales](#-colorscales)
    - [Hillshading](#-hillshading)

    <br>

- [Listeners](#-listeners)

    <br>

- [Serving tiles with Dash](#serving-tiles-with-dash)

## 🌤 Features
* WebGL Image-layer support
* WebGL Tile-layer support
* Custom colorscales
    * Logarithmic option
    * Cutoff points options
* Hillshading
* Drawing of polylines, polygons, circles, and markers
* Movement and draw synchronization between multiple instances

## 🌋 Usage
The component can be either used as an Dash-component or as a plain React component. This README will focus on Dash usages of the component.

### Getting started

#### Installation
```
pip install webviz-subsurface-components
```

### Using the component

This is a very basic example of how the component can be used.

```python
import dash
from webviz_subsurface_components import LeafletMap

layers = [
    {
        "id": 1,
        "name": "Test Image",
        "baseLayer": True,
        "checked": True,
        "data": [
            {
                "type": "image",
                "url": "LOCAL_IMAGE_FILE",
                "bounds": [[0, 0], [-30, -30]],
            }
        ]
    }
]

app = dash.Dash(__name__)

leaflet_map = LeafletMap(
    id='test-map',
    layers=layers,
)

app.layout = html.Div(
    children=[
        leaflet_map
    ]
)

app.run_server(debug=True)

```

<br>

----

<br>

## 🎰 Props
**The props available to the component**

<br>

### *Props:* Map specifics
| Name              | Type                    | Description                                                                                                                                                                                                                    | Example input                                   | Default         |
|-------------------|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|-----------------|
| **id**            | *String* Required       | The ID for the map. Used to sync maps and to reference the component in Dash.                                                                                                                                                  | "example-map"                                   | None            |
| **layers**        | *objects[ ]* Required     | The array of layer objects to be added to the map.                                                                                                                                                                             | See [Layers](#layers) for more information on what goes here | None              |
| **updateMode**        | *String*        |   VERY IMPORTANT if set to *"replace"* any attempt to update/change the layers prop will remove all current layers and expect you to provide new ones. See [Updating layers](#updating-layers) for more information on how this works.  |  "replace" | None              |
| **center**        | *Coordinate* (number[ ]) | A coordinate as an array of numbers. Determines the starting center point for the map.                                                                                                                                         | [15,15]                                         | [0,0]           |
| **defaultBounds** | *Coordinates[ ]*         | Array of two coordinates to specify the initial bounds of the map                                                                                                                                                              | [\[50,50] [100,100]]                             | [\[0,0] [30,30]] |
| **zoom**          | *Number*                | Initial zoom level of the map                                                                                                                                                                                                  | 5                                               | 1               |
| **minZoom**       | *Number*                | The minimum zoom level allowed                                                                                                                                                                                                 | -10                                             | 1               |
| **maxZoom**       | *Number*                | The maximum zoom level allowed                                                                                                                                                                                                 | 10                                              | 15              |
| **crs**           | *String*                | String which sets the coordinate referencing system. The default is set to Simple, and will be the best option in most cases. Alternatively, one can set this as "earth" which will provide a crs commonly used for tile maps. | ""                                              | "simple"        |
| **autoScaleMap**       | *Boolean*                 | If true, the map will then listen for changes in height and width, and recalculate the map-dimensions when changes occur. Can be useful when the map does not have a specific width or height when it mounts, for example when _display: none_ is used.                                        | true             | false |
<br>

### *Props:* Map tools


These props are all object props, meaning you pass them to the component using JSON format:

```python
leaflet_map_component = webviz_subsurface_components.LeafletMap(
        id="example-map",
        ...,
        drawTools={                     # Map tool
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "topright"
        },
        ...
)
```
Note that all of these tools have the `"position"` tool prop, which decides the tool's position in the map view.

<br>

#### scaleY
Adds a slider which can scale the Y axis of the map.

Example:
```python
scaleY={
    "scaleY": 1,                # Current slider value
    "minScaleY": 1,             # Min slider value
    "maxScaleY": 5,             # Max slider value
    "position": 'topleft',
}
```

<br>

#### drawTools
Adds tools for drawing, editing and removing various shapes.

Example:

```python
drawTools={
    "drawMarker": True,         # Toggles marker draw tool
    "drawPolygon": True,        # Toggles polygon draw tool
    "drawPolyline": True,       # Toggles polyline draw tool
    "position": "topright"
}
```

<br>

#### switch
Adds a switch toggle

Example:

```python
switch={
    "value": False,                 # Initial switch value
    "disabled": False,              # Toggles switch disable
    "label": "hillshading",         # Label text for the switch
    "position": "bottomleft"
}
```

<br>

#### mouseCoords
Adds a display for the live x, y, z coordinates of the mouse.

Example:

```python
mouseCoords={
    "position": "bottomright"
}
```

<br>

#### colorBar
Adds a display of the current color scale with min and max z values.

Example:

```python
colorBar={
    "position": "bottomleft"
}
```

<br>

#### unitScale
Adds a small unit scale to the map. It will read the unit field of the currently selected layer and can be set to either feet or metres (metres by default).

Example:

```python
unitScale={
    "position": "bottomright"
}
```

<br>

### *Props:* Map syncronization

These props specify the different aspects of syncronization between maps.

| Name             | Type        | Description                                                                                                                                                                                                                    | Example input          |
|------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **syncedMaps**   | *String[ ]* | An array of ids of maps you want to sync this map with in terms of zoom, movement and potentially drawings. Including the id of this map will not cause any errors. e.g `id="map-1",  syncedMaps=["map-1", "map-2"]`  is fine. | ["map-1",..., "map-n"] |
| **syncDrawings** | Boolean     | Should this map draw to the maps in *syncedMaps*? False by default.                                                                                                                                                            |                        |

<br>

----------------------

<br>

## 📚 Layers

Layers make the basis for the LeafletMap component. Changing the map means adding, updating or deleting a layer in some way.

This component is using leaflet.js, meaning we divide layers into two categories:
- **Base layers:**
    Only one base layer can be active on a map at any given time.
    We can chose between base layers on the map with radio buttons
    in the layer controller.
    <br/>

- **Overlay layers:**
    We can have any amount of overlay layers active at the same time.
    We can toggle overlay layers with check boxes in the layer controller.
<br/>

### Structure

The component takes in layers as a list of layer JSON objects on this format

```python
    {
        "id": 1,
        "name": "Test Image",
        "baseLayer": True,
        "checked": True,
        "data": [
            {
                "type": "image",
                "url": "LOCAL_IMAGE_FILE",
                "bounds": [[0, 0], [30, 30]],
            }
        ]
    }
```
<br/>

#### Layer fields

| Name          | Type        | Description                                                                                                            |
|---------------|-------------|------------------------------------------------------------------------------------------------------------------------|
| **id**        | *Number*    | id is required for referencing layers                          |
| **name**      | *String*    | What the layer will appear as in the layer control tool                                                                |
| **action**    | *String*    | Can be used to update/change layers during runtime. See the [Updating layers](#updating-layers) segment for more information         |
| **baseLayer** | *Boolean*   | Tells the component whether or not this is a base layer                                                                |
| **checked**   | *Boolean*   | Should this layer be present in the map by default? Keep in mind that only one base layer should have this set to true |
| **data**      | *Object[]* | A list containing the actual layer data (images, tiles, drawings etc) See the segment about [Layer types](#layer-types) for a more information on accepted layer types                |

<br/>

### Layer types
Currently the component supports three Layer types which can go inside the data list
- [Image layers](#image-layers)
- [Tile layers](#tile-layers)
- [Shapes and drawings](#shapes-and-drawings)

<br>

#### Image layers

```python
{
    "id": 123,                                  # REQUIRED
    "name": "Image layer",                      # REQUIRED
    "baseLayer": True,                          # Usually base layer
    "checked": True,

    "data": [
        { # Image layer data object
            "type": "image",                    # REQUIRED
            "url": "BASE64_IMAGE_URL",          # REQUIRED
            "shader": {                         # Shader specifications
                ...
            },
            "colorScale":  {                    # Color scale specifications
                ...
            },
            "minvalue": 0,                      # Min z-value
            "maxvalue": 1000,                   # Max z-value
            "bounds": [[0, 0], [100, 100]],     # REQUIRED, Bounds for the image
            "unit": "m"                         # Unit for the z-value (for display purposes)
        }
    ]
}
```

Image layers supports images on a base64 format, or a CORS supported url with the displayed specification props.
Please note that an image layer typically only has one layer data object. It is possible to have several image layer data objects in on layer, but you have to be careful to make sure the bounds of the images do not intersect.
Several images in the same layer will only show up as one layer in the layer control.

More information on:
- [Shader specifications](#hillshading)
- [Color scale specifications](#colorscales)

<br>

#### Tile layers

```python
{
    "id": 123,                          # REQUIRED
    "name": "Tile layer",               # REQUIRED
    "baseLayer": True,                  # Usually base layer
    "checked": True,

    "data": [
        { # Tile layer data object
            "type": "tile",             # REQUIRED
            "url": "TILE_URL",          # REQUIRED
            "shader": {                 # Shader specifications
                ...
            },
            "colorScale": {             # Color scale specifications
                ...
            }
            "minvalue": 0,              # Min z-value
            "maxvalue": 1000,           # Max z-value
            "unit": "m"                 # Unit for the z-value (for display purposes)
            "drawStrategy": None        # None or "full". See shaders section
        }
    ]
}

# Typical tile url: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Tile layers take in a url for a tile server. Please note that a tile layer should only have one layer data object.

More information on:
- [Shader specifications](#hillshading)
- [Color scale specifications](#colorscales)

<br>

#### Shapes and drawings
The component supports a variety of shapes and drawings. Namely:

- [Polyline](#polyline)
- [Polygon](#polygon)
- [Circle](#circle)
- [Marker](#marker)
- [CircleMarker](#circlemarker)

These can be drawn onto the map using the draw tools, or you can pass them as layers. It is common to put all the drawings you wish to see at the same time into one layer, so that you won't have to toggle every single drawing in the layer controls.

Shapes also have a `"tooltip"` prop which will display text on hover.
These shape objects (except for the circleMarker) will be emited on click with the [clicked_shape listener](#listeners). It is possible for the python user to add extra fields, such as `"name"` or `"shapeID"` (the names are up to you) e.g. in order to simplify editing a single shape in a layer.

```python
{
    "id": 123,
    "name": "Some drawings",
    "baseLayer": False,
    "checked": True,
    "data": [
        {
            "type": "circle",
            "center": [10, 10],
            "color": "red",
            "radius": 2,
            "tooltip": "This is a red circle"
        },
        {
            "type": "marker",
            "position": [5, 5],
            "tooltip": "This is a blue marker"
        }
    ]
}

```

##### Polyline

```python
{
    "type": "polyline",
    "positions": [                # Coordinates
        [0, 0],
        [1, 1],
        ...
    ]
    "color": "blue",
    "tooltip": "This is a blue polyline"
}
```

##### Polygon

```python
{
    "type": "polygon",
    "positions": [                # Coordinates
        [0, 0],
        [1, 1],
        ...
    ]
    "color": "red",
    "tooltip": "This is a red polyline"
}
```

##### Circle

```python
{
    "type": "circle",
    "center": [0, 0],
    "radius": 10,
    "color": "green",
    "tooltip": "This is a green circle"
}
```

##### Marker

```python
{
    "type": "marker",
    "position": [0, 0],
    "color": "green",
    "tooltip": "This is a green marker"
}
```

##### Circle marker

```python
{
    "type": "circleMarker",
    "center": [0, 0],
    "radius": 2,
    "color": "yellow",
    "tooltip": "This is a yellow circleMarker"
}
```
<br/>

### Updating layers

Updating layers is how we make changes to the map during runtime. There are two supported ways of doing this. One uses the _action_ field in the layer object to add, update or delete layers by id. The other one simply replaces all existing layers with whatever new _layers_ list you provide it with.

We will use the following layers as an example:
```python
[
    {
        "id": 1,
        "name": "Tile layer"
        "baseLayer": True,
        "checked": True,
        "data": [
            {
                "type": "tile",
                "url": "TILE_URL",
                "shader": {
                    "applyHillshading": True,
                }
            }
        ]
    },
    {
        "id": 123,
        "name": "Image layer",
        "baseLayer": True,
        "checked": False,
        "data": [
            {
                "type": "image",
                "url": "BASE64_IMAGE_URL",
                "shader": {
                    ...
                },
                "colorScale":  {
                    ...
                },
                "minvalue": 0,
                "maxvalue": 1000,
                "bounds": [[0, 0], [100, 100]],
                "unit": "m"
            }
        ]
    }
]
```
<br>

#### Updating layers with action

The default way of changing layers is with the _action_ field in the layer object.
The component stores all the layers you give it internally, so if you wish to change something, you simply write a callback which returns a list with the layer objects you wish to change to the _layers_ prop.

<br>

##### Add

To add a layer set `"action" : "add"` in the layer, and return a list with the new layer(s) you want to add to _layers_. Again, note that you do not need to pass it the current layers, as they will be stored in the component even if you change the _layers_ prop.

```python
# UPDATE WITH ACTION
@app.callback(
    Output('test-map', 'layers'),
    [Input('layer-add-btn', 'n_clicks')]
)
def add_layer(n_clicks):
    # Check if button has been pressed
    if n_clicks is not None:
        return [
            {
                "id": 3,                        # Required,
                "action": "add",                # Required
                "name": "New Tile Layer"
                "baseLayer": True,
                "checked": False,
                "data": [
                    {
                        "type": "tile",         # Required
                        "url": "SOME_TILE_URL",
                    }
                ]
            },
            {
                # You can pass as many new layers as you want
                ...
            }
        ]
    # If button has not been pressed
    return []

```

Please note that adding a layer requires a unique id. Nothing will happen when trying to add a layer with an id that already exists.

<br>

##### Update

To update existing layer(s) provide a layer object with the id and type of the layer(s) you want to change and the fields that are to be updated.

Please note that if you change a field which takes an object such as a shader, the component does not store the individual options/subfields of that object. This means that you have to provide all the options you want to have in the updated layer.

Note that it is possible to use `update` for a component with no initial layers. The initial behaviour will then be `replace` (see below), but will switch to `update` when layers are added.

Provided the Layers in the the previous example, this would be how we create a toggle button to update the color scale and hillshading of the tile layer with _action_.

```python
COLORSCALE = ['#032333', '#2a3393', '#754792', '#b15d81', '#ea7859', '#fbb33c', '#e7fa5a']


# UPDATE WITH ACTION
@app.callback(
    Output('test-map', 'layers'),
    [Input('layer-add-btn', 'n_clicks')]
)
def toggle_shader(n_clicks):
    # n_clicks tracks number of times the button has been clicked
    if n_clicks is not None:
        # Add hillshading and custom colors
        return [
            {
                "id": 1,            # Required,
                "action": "update", # Required
                "data": [
                    {
                        "type": "tile",  # Required
                        # Entire shader object
                        "shader": {
                            # Toggle
                            "applyHillshading": True if n_clicks%2 == 1 else False,
                        },
                        "colorScale": COLORSCALE if n_clicks%2 == 1 else None
                    }
                ]
            }
        ]
    return []

```

<br>

##### Delete

To delete a layer you only need to pass the id and `"action": "delete"`.

This will delete the layer we added in the add example:

```python
# DELETE WITH ACTION
@app.callback(
    Output('test-map', 'layers'),
    [Input('layer-add-btn', 'n_clicks')]
)
def delete_layer(n_clicks):
    # n_clicks tracks number of times the button has been clicked
    if n_clicks is not None:
        # Delete layer with id: 2
        return [
            {
                "id": 2,            # Required,
                "action": "delete", # Required
            }
        ]
    return []
```

<br>

#### Updating layers with replace

Changing layers with `"updateMode": "replace"`, simply removes all existing layers, and adds the ones you provide to the map. This is mainly recommended e.g. if you're going to look at a new set of data in the application during runtime.
It is also possible to use it for updating layer fields, but it requires ALL the layers and fields to be returned. A way of doing this could be to maintain a list in python which is updated whenever something changes and then sent as a prop to the component.

<br>

Here is an example of what updating the shader with replace enabled would look like. Please note that after this operation, this will be the only layer present on the map.

```python
@cg.callback(
            Output(map, 'layers'),
            [
                Input('shader-toggle-replace-btn', 'n_clicks'),
            ],
                State('selected-layer', 'value')

        )

        def toggle_shading_with_replace(n_clicks, layer_id):

            layers = [
                {
                    "id": 1,
                    "name": "Tile layer",
                    "baseLayer": True,
                    "checked": True,
                    "data": [
                        {
                            "type": "tile",
                            "url": "TILE_URL",
                            "shader": {
                                "applyHillshading": True if n_clicks%2 == 1 else False,
                            },
                        }
                    ]
                },
                {
                    # Other layers we want to keep
                },
                ...
            ]
            return layers
```

<br>

--------

<br>

### ❤ ColorScales

**Description**

Colorscale property is used to generate and apply a colormap to a desired layer.
It is capable of doing so by either generating a colormap from hexadecimal colors
provided by the user or by user providing the colormap directly (see examples below)

<br />

**Options**

| Name | Type  | Description  |
|-----------------|------------------|---------------|
| applyColorScale          | Boolean | Whether or not to apply the colorscale. 
| colors          | Array of strings | Used when generating a colormap based on hexadecimal values. Each of the hexadecimal color value should be represented  as a string within the array.                                                                                                        
| scaleType       | String           | Indicates the type of scale that should be used when generating the colormap. It is set to linear by default. Currently supported scale types:  	• "log" 	• "linear".                        |
| cutPointMin     | Integer          | Don't display points lower than this threshold.  |
| cutPointMax     | Integer          | Don't display points higher than this threshold. |
| remapPointMin     | Integer          | Remap the minimum data point to a different point on the colorscale.  |
| remapPointMax     | Integer          | Remap the maximum data point to a different point on the colorscale. |

<br />

**Example usage**

The colorscale may be used in one of the following ways:

 - Specifying the hexadecimal color array along with the desired options as an object


        "colorScale":  {
            "colors":["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
            "scaleType": "linear",
            "cutPointMin": 0,
            "cutPointMax": 1
        },

 - Defining the color array without defining an object

        "colorScale": ["#0d0887", "#46039f", "#7201a8", "#9c179e"],

 - Assigning a colormap to the colorscale directly as a string


        "colorScale": "URL_TO_COLORMAP_HERE",

<br>

-------

<br>


#### 🏔 Hillshading
Hillshading is a shader that generates elevation and sense of relief to images. It can be enabled the following way:
```javascript
{
    "shader": {
        "applyHillshading" : true,
    }
}
```


#### Hillshading options

| Name             | Type          | Description                                                                                                                                                                                                                                 | Default   |
|------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| elevationScale       | Number        | Multiplier applied to the elevation value when computing the hillshading | 1.0      |
| sunDirection          | Vector       | Direction the light is coming from.           | [1,1,1]     |
| ambientLightIntensity | Number        | Brightness added to all pixels. | 0.5      |
| diffuseLightIntensity | Number        | Brightness of surfaces hit by light.| 0.5      |



<br>

-------------------------------

<br>

## 🎙 Listeners

There are some listeners the Python user can access using callbacks, such as the coordinates of a mouse click or a drawing.

Example:

```python
app.layout = html.Div(
    children=[
        leaflet_map_component,
        html.Pre(id="polygon")
    ]
)

@app.callback(
     Output("polygon", "children"),
     [Input("example-map", "polygon_points")]
)
def get_polygon_coords(coords):
    return f"polygon coordinates: {json.dumps(coords)}"
```

<br>

| Name                | Output format             | Description                                       |
|---------------------|---------------------------|---------------------------------------------------|
| **click_position**  | `{[x, y]}`                  | Coordinates of the last clicked area of the map   |
| **marker_point**    | `{[x, y]}`                  | Coordinates of the last placed marker on the map  |
| **polyline_points** | `{[[x1, y1], ..., [xn, yn]]}` | Coordinates of the last drawn polyline on the map |
| **polygon_points**  | `{[[x1, y1], ..., [xn, yn]]}` | Coordinates of the last drawn polygon on the map  |
| **clicked_shape**  | [Shape object](#shapes-and-drawings) | JSON object containing the details of last shape clicked   |

<br>

--------------

<br>

## Serving tiles with dash

Dash is using an underlying flask server during runtime which can be accessed from the dash app. We can use this flask server to serve tiles.

Assuming you have pregenerated tiles ready to go on a disk, this example of a very simple tile server will work.

```python
import os.path
from flask import Flask, send_file

class tile_server():

    def __init__(self, flask_server):

        app = flask_app

        @app.route('/tiles/<zoom>/<y>/<x>')
        def tiles(zoom, x, y):
            default = r'_path_to_default_tile\tiles\0\{zoom}\{x}\{y}.png'
            filename = fr"_path_to_tiles\tiles\0\{zoom}\{x}\{y}.png"
            if os.path.isfile(filename):
                return send_file(filename)
            return send_file(default)
```

<br>

We would also need to instantiate it in our dash app and pass it the instance of the flask server

```python
from tile_server import tile_server

if __name__ == "__main__":

...

    app = dash.Dash(__name__)

    # initialize server for providing tiles at the same localhost as dash is running
    server = tile_server(app.server)

...

    app.run_server(debug=True)
```
