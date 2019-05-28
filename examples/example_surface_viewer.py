import pandas as pd
import webviz_subsurface_components
import dash
import dash_html_components as html

app = dash.Dash(__name__)

app.layout = html.Div(children=[
    webviz_subsurface_components.Map(id='reek-map', data=pd.read_csv('./reek.csv').to_json())

    ])

if __name__ == '__main__':
    app.run_server(debug=True)
