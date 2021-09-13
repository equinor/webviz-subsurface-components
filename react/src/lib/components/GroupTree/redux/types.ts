export type DatedTree = {
    dates: [string];
    tree: Node;
};
export type Data = DatedTree[];
export interface Node {
    name: string;
    is_well: boolean;
    pressure: number[];
    pressure_h: number[];
    bhp: number[];
    bhp_h: number[];
    ctrlmode: number[];

    edge_info: string;

    oilrate: number[];
    waterrate: number[];
    gasrate: number[];
    waterinjrate: number[];
    gasinjrate: number[];

    oilrate_h: number[];
    waterrate_h: number[];
    gasrate_h: number[];
    waterinjrate_h: number[];
    gasinjrate_h: number[];

    children: Node[];
}

export interface EdgeOption {
    name: string;
    label: string;
}
export type EdgeOptions = EdgeOption[];

// XXX Note may be removed later
export const FlowRates = {
    oilrate: "Oil Rate",
    waterrate: "Water Rate",
    gasrate: "Gas Rate",
    waterinjrate: "Water Injection Rate",
    gasinjrate: "Gas Injection Rate",
};
export type FlowRate = keyof typeof FlowRates;

// XXX Note may be removed later
export const DataTypes = {
    simulated: "Simulated",
    historical: "Historical",
};
export type DataType = keyof typeof DataTypes;

export interface UISettings {
    currentDateTime: string;
    currentFlowRate: string;
    currentDataType: DataType; // XXX remove?
}
