//iteration: [datetime: node]
export interface Data {
    iterations: Record<string, { trees: Record<string, Node> }>;
}

export interface Node {
    name: string;
    children: Node[];
    pressure: number;
    oilrate: number;
    waterrate: number;
    gasrate: number;
    grupnet: number;
}

export type FlowRate = "oilrate" | "waterrate" | "gasrate";

export interface UISettings {
    currentDateTime: string;
    currentIteration: string;
    currentFlowRate: FlowRate;
}
