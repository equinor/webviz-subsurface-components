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
export const FlowRates = {
    oilrate: "Oil Rate",
    waterrate: "Water Rate",
    gasrate: "Gas Rate",
};
export type FlowRate = keyof typeof FlowRates;

export interface UISettings {
    currentDateTime: string;
    currentIteration: string;
    currentFlowRate: FlowRate;
}
