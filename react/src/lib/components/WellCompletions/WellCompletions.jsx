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
/**
 * Typescript and PropTypes serve different purposes. Typescript validates types at compile time,
 * whereas PropTypes are checked at runtime.
 * PropTypes are useful when you test how the components interact with external data, for example
 * when you load JSON from an API.
 * This is the only place in this component that propTypes definition is really needed.
 */
WellCompletions.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object,
};

export default WellCompletions;
