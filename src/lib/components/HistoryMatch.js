import React, { Component } from "react";
import PropTypes from "prop-types";
import HistoryMatching from "../private_components/hm-resources/history_matching";

const parseData = data => (typeof data === "string" ? JSON.parse(data) : data);

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
