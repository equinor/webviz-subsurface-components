/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import React from "react";
import PropTypes from "prop-types";

import type { GroupTreeProps } from "./components/GroupTreeComponent";
import GroupTreeComponent from "./components/GroupTreeComponent";

const GroupTree = (props: GroupTreeProps) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <GroupTreeComponent
                id={props.id}
                data={props.data}
                edgeMetadataList={props.edgeMetadataList}
                nodeMetadataList={props.nodeMetadataList}
            />
        </React.Suspense>
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

    /**
     * Arrays of metadata. Used in drop down selectors and tree visualization.
     */
    edgeMetadataList: PropTypes.arrayOf(PropTypes.object),
    nodeMetadataList: PropTypes.arrayOf(PropTypes.object),
};

GroupTree.displayName = "GroupTree";

export type { GroupTreeProps };
export default GroupTree;
