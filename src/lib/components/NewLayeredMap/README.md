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


### 🌋 **Shaders**

### 🏴‍☠️Options 

| Name |  Type | Description |
|------|-------|-------------|
| Hello| What  | asdf        |