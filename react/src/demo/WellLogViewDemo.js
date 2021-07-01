import React, { Component } from "react";
import WellLogView from "../lib/components/WellLogView";


const data = "";//require("./example-data/well-completions.json");

class WellLogViewDemo extends Component {
    render() {
        return <WellLogView id="well_log_view" data={data} />;
    }
}


export default WellLogViewDemo;
