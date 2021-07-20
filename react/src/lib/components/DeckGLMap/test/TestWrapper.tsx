import { string } from "mathjs";
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";
import { testState, testSpecPatch } from "./testReduxState";


export const testStore = createStore({}, {});
testStore.dispatch = jest.fn();
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={testStore}>{children}</Provider>;
};
