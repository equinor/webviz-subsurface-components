import React from "react";
import { Provider } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

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
        <DataContext.Provider value={JSON.parse(exampleData.toString())}>
            <Provider store={testStore}>{children}</Provider>
        </DataContext.Provider>
    );
};
