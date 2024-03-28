import React from "react";
import PropTypes from "prop-types";

import {
    DatedTreePropTypes,
    EdgeMetadataPropTypes,
    NodeMetadataPropTypes,
} from "@webviz/group-tree-plot";

const GroupTreeComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-group-tree" */ "./components/GroupTreeComponent"
    )
);

export const GroupTree = (props) => {
    const { edge_metadata_list, node_metadata_list, ...rest } = props;
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <GroupTreeComponent
                edgeMetadataList={edge_metadata_list}
                nodeMetadataList={node_metadata_list}
                {...rest}
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
    data: PropTypes.arrayOf(DatedTreePropTypes),

    /**
     * Arrays of metadata. Used in drop down selectors and tree visualization.
     */
    edge_metadata_list: EdgeMetadataPropTypes,
    node_metadata_list: NodeMetadataPropTypes,
};

GroupTree.displayName = "GroupTree";
