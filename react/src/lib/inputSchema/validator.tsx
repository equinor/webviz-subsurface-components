import Ajv from "ajv";
import { ErrorObject, ValidateFunction } from "ajv/dist/types/index";

// schema definations
/* eslint-disable @typescript-eslint/no-var-requires */
const wellsSchema = require("./Wells.json");
const wellLogSchema = require("./WellLog.json");
const wellLogsSchema = require("./WellLogs.json");
const wellLogTemplateSchema = require("./WellLogTemplate.json");

// validator function accepts parameter data to be validated and schema type to be validated against.
// return error message of failure and empty string on success.
export function validateSchema(data: unknown, schema_type: string): string {
    let validator: ValidateFunction<unknown> | null = null;

    try {
        validator = createSchemaValidator(schema_type);
    } catch (e) {
        return "Wrong JSON schema for " + schema_type + ". " + String(e);
    }

    if (!validator) return "Wrong schema type.";

    validator(data);
    return formatSchemaError(schema_type, validator.errors);
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
        default:
            return null;
    }
}

function formatSchemaError(
    schema_type: string,
    errors?: ErrorObject[] | null
): string {
    let error_text = "";
    if (!errors) return error_text;

    if (errors[0]) {
        error_text =
            (errors[0].dataPath ? errors[0].dataPath + ": " : "") +
            errors[0].message;
    } else error_text = "JSON schema validation failed";
    return `${schema_type}: ${error_text}.`;
}
