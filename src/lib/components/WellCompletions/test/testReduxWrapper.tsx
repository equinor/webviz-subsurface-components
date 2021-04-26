import React from "react";
import { Provider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

export const testStore = createReduxStore(testState);
// eslint-disable-next-line no-undef
testStore.dispatch = jest.fn();

// eslint-disable-next-line react/prop-types
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={testStore}>{children}</Provider>;
};
