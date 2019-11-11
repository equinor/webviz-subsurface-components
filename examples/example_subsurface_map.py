import json
import dash
import dash_html_components as html
import webviz_subsurface_components


with open("../src/demo/example-data/subsurface-map.json", "r") as json_file:
    data = json.load(json_file)

app = dash.Dash(__name__)

app.layout = html.Div(
    children=[webviz_subsurface_components.Map(id="reek-map", data=data)]
)

if __name__ == "__main__":
    app.run_server(debug=True)
