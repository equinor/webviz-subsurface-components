from pathlib import Path

import dash
import flask

from examples.well_correlation_data.well_log_testdata import (
    axis_mnemos,
    axisTitles,
    color_tables,
    lithology_info_table,
    patterns,
    patternsTable,
    spacers,
    templates,
    wellDistances,
    welllogs_two_wells,
    wellpickFlatting,
    wellpicks,
)
from webviz_subsurface_components import SyncLogViewer

slv = SyncLogViewer(
    id="WellCorrelation-viewer",
    welllogs=welllogs_two_wells,
    wellpicks=wellpicks,
    patterns=patterns,
    spacers=spacers,
    wellDistances=wellDistances,
    templates=templates,
    wellpickFlatting=wellpickFlatting,
    colorTables=color_tables,
    patternsTable=patternsTable,  # {'patternSize': 24, 'patterns': [], 'names': []},
    axisTitles=axisTitles,
    axisMnemos=axis_mnemos,
    syncContentDomain=False,
    syncContentSelection=True,
    syncTrackPos=True,
    syncTemplate=True,
    horizontal=False,
    viewTitles=True,
    welllogOptions={"wellpickColorFill": False, "wellpickPatternFill": False},
    lithologyInfoTable=lithology_info_table,
    # spacerOptions={
    #   "wellpickColorFill": True,
    #   "wellpickPatternFill": True
    # }
)

static_image_route = "/static/"

app = dash.Dash(__name__)
app.layout = dash.html.Div(
    id="app-id",
    style={
        "height": "100%",
        "width": "80%",
        "position": "absolute",
    },
    children=[
        slv,
    ],
)


@app.server.route("/static/<image_path>.gif")
def serve_image(image_path):
    image_name = "{}.gif".format(image_path)
    # Images are located in react/src/demo/example-data/pattern
    return flask.send_from_directory(
        Path(__file__).parent.parent.parent / "react/src/demo/example-data/patterns",
        image_name,
    )


if __name__ == "__main__":
    app.run_server(
        host="localhost",
        port=8000,
        debug=True,
    )
