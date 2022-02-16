export type WellLogHeader = {
    name: string;
    well: string;
    operator: string;
    serviceCompany: string;
    source: string;
    startIndex: number;
    endIndex: number;
    step: number;
    //...
}; // a part of JSON
export type WellLogCurve = {
    name: string;
    description: string;
    quantity: string /*|null*/;
    unit: string;
    valueType: string;
    dimensions: number;
    //...
}; // a part of JSON
export type WellLogDataRow = number[];

export type WellLogMetadataDiscreteObjects = {
    string: [];
};
export type WellLogMetadataDiscrete = {
    attributes: string[] /* ["color", "code" ] */;
    objects: WellLogMetadataDiscreteObjects;
}; // a part of JSON

export type WellLog = {
    header: WellLogHeader;
    curves: WellLogCurve[];
    data: WellLogDataRow[];

    metadata_discrete?: { string: WellLogMetadataDiscrete };
}[]; // JSON object from a file
