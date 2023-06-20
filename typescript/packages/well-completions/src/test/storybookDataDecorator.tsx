import React, { FC } from "react";
import { Data } from "../redux/types";
import { DataContext } from "../components/DataLoader";

import exampleData from "../../demo/example-data/well-completions.json";

export const exampleDataDecorator = (Story: FC): JSX.Element => (
    <DataContext.Provider value={exampleData as unknown as Data}>
        <Story />
    </DataContext.Provider>
);
