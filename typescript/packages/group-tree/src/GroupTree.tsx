/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import PropTypes from "prop-types";
import React from "react";
import type { GroupTreeProps } from "./components/GroupTreeComponent";
import GroupTreeComponent from "./components/GroupTreeComponent";

const GroupTree = (props: GroupTreeProps) => {
    return (
        <GroupTreeComponent
            id={props.id}
            data={props.data}
            edgeOptions={props.edgeOptions}
            nodeOptions={props.nodeOptions}
        />
    );
};

GroupTree.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,
    /**
     * Array of JSON objects describing group tree data.
     */
    data: PropTypes.arrayOf(PropTypes.object),

    edgeOptions: PropTypes.arrayOf(PropTypes.object),
    nodeOptions: PropTypes.arrayOf(PropTypes.object),
};

export type { GroupTreeProps };
export default GroupTree;
