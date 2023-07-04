/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";
// Components
import HistoryMatchDemo from "./HistoryMatchDemo";
import MorrisDemo from "./MorrisDemo";
import PriorPosteriorDistributionDemo from "./PriorPosteriorDistributionDemo";
import SubsurfaceMapDemo from "./SubsurfaceMapDemo";
import VectorSelectorDemo from "./VectorSelectorDemo";
import VectorCalculatorDemo from "./VectorCalculatorDemo";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "HistoryMatch" };
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    renderDemo() {
        switch (this.state.value) {
            case "HistoryMatch": {
                return <HistoryMatchDemo />;
            }
            case "Morris": {
                return <MorrisDemo />;
            }
            case "SubsurfaceMap": {
                return <SubsurfaceMapDemo />;
            }
            case "PriorPosteriorDistribution": {
                return <PriorPosteriorDistributionDemo />;
            }
            case "VectorSelector": {
                return <VectorSelectorDemo />;
            }
            case "VectorCalculator": {
                return <VectorCalculatorDemo />;
            }
            default: {
                return null;
            }
        }
    }

    render() {
        return (
            <div>
                <select
                    value={this.state.value}
                    onChange={this.onChange.bind(this)}
                >
                    <option value="HistoryMatch">HistoryMatch</option>
                    <option value="Morris">Morris</option>
                    <option value="SubsurfaceMap">SubsurfaceMap</option>
                    <option value="PriorPosteriorDistribution">
                        PriorPosteriorDistribution
                    </option>
                    <option value="VectorSelector">VectorSelector</option>
                    <option value="VectorCalculator">VectorCalculator</option>
                </select>
                {this.renderDemo()}
            </div>
        );
    }
}

export default App;
