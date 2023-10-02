import React from "react";
import PropTypes from "prop-types";

const GroupTreeComponent = React.lazy(() =>
    import(/* webpackChunkName: "webviz-group-tree" */ "@webviz/group-tree")
);

const GroupTree = (props) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <GroupTreeComponent {...props} />
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

    edge_options: PropTypes.arrayOf(PropTypes.object),
    node_options: PropTypes.arrayOf(PropTypes.object),
};

GroupTree.displayName = "GroupTree";

export default GroupTree;
