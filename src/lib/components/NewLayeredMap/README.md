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
                "colorScale": ['#032333', '#2a3393', '#754792', '#b15d81', '#ea7859', '#fbb33c', '#e7fa5a']
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

@app.callback(
    Output('example-map', 'layers'),
    [Input('layer-add-btn', 'n_clicks')]
)
def toggle_shader(n_clicks):

    if n_clicks is not None:
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
                        }
                    }
                ]
            }
        ]
    return []

app.run_server(debug=True)
```