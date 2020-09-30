/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";

import DynamicTree from "../lib/components/DynamicTree";


class DynamicTreeDemo extends Component {
    render() {
        return (
            <div>
                <DynamicTree id={"dynamictree"} />
            </div>
        );
    }
}

export default DynamicTreeDemo;
