import type React from "react";
import { Provider } from "react-redux";
import { createStore } from "../redux/store";

export const emptytestStore = createStore({});
emptytestStore.dispatch = jest.fn() as never;
export const EmptyWrapper = ({
    children,
}: {
    children: React.JSX.Element;
}): React.JSX.Element => {
    return <Provider store={emptytestStore}>{children}</Provider>;
};
