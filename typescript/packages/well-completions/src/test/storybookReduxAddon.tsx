import React from "react";
import { Provider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";
import { DecoratorFunction } from "@storybook/addons";

// A super-simple mock of a redux store
const testStore = createReduxStore(testState);

export const withReduxDecorator: DecoratorFunction<JSX.Element> = (Story) => (
    <Provider store={testStore}>
        <Story />
    </Provider>
);
