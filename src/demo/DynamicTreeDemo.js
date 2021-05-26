import React, { Component } from "react";
import DynamicTree from "../lib/components/DynamicTree";

const data = require("./example-data/dynamic-tree.json");
class DynamicTreeDemo extends Component {
    render() {
        return <DynamicTree id="dynamictree" data={data} />;
    }
}

export default DynamicTreeDemo;
