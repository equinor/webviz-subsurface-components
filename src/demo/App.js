/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";
import DeckGLMapDemo from "./DeckGLMapDemo";
import GroupTreeDemo from "./GroupTreeDemo";
// Components
import HistoryMatchDemo from "./HistoryMatchDemo";
import LayeredMapDemo from "./LayeredMapDemo";
import LeafletMapDemo from "./LeafletMapDemo";
import MorrisDemo from "./MorrisDemo";
import PriorPosteriorDistributionDemo from "./PriorPosteriorDistributionDemo";
import SubsurfaceMapDemo from "./SubsurfaceMapDemo";
import WellCompletionsDemo from "./WellCompletionsDemo";
import VectorSelectorDemo from "./VectorSelectorDemo";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "DeckGLMapDemo" };
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    renderDemo() {
        switch (this.state.value) {
            case "DeckGLMapDemo": {
                return <DeckGLMapDemo />;
            }
            case "GroupTree": {
                return <GroupTreeDemo />;
            }
            case "LeafletMap": {
                return <LeafletMapDemo />;
            }
            case "HistoryMatch": {
                return <HistoryMatchDemo />;
            }
            case "Morris": {
                return <MorrisDemo />;
            }
            case "SubsurfaceMap": {
                return <SubsurfaceMapDemo />;
            }
            case "LayeredMap": {
                return <LayeredMapDemo />;
            }
            case "PriorPosteriorDistribution": {
                return <PriorPosteriorDistributionDemo />;
            }
            case "WellCompletions": {
                return <WellCompletionsDemo />;
            }
            case "VectorSelector": {
                return <VectorSelectorDemo />;
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
                    <option value="DeckGLMapDemo">DeckGLMapDemo</option>
                    <option value="GroupTree">GroupTree</option>
                    <option value="LeafletMap">LeafletMap</option>
                    <option value="HistoryMatch">HistoryMatch</option>
                    <option value="Morris">Morris</option>
                    <option value="SubsurfaceMap">SubsurfaceMap</option>
                    <option value="LayeredMap">LayeredMap</option>
                    <option value="PriorPosteriorDistribution">
                        PriorPosteriorDistribution
                    </option>
                    <option value="WellCompletions">WellCompletions</option>
                    <option value="VectorSelector">VectorSelector</option>
                </select>
                {this.renderDemo()}
            </div>
        );
    }
}

export default App;
