import json
import pandas as pd
import dash
import dash_html_components as html
import webviz_subsurface_components


def compress2json(df):

    INDICES_COL = ['i', 'j', 'k']
    X_COL = ['x0', 'x1', 'x2', 'x3']
    Y_COL = ['y0', 'y1', 'y2', 'y3']
    FLOW_COL = ['FLOWI+', 'FLOWJ+']

    RESOLUTION = 1000

    df = df.copy()[INDICES_COL + X_COL + Y_COL + ['value'] + FLOW_COL]

    xmin = df[X_COL].values.min()
    xmax = df[X_COL].values.max()
    ymin = df[Y_COL].values.min()
    ymax = df[Y_COL].values.max()
    flowmin = df[FLOW_COL].values.min()
    flowmax = df[FLOW_COL].values.max()
    valmin = df['value'].min()
    valmax = df['value'].max()

    if (xmax - xmin) > (ymax - ymin):
        coord_scale = RESOLUTION/(xmax - xmin)
    else:
        coord_scale = RESOLUTION/(ymax - ymin)

    df[X_COL] = (df[X_COL] - xmin)*coord_scale
    df[Y_COL] = (df[Y_COL] - ymin)*coord_scale
    df[X_COL + Y_COL] = df[X_COL + Y_COL].astype(int)

    flow_scale = RESOLUTION/(flowmax - flowmin)
    df[FLOW_COL] = (df[FLOW_COL] - flowmin)*flow_scale
    df[FLOW_COL] = df[FLOW_COL].astype(int)

    val_scale = RESOLUTION/(valmax - valmin)
    df['value'] = (df['value'] - valmin)*val_scale
    df['value'] = df['value'].astype(int)

    df[INDICES_COL] = df[INDICES_COL].astype(int)

    data = {
            'values': df.values.tolist(),
            'linearscales': {
                'coord': [coord_scale, xmin, ymin],
                'value': [val_scale, valmin],
                'flow': [flow_scale, flowmin]
                            }
            }

    return json.dumps(data, separators=(',', ':'))


df = pd.read_csv('./reek.csv')

# f = open('../src/demo/data.json', 'w')
# f.write(compress2json(df))
# f.close()

app = dash.Dash(__name__)

app.layout = html.Div(children=[
    webviz_subsurface_components.Map(id='reek-map', data=compress2json(df))

    ])

if __name__ == '__main__':
    app.run_server(debug=True)
