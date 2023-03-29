import React from "react";
import { Provider } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

// @rmt: Changed from require to import
import exampleData from "../../../../demo/example-data/group-tree.json";
import { Data } from "../redux/types";
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
