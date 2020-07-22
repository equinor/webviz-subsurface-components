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

#### Unofficial version
```
pip install -i https://test.pypi.org/simple/ webviz-beta==0.0.7
```

### Using the component

```python
import dash
import webviz_beta

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

new_layered_map = webviz_beta.NewLayeredMap(
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
## 📚 Layers

Layers make the basis for the layered map component. Changing the map means adding, updating or deleting a layer in some way.

This component is using leaflet.js, meaning we have two main types of layers:
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

#### Layers

| Name          | Type        | Description                                                                                                            |
|---------------|-------------|------------------------------------------------------------------------------------------------------------------------|
| **id**        | *Number*    | id is required for referencing layers                          |
| **name**      | *String*    | What the layer will appear as in the layer control tool                                                                |
| **action**    | *String*    | Can be used to update/change layers during runtime. See the *Updating the layers* segment for more information         |
| **baseLayer** | *Boolean*   | Tells the component whether or not this is a base layer                                                                |
| **checked**   | *Boolean*   | Should this layer be present in the map by default? Keep in mind that only one base layer should have this set to true |
| **data**      | *Object[]* | A list containing the actual layer data (images, tiles, drawings etc)                                                  |

<br/>

#### Layers: data


<br/>

### Updating the layers

There are two supported ways of doing this. One uses the _action_ field in the layer object to add, update or delete a single layer by id. The other one simply replaces all existing layers with whatever new _layers_ list you provide it with.

#### Updating layers with action

To update the layers basically provide a new list of _layers_ into the component with the changes to apply by id and specify what you want to do (add/update/delete) with the action field. The default behaviour of the component is to add if nothing else is specified. Please note that adding a layer requires a unique id. Nothing will happen when trying to add a layer with an id that already exists.

Provided the dash app from the previous example, this would be how we create a toggle button to update the color scale and hillshading it with _action_.
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

```

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
            "position": "topright"
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
        "position": 'topleft',
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
        "position": "topright"
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
        "position": "bottomleft"
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
        "position": "bottomright"
    }
```

-----------------

##### colorBar
Adds a display of the current color scale with min and max z values.

Example:

```python
colorBar={
        "position": "bottomright"
    }
