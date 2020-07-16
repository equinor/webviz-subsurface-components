# 🌍 LayeredMap Component
The new layered map component is a component for layered map data, like tile-data and webgl images. 

## 🌤 Features
* Image-layer support
* WebGL Image-layer support
* Tile-layer support
* WebGL Time-layer support
* Custom colorscales
    * Logarithmic option
    * Cutoff points options   
* Advanced hillshading
* Drawing of polylines, polygons, circles, and markers
* Movement synchronization between multiple instances

## 🌋 Usage
The component can be either used as an Dash-component or as a plain React component. This README will focus on Dash usages of the component.

### Getting started
Downloading the component
```
pip install -i https://test.pypi.org/simple/ webviz-subsurface-components
```

### Using the component

```python
import dash
import webviz-subsurface-components

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

new_layered_map = webviz_subsurface_components.NewLayeredMap(
    id='test-map',
    layers=layers,
)

app.layout = html.Div(
    children=[
        new_layered_map
    ]
)

app.run_server(debug=True)

```

### Updating the layers
To update the layers basically provide a new list of _layers_ into the component with the changes to apply by id.

```python
COLORSCALE = ['#032333', '#2a3393', '#754792', '#b15d81', '#ea7859', '#fbb33c', '#e7fa5a']

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

new_layered_map = webviz_subsurface_components.NewLayeredMap(
    id='test-map',
    layers=layers,
)

app.layout = html.Div(
    children=[
        new_layered_map,
        html.Button(id='layer-add-btn'),
    ]
)

@app.callback(
    Output('test-map', 'layers'),
    [Input('layer-add-btn', 'n_clicks')]
)
def toggle_shader(n_clicks):

    if n_clicks is not None:
        # Add hillshading and custom colors
        return [
            {
                "id": 1,            # Required,
                "action": "update", # Required
                "data": [
                    {
                        "type": "tile",  # Required
                        "shader": {
                            "type": 'hillshading' if n_clicks%2 == 1 else None, 
                            "shadows": True,
                            "elevationScale": 4.0,
                            "pixelScale": 200
                        },
                        "colorScale": COLORSCALE if n_clicks%2 == 1 else None 
                    }
                ]
            }
        ]
    return []

app.run_server(debug=True)
```

## 🔰 Documentations

### ❤ ColorScales

### 🌋 Shaders

### 🏴‍☠️Options 

-----------------
### 🎰 Props
The props available to the newLayeredMap component

#### *Props:* Map specifics
| Name              | Type                    | Description                                                                                                                                                                                                                    | Example input                                   | Default         |
|-------------------|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|-----------------|
| **id**            | *String* Required       | The ID for the map. Used to sync maps and to reference the component in Dash.                                                                                                                                                  | "example-map"                                   | None            |
| **layers**        | *objects[ ]*             | The array of layer objects to be added to the map.                                                                                                                                                                             | See more detailed description for  layer input. | []              |
| **center**        | *Coordinate* (number[ ]) | A coordinate as an array of numbers. Determines the starting center point for the map.                                                                                                                                         | [15,15]                                         | [0,0]           |
| **defaultBounds** | *Coordinates[ ]*         | Array of two coordinates to specify the initial bounds of the map                                                                                                                                                              | [\[50,50] [100,100]]                             | [\[0,0] [30,30]] |
| **zoom**          | *Number*                | Initial zoom level of the map                                                                                                                                                                                                  | 5                                               | 1               |
| **minZoom**       | *Number*                | The minimum zoom level allowed                                                                                                                                                                                                 | -10                                             | 1               |
| **maxZoom**       | *Number*                | The maximum zoom level allowed                                                                                                                                                                                                 | 10                                              | 15              |
| **crs**           | *String*                | String which sets the coordinate referencing system. The default is set to Simple, and will be the best option in most cases. Alternatively, one can set this as "earth" which will provide a crs commonly used for tile maps. | ""                                              | "Simple"        |

#### *Props:* Map tools


These props are all object props, meaning you pass them to the component on a JSON format:

```python

drawTools={
    #tool props
}

layered_map_component = webviz_subsurface_components.NewLayeredMap(
        id="example-map",
        ...,
        drawTools={
            "drawMarker": True,
            "drawPolygon": True,
            "drawPolyline": True,
            "position": "top-right"
        },
        ...
)
```
Note that all of these tools have the `"position"` tool prop, which decides the tool's position in the map view.

---------

##### scaleY
Adds a slider which can scale the Y axis of the map.

Example:
```python
scaleY={
        "scaleY": 1,
        "minScaleY": 1,
        "maxScaleY": 5,
        "position": 'top-left',
    }
```
| Name      | Type     | Description            |
|-----------|----------|------------------------|
| scaleY    | *Number* | Current slider value   |
| minScaleY | *Number* | Minimum slider value   |
| maxScaleY | *Number* | Maximum slider value   |

--------------

##### drawTools
Adds tools for drawing, editing and removing various shapes.

Example:

```python
drawTools={
        "drawMarker": True,
        "drawPolygon": True,
        "drawPolyline": True,
        "position": "top-right"
    }
```
| Name         | Type      | Description                     |
|--------------|-----------|---------------------------------|
| drawMarker   | *Boolean* | Turns on the marker draw tool   |
| drawPolygon  | *Boolean* | Turns on the polygon draw tool  |
| drawPolyline | *Boolean* | Turns on the polyline draw tool |

--------------
##### switch
Adds a switch toggle

Example:

```python
switch={
        "value": False,
        "disabled": False,
        "label": "hillshading",
        "position": "bottom-left"
    }
```

| Name     | Type      | Description                             |
|----------|-----------|-----------------------------------------|
| value    | *Boolean* | The initial value of the switch         |
| disabled | *Boolean* | If the switch should be disabled or not |
| label    | *String*  | The label for the switch                |

-------------------

##### mouseCoords
Adds a display for the live x, y, z coordinates of the mouse.

Example:

```python
mouseCoords={
        "position": "bottom-right"
    }
```

-----------------

##### colorBar
Adds a display of the current color scale with min and max z values.

Example:

```python
colorBar={
        "position": "bottom-right"
    }
```

--------------------

#### *Props:* Map syncronization

These props specify the different aspects of syncronization between maps.

| Name             | Type        | Description                                                                                                                                                                                                        | Example input          |
|------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **syncedMaps**   | *String[ ]* | An array of ids of maps you want to sync this map with in terms of zoom, movement and potentially drawings. Currently you have to be careful not to put the id of this map in the array as this will cause errors. | ["map-1", "map-2",...] |
| **syncDrawings** | *Boolean*   | Specifies whether or not this map should sync drawings between the maps in syncedMaps. This currently only works if all the maps you want to sync drawings between have this enabled.  False by default.           |                        |