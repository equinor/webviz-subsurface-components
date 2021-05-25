/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import PropTypes from "prop-types";
import React from "react";
import GroupTree from "./components/GroupTree";

const DynamicTree = (props) => {
    return <GroupTree id={props.id} />;
};

DynamicTree.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object,
};

export default DynamicTree;
