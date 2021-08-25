import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";
import { Operation } from "fast-json-patch";
import { testState } from "../../DeckGLMap/test/testReduxState";

export const testStore = createStore(testState, (patch: Operation[]) => {
    patch;
});
testStore.dispatch = jest.fn();
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={testStore}>{children}</Provider>;
};

export const emptytestStore = createStore({}, (patch: Operation[]) => {
    patch;
});
emptytestStore.dispatch = jest.fn();
export const EmptyWrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={emptytestStore}>{children}</Provider>;
};
