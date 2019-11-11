/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";

import Map from "../lib/components/Map";

const data = require("./example-data/subsurface-map.json");

class SubsurfaceMapDemo extends Component {
    render() {
        return (
            <div>
                <Map id={"subsurface_map"} data={data} />
            </div>
        );
    }
}

export default SubsurfaceMapDemo;
