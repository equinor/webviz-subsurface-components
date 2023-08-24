import React from "react";
import { Provider } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";
import type { Data } from "../redux/types";

import exampleData from "../../../../../example-data/group-tree.json";

export const testStore = createReduxStore(testState);
testStore.dispatch = jest.fn() as never;

// eslint-disable-next-line react/prop-types
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return (
        <DataContext.Provider value={exampleData as unknown as Data}>
            <Provider store={testStore}>{children}</Provider>
        </DataContext.Provider>
    );
};
