import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";
import { testState } from "../../SubsurfaceViewer/test/testReduxState";

export const testStore = createStore(testState);
testStore.dispatch = jest.fn() as never;
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={testStore}>{children}</Provider>;
};

export const emptytestStore = createStore({});
emptytestStore.dispatch = jest.fn() as never;
export const EmptyWrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={emptytestStore}>{children}</Provider>;
};
