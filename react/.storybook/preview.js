import { addDecorator } from "@storybook/react";
import { withPerformance } from "storybook-addon-performance";

addDecorator(withPerformance);
export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
