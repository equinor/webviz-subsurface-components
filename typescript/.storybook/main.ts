import { dirname, join } from "path";

import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
    stories: [
        "../packages/*/src/**/*.mdx",
        "../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-actions"),
        getAbsolutePath("@storybook/addon-storysource"),
        getAbsolutePath("@storybook/addon-webpack5-compiler-babel"),
    ],
    webpackFinal: async (config) => {
        return {
            ...config,
            module: {
                ...config.module,
                rules: [
                    ...(config.module?.rules ?? []),
                    {
                        test: /\.scss$/,
                        use: ["vue-style-loader", "css-loader", "sass-loader"],
                    },
                    {
                        test: /\.(fs|vs).glsl$/i,
                        use: ["raw-loader"],
                    },
                    {
                        test: /\.(ts|js)x?$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            targets: {
                                                chrome: 100,
                                            },
                                        },
                                    ],
                                    [
                                        "@babel/preset-typescript",
                                        { allowNamespaces: true },
                                    ],
                                    "@babel/preset-react",
                                ],
                            },
                        },
                    },
                ],
            },
            resolve: {
                ...config.resolve,
                fallback: {
                    ...config.resolve?.fallback,
                    fs: false,
                    tls: false,
                    net: false,
                    path: false,
                    zlib: false,
                    http: false,
                    https: false,
                    crypto: false,
                    stream: false,
                    os: false,
                    child_process: false,
                    worker_threads: false,
                },
            },
        };
    },
    staticDirs: ["../../example-data"],
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    docs: {
        autodocs: true,
    },
};
export default config;

// @ts-expect-error TS7006
function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, "package.json")));
}
