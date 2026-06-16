import type { Preview } from "@storybook/react-webpack5";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        docs: {
            story: {
                height: "500px",
            },

            codePanel: true,
        },
    },

    tags: ["autodocs"],
};

export default preview;
