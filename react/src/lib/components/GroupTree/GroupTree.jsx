/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import PropTypes from "prop-types";
import React from "react";
import GroupTreeComponent from "./components/GroupTreeComponent";

const GroupTree = (props) => {
    return <GroupTreeComponent id={props.id} data={props.data} />;
};

GroupTree.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default GroupTree;
