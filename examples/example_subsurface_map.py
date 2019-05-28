import pandas as pd
import webviz_subsurface_components
import dash
import dash_html_components as html

app = dash.Dash(__name__)

df = pd.read_csv('./reek.csv')

print(df.columns.values)
print(df[:2].to_json())
print(f'{{"values": {df[:2].to_json(orient="values")}, "columns": {list(df.columns.values)}}}')

f = open('../src/demo/data.json', 'w')
f.write(f'{{"values": {df.to_json(orient="values")}, "columns": {list(df.columns.values)}}}'.replace("'", '"'))
f.close()

app.layout = html.Div(children=[
    webviz_subsurface_components.Map(id='reek-map', data=pd.read_csv('./reek.csv').to_json())

    ])

#if __name__ == '__main__':
#    app.run_server(debug=True)
