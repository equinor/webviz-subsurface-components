/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";

// Components
import DynamicTreeDemo from "./DynamicTreeDemo";
import HistoryMatchDemo from "./HistoryMatchDemo";
import LayeredMapDemo from "./LayeredMapDemo";
import LeafletMapDemo from "./LeafletMapDemo";
import MorrisDemo from "./MorrisDemo";
import PriorPosteriorDistributionDemo from "./PriorPosteriorDistributionDemo";
import SubsurfaceMapDemo from "./SubsurfaceMapDemo";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "DynamicTree" };
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    renderDemo() {
        switch (this.state.value) {
            case "DynamicTree": {
                return <DynamicTreeDemo />;
            }
            case "LayeredMap": {
                return <LayeredMapDemo />;
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
            case "PriorPosteriorDistribution": {
                return <PriorPosteriorDistributionDemo />;
            }
            case "SubsurfaceMap": {
                return <SubsurfaceMapDemo />;
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
                    <option value="LeafletMap">LeafletMap</option>
                    <option value="HistoryMatch">HistoryMatch</option>
                    <option value="Morris">Morris</option>
                    <option value="SubsurfaceMap">SubsurfaceMap</option>
                    <option value="LayeredMap">LayeredMap</option>
                    <option value="PriorPosteriorDistribution">
                        PriorPosteriorDistribution
                    </option>
                </select>
                {this.renderDemo()}
            </div>
        );
    }
}

export default App;
