// See https://github.com/JSONWellLogFormat/JSONWellLogFormat
export type integer = number;
export type float = number;
export type datetime = string;

export type WellLogHeader = {
    name?: string; // Log name
    description?: string; // Log description
    externalIds?: Record<string, string>; // IDs within external storage, key being the storage name, and value being the ID.
    well?: string; // Well name
    wellbore?: string; // Wellbore name
    filed?: string; // Field name
    country?: string; // Country of operation
    date?: datetime; // Logging date
    operator?: string; // Operator company name
    serviceCompany?: string; // Service company name
    runNumber?: string; // Run number
    elevation?: float; // Vertical distance between measured depth 0.0 and mean sea level in SI unit (meters)
    source?: string; // Source system or process of this log
    startIndex?: number /*According to index value type*/; // Value of the first index. Unit according to index curve.
    endIndex?: number /*According to index value type*/; // Value of the last index. Unit according to index curve.
    step?: number /*According to index value type*/; // Distance between indices if regularly sampled. Unit according to index curve. If log is time based, milliseconds assumed.
    dataUri?: string; //	Point to data source in case this is kept separate. Can be absolute or relative according to the URI specification.
    //...
}; // a part of JSON
export type WellLogCurve = {
    name: string; // Curve name or mnemonic. Mandatory. Non-null.
    description?: string | null; // Curve description. Optional.
    quantity?: string | null; // Curve quantity such as length, pressure, force etc. Optional.
    unit?: string | null; // Unit of measurement such as m, ft, bar, etc. Optional.
    valueType?: string | null; // Curve value type: float, integer, string, datetime or boolean. Non-null. Optional. float assumed if not present.
    dimensions?: integer; //  	Number of dimensions. [1,>. Non-null. Optional. 1 assumed if not present.
    // Not supported yet:
    //axis?: 	array of curve definition; 	// A detailed description of the multi-dimensional structure of the curve in case this spans multiple axes. One element per axis. The combined product of the axis diemsnsions elements must equal the dimensions of the curve. Optional.
    //maxSize?: integer; 	// Maximum storage size (number of bytes) for UTF-8 string data. Used with binary storage in order to align the curve data. [0,>. Optional. 20 assumed if not present. Ignored for curves where valueType is other than string.
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
