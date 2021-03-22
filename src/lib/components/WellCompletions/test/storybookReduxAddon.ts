import addons from "@storybook/addons";
import withRedux from "addon-redux/withRedux";
import { Provider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { testState } from "./testReduxState";

// A super-simple mock of a redux store
const testStore = createReduxStore(testState);

const withReduxSettings = {
    Provider,
    store: testStore,
    state: testState,
    actions: [],
};

export const withReduxDecorator = withRedux(addons)(withReduxSettings);
