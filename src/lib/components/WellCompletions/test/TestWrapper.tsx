import React from "react";
import { Provider } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../../demo/example-data/well-completions.json");
export const testStore = createReduxStore(testState);
// eslint-disable-next-line no-undef
testStore.dispatch = jest.fn();

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
