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

// List of dated trees
export type DatedTrees = DatedTree[];
