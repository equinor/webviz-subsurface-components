import React from "react";
import { Provider } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../../demo/example-data/group-tree.json");
export const testStore = createReduxStore(testState);
testStore.dispatch = jest.fn() as never;

// eslint-disable-next-line react/prop-types
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return (
        <DataContext.Provider value={exampleData}>
            <Provider store={testStore}>{children}</Provider>
        </DataContext.Provider>
    );
};
