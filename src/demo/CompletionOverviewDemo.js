import React, { Component } from "react";
import CompletionOverview from "../lib/components/CompletionOverview";

const layers = [
    "Garn 4.2",
    "Garn 4.1",
    "Garn 3.3",
    "Garn 3.2",
    "Garn 3.1",
    "Garn 2.2",
    "Garn 2.1",
    "Not",
    "Ile 3.3",
    "Ile 3.2",
    "Ile 3.1",
    "Ile 2",
    "Ile 1",
    "Ror",
    "Tilje",
];

const data = {
    "2019-10-01": {
        "X-1H": {
            1: {
                state: "perforated",
                kvkh: 10,
            },
        },
        "X-2H": {
            2: {
                state: "perforated",
                kvkh: 20,
            },
        },
        "X-3H": {
            2: {
                state: "perforated",
                kvkh: 20,
            },
        },
    },
};

class CompletionOverviewDemo extends Component {
    render() {
        return <CompletionOverview layers={layers} data={data} />;
    }
}

export default CompletionOverviewDemo;
