/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import MorrisMethod from "./utils/morris";
import "./morris.css";

const parseData = (data) =>
    typeof data === "string" ? JSON.parse(data) : data;

class Morris extends Component {
    constructor(props) {
        super(props);
        this.elementId = `container-${props.id}`;
    }

    componentDidMount() {
        const { output, parameters, parameter, height } = this.props;
        if (output && parameters && parameter) {
            const parsedOutput = parseData(output);
            parsedOutput.time = parsedOutput.forEach((d) => {
                d.time = new Date(d.time);
            });
            const parsedParameters = parseData(parameters);
            const elementSelector = `#${this.elementId}`;
            const morris = new MorrisMethod(
                elementSelector,
                parsedOutput,
                parsedParameters,
                parameter,
                height
            );
            morris.draw();
        }
    }

    componentDidUpdate() {
        const { output, parameters, parameter, height } = this.props;
        if (output && parameters && parameter) {
            const parsedOutput = parseData(output);
            parsedOutput.time = parsedOutput.forEach((d) => {
                d.time = new Date(d.time);
            });
            const parsedParameters = parseData(parameters);
            const elementSelector = `#${this.elementId}`;
            const morris = new MorrisMethod(
                elementSelector,
                parsedOutput,
                parsedParameters,
                parameter,
                height
            );
            morris.draw();
        }
    }

    render() {
        return <div id={this.elementId} />;
    }
}

Morris.defaultProps = {
    height: 800,
};

Morris.propTypes = {
    id: PropTypes.string.isRequired,
    parameter: PropTypes.string,
    output: PropTypes.arrayOf(PropTypes.object),
    parameters: PropTypes.arrayOf(PropTypes.object),
    height: PropTypes.number,
};

export default Morris;
