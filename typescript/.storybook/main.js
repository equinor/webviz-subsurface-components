import { dirname, join } from "path";
module.exports = {
    stories: [
        "../packages/*/src/**/*.mdx",
        "../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-actions"),
        getAbsolutePath("@storybook/addon-storysource"),
        getAbsolutePath("@storybook/addon-mdx-gfm"),
        getAbsolutePath("@storybook/addon-webpack5-compiler-babel"),
    ],
    webpackFinal: (config) => {
        config.module.rules.push(
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
            }
        );
        return {
            ...config,
            resolve: {
                ...config.resolve,
                fallback: {
                    ...config.fallback,
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
        name: getAbsolutePath("@storybook/react-webpack5"),
        options: {},
    },
    docs: {
        autodocs: true,
    },
};

function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, "package.json")));
}
