import React, { Component } from "react";
import GroupTree from "../lib/components/GroupTree";

const data = require("./example-data/group-tree.json");
class GroupTreeDemo extends Component {
    render() {
        return <GroupTree id="grouptree" data={data} />;
    }
}

export default GroupTreeDemo;
