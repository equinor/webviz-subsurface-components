/* eslint-disable @typescript-eslint/no-var-requires */
import Ajv from "ajv";
import { ErrorObject, ValidateFunction } from "ajv/dist/types/index";

// schema definations
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
    return formatSchemaError(validator.errors);
}

function createSchemaValidator(
    schema_type: string
): ValidateFunction<unknown> | null {
    const ajv = new Ajv({
        schemas: [wellLogSchema], // add list of dependent schemas
    });
    let validator: ValidateFunction<unknown> | null = null;

    switch (schema_type) {
        case "WellLog":
            validator = ajv.compile(wellLogSchema);
            break;
        case "WellLogs":
            validator = ajv.compile(wellLogsSchema);
            break;
        case "WellLogTemplate":
            validator = ajv.compile(wellLogTemplateSchema);
            break;
        default:
            return null;
    }
    return validator;
}

function formatSchemaError(errors?: ErrorObject[] | null): string {
    if (!errors) return "";
    if (!errors[0]) return "JSON schema validation failed";
    return (
        (errors[0].dataPath ? errors[0].dataPath + ": " : "") +
        errors[0].message
    );
}
