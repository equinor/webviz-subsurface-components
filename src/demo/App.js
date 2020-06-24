/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";

// Components
import HistoryMatchDemo from "./HistoryMatchDemo";
import MorrisDemo from "./MorrisDemo";
import SubsurfaceMapDemo from "./SubsurfaceMapDemo";
import LayeredMapDemo from "./LayeredMapDemo";
import PriorPosteriorDistributionDemo from "./PriorPosteriorDistributionDemo";
import NewLayeredMapDemo from "./NewLayeredMapDemo";
import REGLTesting from "./REGLTesting";
import LayeredMapTest from "./LayerMapTest";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "NewLayeredMap" };
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    renderDemo() {
        switch (this.state.value) {
            case "NewLayeredMap": {
                return <NewLayeredMapDemo />
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
            // case "REGLTesting": {
            //     return <REGLTesting />;
            // }
            case "LayeredMapTest": {
                return <LayeredMapTest />;
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
                    <option value="NewLayeredMap">NewLayeredMap</option>
                    <option value="HistoryMatch">HistoryMatch</option>
                    <option value="Morris">Morris</option>
                    <option value="SubsurfaceMap">SubsurfaceMap</option>
                    <option value="LayeredMap">LayeredMap</option>
                    <option value="PriorPosteriorDistribution">
                        PriorPosteriorDistribution
                    </option>
                    <option value="REGLTesting">REGLTesting</option>
                    <option value="LayeredMapTest">LayeredMapTest</option>

                </select>
                {this.renderDemo()}
            </div>
        );
    }
}

export default App;
