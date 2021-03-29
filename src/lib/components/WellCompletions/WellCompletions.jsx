/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import PropTypes from "prop-types";
import React from "react";
import WellCompletionComponent from "./components/WellCompletionComponent";

const WellCompletions = (props) => {
    return <WellCompletionComponent id={props.id} data={props.data} />;
};

WellCompletions.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object,
};

export default WellCompletions;
