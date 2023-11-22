export type NameLabelAndUnit = {
    name: string; // key?
    label: string; // Displayed name
    unit?: string; // Optional unit
};

export type EdgeInfo = NameLabelAndUnit;
export type NodeInfo = NameLabelAndUnit;

export interface Node {
    nodeType: "Group" | "Well";
    nodeLabel: string;
    edgeLabel: string;
    // nodeOption: NodeOption;
    // edgeOption: EdgeOption;
    children: Node[];
}

export interface DatedTree {
    dates: [string];
    tree: Node;
}

export type DatedTrees = DatedTree[];
