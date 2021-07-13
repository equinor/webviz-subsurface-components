export type DatedTree = {
    dates: [string];
    tree: Node;
};
export type Data = DatedTree[];
export interface Node {
    name: string;
    pressure: number[];
    oilrate: number[];
    waterrate: number[];
    gasrate: number[];
    grupnet: number;
    children: Node[];
}

export const FlowRates = {
    oilrate: "Oil Rate",
    waterrate: "Water Rate",
    gasrate: "Gas Rate",
};
export type FlowRate = keyof typeof FlowRates;

export interface UISettings {
    currentDateTime: string;
    currentFlowRate: FlowRate;
}
