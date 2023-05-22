import Ajv from "ajv";
import { ErrorObject, ValidateFunction } from "ajv/dist/types/index";

// schema definations
import wellsSchema from "./Wells.json";
import wellLogSchema from "./WellLog.json";
import wellLogsSchema from "./WellLogs.json";
import wellLogTemplateSchema from "./WellLogTemplate.json";
import pieChartSchema from "./PieChart.json";
import gridSchema from "./Grid.json";
import faultPolygonsSchema from "./FaultPolygons.json";
import colorTablesSchema from "./ColorTables.json";

// Validator function accepts parameter data and schema type to be validated against.
// Throws error message of failure.
export function validateSchema(data: unknown, schema_type: string): void {
    let validator: ValidateFunction<unknown> | null = null;

    try {
        validator = createSchemaValidator(schema_type);
    } catch (e) {
        throw "Wrong JSON schema for " + schema_type + ". " + String(e);
    }

    if (!validator) throw "Wrong schema type.";

    validator(data);
    if (validator.errors) {
        throw formatSchemaError(schema_type, validator.errors);
    }
}

function createSchemaValidator(
    schema_type: string
): ValidateFunction<unknown> | null {
    const ajv = new Ajv({
        schemas: [wellLogSchema], // add list of dependent schemas
    });

    switch (schema_type) {
        case "Wells":
            return ajv.compile(wellsSchema);
        case "WellLog":
            return ajv.compile(wellLogSchema);
        case "WellLogs":
            return ajv.compile(wellLogsSchema);
        case "WellLogTemplate":
            return ajv.compile(wellLogTemplateSchema);
        case "PieChart":
            return ajv.compile(pieChartSchema);
        case "Grid":
            return ajv.compile(gridSchema);
        case "FaultPolygons":
            return ajv.compile(faultPolygonsSchema);
        case "ColorTables":
            return ajv.compile(colorTablesSchema);
        default:
            return null;
    }
}

function formatSchemaError(schema_type: string, errors: ErrorObject[]): string {
    let error_text = "";

    if (errors[0]) {
        error_text =
            (errors[0].dataPath ? errors[0].dataPath + ": " : "") +
            errors[0].message;
    } else error_text = "JSON schema validation failed";

    return `${schema_type}: ${error_text}.`;
}
