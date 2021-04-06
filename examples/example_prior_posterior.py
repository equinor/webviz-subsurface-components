# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import random

import numpy as np
import dash
import dash_html_components as html

import webviz_subsurface_components as wsc


def generate_synthetic_data(means, sigmas, n_iter, n_real):
    """Create synthetic test data. In reality, this data will
    come from  an assisted history matching run.
    """

    data = {}

    data["iterations"] = [f"iteration-{i}" for i in range(n_iter)]
    data["labels"] = []
    data["values"] = []

    for iteration in range(n_iter):

        # Simulate that not all realizations are successfull usually.
        n_real = random.randint(int(0.95 * n_real), n_real)  # nosec - bandit B311
        samples = np.random.normal(means[iteration], sigmas[iteration], n_real)

        data["values"].append(list(samples))
        data["labels"].append([f"realization-{real}" for real, _ in enumerate(samples)])

    return data


if __name__ == "__main__":

    MEANS = [400, 700, 500, 600]
    SIGMAS = [300, 200, 100, 70]
    N_REAL = 1000
    N_ITER = 4

    app = dash.Dash(__name__)

    app.layout = html.Div(
        children=[
            wsc.PriorPosteriorDistribution(
                id="parameters",
                data=generate_synthetic_data(MEANS, SIGMAS, N_ITER, N_REAL),
            )
        ]
    )

    app.run_server(debug=True)
