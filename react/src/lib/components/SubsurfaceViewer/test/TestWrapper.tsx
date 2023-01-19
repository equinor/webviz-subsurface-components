import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";

export const emptytestStore = createStore({});
emptytestStore.dispatch = jest.fn() as never;
export const EmptyWrapper = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return <Provider store={emptytestStore}>{children}</Provider>;
};
