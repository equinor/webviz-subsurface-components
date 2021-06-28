/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import HistoryMatching from "./utils/history_matching";

const parseData = (data) =>
    typeof data === "string" ? JSON.parse(data) : data;

class HistoryMatch extends Component {
    constructor(props) {
        super(props);
        this.elementId = `container-${props.id}`;
    }

    componentDidMount() {
        const { data } = this.props;
        const parsedData = parseData(data);
        const elementSelector = `#${this.elementId}`;
        const hm = new HistoryMatching();
        hm.init(elementSelector, parsedData);
    }

    render() {
        return <div id={this.elementId} />;
    }
}

HistoryMatch.defaultProps = {
    height: 800,
};

HistoryMatch.propTypes = {
    id: PropTypes.string.isRequired,
    height: PropTypes.number,
    data: PropTypes.object,
};

export default HistoryMatch;
