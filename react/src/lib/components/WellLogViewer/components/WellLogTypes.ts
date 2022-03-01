// See https://github.com/JSONWellLogFormat/JSONWellLogFormat
export type WellLogHeader = {
    name?: string; // Log name
    description?: string; // Log description
    externalIds?: Record<string, string>; // IDs within external storage, key being the storage name, and value being the ID.
    well?: string; // Well name
    wellbore?: string; // Wellbore name
    filed?: string; // Field name
    country?: string; // Country of operation
    date?: string /*datetime*/; // Logging date
    operator?: string; // Operator company name
    serviceCompany?: string; // Service company name
    runNumber?: string; // Run number
    elevation?: number /*float*/; // Vertical distance between measured depth 0.0 and mean sea level in SI unit (meters)
    source?: string; // Source system or process of this log
    startIndex?: number /*According to index value type*/; // Value of the first index. Unit according to index curve.
    endIndex?: number /*According to index value type*/; // Value of the last index. Unit according to index curve.
    step?: number /*According to index value type*/; // Distance between indices if regularly sampled. Unit according to index curve. If log is time based, milliseconds assumed.
    dataUri?: string; //	Point to data source in case this is kept separate. Can be absolute or relative according to the URI specification.
    //...
}; // a part of JSON
export type WellLogCurve = {
    name: string;
    description?: string | null;
    quantity?: string | null;
    unit?: string | null;
    valueType?: string | null;
    dimensions?: number;
    //...
}; // a part of JSON
export type WellLogDataRow = (number | string)[];

export type WellLogMetadataDiscreteObjects = Record<string, []>;
// data example: { "Above_BCU": [ [255,13,186,255], 0 ], "ABOVE": ...  }

export type WellLogMetadataDiscrete = {
    attributes: string[] /* ["color", "code" ] */;
    objects: WellLogMetadataDiscreteObjects;
}; // a part of JSON

export type WellLog = {
    header: WellLogHeader;
    curves: WellLogCurve[];
    data: WellLogDataRow[];

    metadata_discrete?: Record<string, WellLogMetadataDiscrete>;
}; // JSON object from a file