```

--------------------

#### *Props:* Map syncronization

These props specify the different aspects of syncronization between maps.

| Name             | Type        | Description                                                                                                                                                                                                                    | Example input          |
|------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **syncedMaps**   | *String[ ]* | An array of ids of maps you want to sync this map with in terms of zoom, movement and potentially drawings. Including the id of this map will not cause any errors. e.g `id="map-1",  syncedMaps=["map-1", "map-2"]`  is fine. | ["map-1",..., "map-n"] |
| **syncDrawings** | Boolean     | Should this map draw to the maps in *syncedMaps*? False by default.                                                                                                                                                            |                        |

----------------------

### ❤ **ColorScales**

**Description**

Colorscale property is used to generate and apply a colormap to a desired layer.
It is capable of doing so by either generating a colormap from hexadecimal colors
provided by the user or by user providing the colormap directly (see examples below)

<br /> 

**Options**

| Name | Type  | Description  |
|-----------------|------------------|---------------|
| colors          | Array of strings | Used when generating a colormap based on hexadecimal values. Each of the hexadecimal color value should be represented  as a string within the array.                                            |
| prefixAlphaZero | Boolean          | Indicates whether the first color of the colormap should be set to transparent.                                                                                                                  |
| scaleType       | String           | Indicates the type of scale that should be used when generating the colormap. It is set to linear by default. Currently supported scale types:  	• "log" 	• "linear".                        |
| cutPointMin     | Integer          | Indicates the minimum height value represented in the map. Any value below it is set to transparent. If a value is lower than the minimum global value, it is set to the global minimum.  |
| cutPointMax     | Integer          | Indicates the maximum height value represented in the map. Any value below it is set to transparent. If a value is higher than the maximum global value, it is set to the global maximum. |

<br /> 

**Example usage**

The colorscale may be used in one of the following ways:

 - Specifying the hexadecimal color array along with the desired options as an      object


        "colorScale":  {
            "colors":["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
            "prefixZeroAlpha": false,
            "scaleType": "linear",
            "cutPointMin": 3000,
            "cutPointMax": 3513
        },

 - Assigning a colormap to the colorscale directly as a string
    

        "colorscale: "data:image/png;base64,    iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAAuElEQVR4nI2NyxUDIQwDR6K0lJD+W1nnABgvIZ8DT7JGNnroieRAQjJYMFQ2SDBUk0mrl16odGce05de9Z2zzStLLhEuvurIZzeZOedizd7mT70f7JOe7v7XA/jBBaH4ztn3462z37l1c7/ys1f6QFNZuUZ+1+JZ3oVN79FxctLvLB/XIQuslbe3+eSv7LVyd/KmC9O13Vjf63zt7r3kW7dR/iVuvv/H8NBE1/SiIayhiCZjhDFN5gX8UYgJzVykqAAAAABJRU5ErkJggg==",


### 🌋 Shaders
Currently the component only supports two types of shaders:
* _soft-hillshading_
* _hillshading_

Shaders only works for only two layer types - _image_- and _tile_-layers. You can specifiy that you want shading with the following way inside your layer data:
```javascript
{
    ...
    "type": 'image',
    "shader": {
        "type": SHADER_TYPE|null
        // Other shader spesific configuration goes here
    },
    ...
}
```

#### 🏔 Hillshading
Hillshading is a shader that generates elevation and senes of relief to images. It can be generated to the following way:
```javascript
{
    "shader": {
        "type": "hillshading",
        "shadows": true|false, // For enabling shadows
    }
}
```
This kind of hillshading might be expensive for huge images, especially with shadows. Shadows are the most expensive computation of the hillshading, so if it is not needed, make sure it is not enabled. However, the usages of the shadows can be optimized a bit, as the shadows are generated in _N_ iterations, where _N_ is automatically adjusted based on image size. With small images like 256x256, _N_ is set to 128, which shows really great shadows, but if you do the same for a 1000x1000 images, your browser might not handle it at all, and is therefore automatically set to _N_ = 8 for the biggest images. The result are not as great as before, but it is decent. On the other hand, it is possible force _N_ to be something else, which can be set with the _shadowIterations_-field:
```javascript
{
    "shader": {
        "type": "hillshading",
        "shadowIterations": 128 // <--- Expensive for huge images
    }
}
```

Here is a brief visualization of the hillshader with different kind of shadow-configuration.
![ShadowComparison](https://user-images.githubusercontent.com/31648998/87668347-394d8b00-c76c-11ea-94d0-b221a168930c.png)

##### Hillshading options
| Name             | Type          | Description                                                                                                                                                                                                                                 | Default   |
|------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| pixelScale       | Number        | A indication on what is the scale of the pixels. A higher number will decrease the intensitiy of the shadows                                                                                                                                | 8000      |
| elevationScale   | Number        | ElevationScale is a variable for scaling the generated elevation of the image. The greater the scale, the higher the "_mountains_". If you have _shadows_ enabled, but see no shadows, maybe your elevation is too low.                     | 1.0       |
| shadows          | Boolean       | If shadows should be applied to the provided image or not. Note that shadows is quite heavy computational, especially for big images. Try to decrease the _shadowsIterations_ field if you have troubles rendering with shadows.            | false     |
| shadowIterations | Number        | The number of iterations the shadows should be applied on. The higher number of iterations the greater the result, but also more heavy the generation gets. Your browser might not support too high iteration-number, especially on Chrome. | null      |
| sunDirection     | Array<Number> | A vector of length 3 indicating the direction from the surface to the sun. Should be a normalized vector with values between 0 and 1.                                                                                                       | [1, 1, 1] |


#### Soft hillshading
If the normal hillshading-shader is too heavy computational, there is also a soft hillshader which is less computational, but provide less elevation-details compared to the other hillshader. Can be enabled with the following configuration:
```javascript
{
    ...
    "shader": {
        "type": "soft-hillshading",
        "elevationScale": 0.03, // Optional
    },
    ...
}
```

##### Soft hillshading options
| Name           | Type          | Description                                                                                                       | Default   |
|----------------|---------------|-------------------------------------------------------------------------------------------------------------------|-----------|
| elevationScale | Number        | A variable for scaling the generated elevation of the image. The greater the scale, the higher the "_mountains_". | 0.03      |
| lightDirection | Array<Number> | A vector of length 3 indicating the direction from the surface to the sun.                                        | [1, 1, 1] |


### 🏴‍☠️Options 

-----------------


-------------------------------

### 🎙 Listeners

There are some listeners the python user can access using callbacks, such as the coordinates of a mouse click or a drawing.

Example:

```python
app.layout = html.Div(
    children=[
        layered_map_component,
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

| Name                | Output format             | Description                                       |
|---------------------|---------------------------|---------------------------------------------------|
| **click_position**  | `{[x, y]}`                  | Coordinates of the last clicked area of the map   |
| **marker_point**    | `{[x, y]}`                  | Coordinates of the last placed marker on the map  |
| **polyline_points** | `{[[x1, y1], ..., [xn, yn]]}` | Coordinates of the last drawn polyline on the map |
| **polygon_points**  | `{[[x1, y1], ..., [xn, yn]]}` | Coordinates of the last drawn polygon on the map  |
