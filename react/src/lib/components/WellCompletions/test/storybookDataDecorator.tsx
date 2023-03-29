import React, { FC } from "react";
// @rmt: Added import
import { Data } from "../redux/types";
import { DataContext } from "../components/DataLoader";
// @rmt: Changed require to import
import exampleData from "../../../../demo/example-data/well-completions.json";

export const exampleDataDecorator = (Story: FC): JSX.Element => (
    // @rmt: Added type
    <DataContext.Provider value={exampleData as unknown as Data}>
        <Story />
    </DataContext.Provider>
);
