export type DatedTree = {
    dates: [string];
    tree: Node;
};
export type Data = DatedTree[];

export interface Node {
    node_label: string;
    node_type: "Group" | "Well";
    //node_data
    edge_label: string;
    //edge_data
    children: Node[];
}

export interface EdgeOption {
    name: string;
    label: string;
}
export type EdgeOptions = EdgeOption[];

export interface UISettings {
    currentDateTime: string;
    currentFlowRate: string;
}
