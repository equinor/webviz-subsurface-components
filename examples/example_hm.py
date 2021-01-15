# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

from collections import OrderedDict

import numpy as np
import pandas as pd
from scipy.stats import chi2
import dash
import dash_html_components as html

import webviz_subsurface_components


def generate_synthetic_data(num_groups, num_iter, num_realizations):
    """Create synthetic test data. In reality, this data will
    come from  an assisted history matching run.
    """

    obs_group_names = [f"Obs. group {i}" for i in range(num_groups)]
    number_dp = np.random.randint(low=10, high=100, size=num_groups)

    df = pd.DataFrame()

    for i in range(num_iter):
        ensemble_name = f"Iteration {i}"

        # Random test data following
        # chisquared distribution (i.e. normal distribution squared):
        misfits = np.random.chisquare(df=1, size=num_groups)
        misfits *= number_dp

        split = np.random.rand(num_groups)

        pos = misfits * split
        neg = misfits * (1 - split)

        for j in range(num_realizations):
            realization_name = f"Realization {j}"

            scale = 1.0 + np.random.rand() * 0.4
            realization_pos = scale * pos
            realization_neg = scale * neg

            df = df.append(
                pd.DataFrame(
                    OrderedDict(
                        [
                            ("obs_group_name", obs_group_names),
                            ("ensemble_name", ensemble_name),
                            ("realization", realization_name),
                            ("total_pos", realization_pos),
                            ("total_neg", realization_neg),
                            ("number_data_points", number_dp),
                        ]
                    )
                )
            )

    return df.set_index(["obs_group_name", "ensemble_name", "realization"])


def _get_unsorted_edges():
    """P10 - P90 unsorted edge coordinates"""

    retval = {"low": chi2.ppf(0.1, 1), "high": chi2.ppf(0.9, 1)}

    return retval


def _get_sorted_edges(number_observation_groups):
    """P10 - P90 sorted edge coordinates"""

    monte_carlo_iterations = 100000

    sorted_values = np.empty((number_observation_groups, monte_carlo_iterations))

    for i in range(monte_carlo_iterations):
        sorted_values[:, i] = np.sort(
            np.random.chisquare(df=1, size=number_observation_groups)
        )

    sorted_values = np.flip(sorted_values, 0)

    P10 = np.percentile(sorted_values, 90, axis=1)
    P90 = np.percentile(sorted_values, 10, axis=1)

    # Dictionary with two arrays (P10, P90). Each array of length equal
    # to number of observation groups i.e. number of items along y axis.
    # These values are to be used for drawing the stair stepped
    # sorted P10-P90 area:

    coordinates = {"low": list(P10), "high": list(P90)}

    return coordinates


class HistoryMatch:
    def __init__(self, data):
        super(HistoryMatch, self).__init__()

        self.data = self._prepareData(data)

    def get_data(self):
        return self.data

    def _prepareData(self, data):
        data = data.copy().reset_index()

        ensemble_labels = data.ensemble_name.unique().tolist()
        num_obs_groups = len(data.obs_group_name.unique())

        data["avg_pos"] = data["total_pos"] / data["number_data_points"]
        data["avg_neg"] = data["total_neg"] / data["number_data_points"]

        iterations = []
        for ensemble in ensemble_labels:
            df = data[data.ensemble_name == ensemble]
            iterations.append(df.groupby("obs_group_name").mean())

        sorted_iterations = self._sortIterations(iterations)

        iterations_dict = self._iterations_to_dict(sorted_iterations, ensemble_labels)

        confidence_sorted = _get_sorted_edges(num_obs_groups)
        confidence_unsorted = _get_unsorted_edges()

        data = {}
        data["iterations"] = iterations_dict
        data["confidence_interval_sorted"] = confidence_sorted
        data["confidence_interval_unsorted"] = confidence_unsorted

        return data

    def _sortIterations(self, iterations):
        sorted_data = []

        for df in iterations:
            sorted_df = df.copy()

            sorted_data.append(
                sorted_df.assign(f=sorted_df["avg_pos"] + sorted_df["avg_neg"])
                .sort_values("f", ascending=False)
                .drop("f", axis=1)
            )

        return sorted_data

    def _iterations_to_dict(self, iterations, labels):
        retval = []

        for iteration, label in zip(iterations, labels):
            retval.append(
                {
                    "name": label,
                    "positive": iteration["avg_pos"].tolist(),
                    "negative": iteration["avg_neg"].tolist(),
                    "labels": iteration.index.tolist(),
                }
            )

        return retval


data = generate_synthetic_data(num_groups=50, num_iter=4, num_realizations=100)

app = dash.Dash(__name__)

app.layout = html.Div(
    children=[
        webviz_subsurface_components.HistoryMatch(
            id="parameters", data=HistoryMatch(data).get_data()
        )
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
