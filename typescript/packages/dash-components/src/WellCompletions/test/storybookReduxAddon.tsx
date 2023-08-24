import React from "react";
import { Provider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";
import type { DecoratorFunction } from "@storybook/csf";

// A super-simple mock of a redux store
const testStore = createReduxStore(testState);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const withReduxDecorator: DecoratorFunction<JSX.Element> = (Story) => (
    <Provider store={testStore}>
        {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            <Story />
        }
    </Provider>
);
