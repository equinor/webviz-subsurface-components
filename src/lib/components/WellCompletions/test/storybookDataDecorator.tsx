import React, { FC } from "react";
import { DataContext } from "../WellCompletions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const exampleData = require("../../../../demo/example-data/well-completions-with-attr.json");

export const exampleDataDecorator = (Story: FC): JSX.Element => (
    <DataContext.Provider value={exampleData}>
        <Story />
    </DataContext.Provider>
);
