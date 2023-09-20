import type { FC } from "react";
import React from "react";
import type { Data } from "../redux/types";
import { DataContext } from "../components/DataLoader";

import exampleData from "../../../../../example-data/well-completions.json";

export const exampleDataDecorator = (Story: FC): JSX.Element => (
    <DataContext.Provider value={exampleData as unknown as Data}>
        <Story />
    </DataContext.Provider>
);
