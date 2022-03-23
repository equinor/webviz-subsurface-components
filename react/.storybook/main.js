module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-actions",
        "addon-redux",
        "storybook-addon-performance/register",
        "storybook-source-code-addon",
    ],
    core: {
        builder: "webpack5",
    },
    webpackFinal: (config) => {
        config.module.rules.push(
            {
                test: /\.scss$/,
                use: ["vue-style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(fs|vs).glsl$/i,
                use: ["raw-loader"],
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
                },
            },
        };
    },
    staticDirs: ["../src/demo/example-data"],
};
