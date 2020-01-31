/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";
import HistoryMatchDemo from "./HistoryMatchDemo";
import MorrisDemo from "./MorrisDemo";
import SubsurfaceMapDemo from "./SubsurfaceMapDemo";
import LayeredMapDemo from "./LayeredMapDemo";
import PriorPosteriorDistributionDemo from "./PriorPosteriorDistributionDemo";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "PriorPosteriorDistribution" };
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
            case "LayeredMap": {
                return <LayeredMapDemo />;
            }
            case "PriorPosteriorDistribution": {
                return <PriorPosteriorDistributionDemo />;
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
