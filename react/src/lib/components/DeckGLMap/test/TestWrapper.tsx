import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";
import { Operation } from "fast-json-patch";


export const testStore = createStore({}, (patch: Operation[]) => void);
testStore.dispatch = jest.fn();
export const Wrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={testStore}>{children}</Provider>;
};
