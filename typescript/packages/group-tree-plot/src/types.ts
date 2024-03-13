import PropTypes from "prop-types";

// Node key and values map - one value per date in DatedTree
export interface NodeData {
    [key: string]: number[];
}
// Node key and metadata
export interface NodeMetadata {
    key: string;
    label: string;
    unit?: string;
}

// Edge key and values map - value per date in DatedTree
export interface EdgeData {
    [key: string]: number[];
}
// Edge key and metadata
export interface EdgeMetadata {
    key: string;
    label: string;
    unit?: string;
}

// Recursively defined tree node
// The snake_case naming is to match the python naming
export interface RecursiveTreeNode {
    node_type: "Group" | "Well";
    node_label: string;
    edge_label: string;
    node_data: NodeData;
    edge_data: EdgeData;
    children?: RecursiveTreeNode[];
}

// Collection of trees with a dates
export interface DatedTree {
    dates: string[];
    tree: RecursiveTreeNode;
}

// ---------------------------  PropTypes ---------------------------------------

export const NodeDataPropTypes = PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
);
export const NodeMetadataPropTypes = PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    unit: PropTypes.string,
});

export const EdgeDataPropTypes = PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
);
export const EdgeMetadataPropTypes = PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    unit: PropTypes.string,
});

// Note: This is a solution for recursive definition for RecursiveTreeNode, as children is an optional array of RecursiveTreeNode.
// - Object.assign() resolves the issue of children being optional.
// - PropTypes.arrayOf(PropTypes.shape(RecursiveTreeNode).isRequired) resolves the issue of children being recursive.
const RecursiveTreeNodeShape: React.WeakValidationMap<RecursiveTreeNode> = {
    node_label: PropTypes.string.isRequired,
    edge_label: PropTypes.string.isRequired,
    node_data: NodeDataPropTypes.isRequired,
    edge_data: EdgeDataPropTypes.isRequired,
};
Object.assign(RecursiveTreeNodeShape, {
    node_type: PropTypes.oneOf(["Group", "Well"]).isRequired,
    children: PropTypes.arrayOf(
        PropTypes.shape(RecursiveTreeNodeShape).isRequired
    ),
});
export const RecursiveTreeNodePropTypes = PropTypes.shape(
    RecursiveTreeNodeShape
).isRequired;

// Collection of trees with dates
export const DatedTreePropTypes = PropTypes.shape({
    dates: PropTypes.arrayOf(PropTypes.string).isRequired,
    tree: RecursiveTreeNodePropTypes,
});
