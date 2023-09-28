import Ajv from "ajv";
import React from "react";
import semver from "semver";
import type { Data } from "./redux/types";
import ErrorPlaceholder from "./components/Common/ErrorPlaceholder";
import DataProvider from "./components/DataLoader";
import { WellCompletionsViewer } from "./components/WellCompletionsViewer";

import inputSchema from "./inputSchema/wellCompletions.json";

const ajv = new Ajv();
const minVersion = "1.0.0";

interface WellCompletionsProps {
    id: string;
    data: Data;
}

/**
 * Well completions component
 */
export const WellCompletions: React.FC<WellCompletionsProps> = React.memo(
    ({ id, data }: WellCompletionsProps) => {
        const validate = React.useMemo(() => ajv.compile(inputSchema), []);
        //check against the json schema
        const isSchemaValid = React.useMemo(
            () => validate(data),
            [data, validate]
        );
        const isVersionDefined = React.useMemo(
            () =>
                data.version !== undefined &&
                semver.valid(data.version) !== null,
            [data.version]
        );
        const isVersionValid = React.useMemo(
            () =>
                isVersionDefined &&
                semver.satisfies(data.version, `>=${minVersion}`),
            [data, isVersionDefined]
        );
        if (!isVersionValid)
            return (
                <ErrorPlaceholder
                    text={
                        !isVersionDefined
                            ? `${data.version} is not a valid version`
                            : `${data.version} is lower than the minimum support version 1.0.0`
                    }
                />
            );

        //If input data does not satisfy the schema
        if (!isSchemaValid)
            return <ErrorPlaceholder text={JSON.stringify(validate.errors)} />;
        return (
            <DataProvider id={id} data={data}>
                <WellCompletionsViewer parentId={id} />
            </DataProvider>
        );
    }
);

WellCompletions.displayName = "WellCompletions";
