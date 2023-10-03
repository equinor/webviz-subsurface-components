const path = require("path");
const webpack = require("webpack");
const WebpackDashDynamicImport = require("@plotly/webpack-dash-dynamic-import");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const packagejson = require("./package.json");

const dashLibraryName = packagejson.name.replace(/-/g, "_");

module.exports = function (env, argv) {
    const mode = (argv && argv.mode) || "production";
    const entry = [path.join(__dirname, "src/index.ts")];

    const output = {
        path: path.join(__dirname, dashLibraryName),
        chunkFilename: "[name].js",
        filename: `${dashLibraryName}.min.js`,
        library: dashLibraryName,
        libraryTarget: "window",
    };
    const externals = {
        react: "React",
        "react-dom": "ReactDOM",
        "plotly.js": "Plotly",
    };

    return {
        output,
        mode,
        entry,
        target: "web",
        externals,
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader", // injects styles into DOM
                        "css-loader", // translates CSS into CommonJS
                        "sass-loader", // compiles Sass to CSS
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: [
                        {
                            loader: "url-loader",
                        },
                    ],
                },
            ],
        },
        optimization: {
            minimize: true,
            splitChunks: {
                name: "[name].js",
                cacheGroups: {
                    async: {
                        chunks: "async",
                        minSize: 0,
                        name(module, chunks, cacheGroupKey) {
                            return `${cacheGroupKey}-${chunks[0].name}`;
                        },
                    },
                    shared: {
                        chunks: "all",
                        minSize: 0,
                        minChunks: 2,
                        name: "webviz_subsurface_components-shared",
                    },
                },
            },
        },
        plugins: [
            new WebpackDashDynamicImport(),
            new MiniCssExtractPlugin({
                filename: path.join(dashLibraryName, `${dashLibraryName}.css`),
            }),
        ],
    };
};
