/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */
const webpack = require("webpack");

const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const packagejson = require("./package.json");
const dashLibraryName = packagejson.name
    .replace(/[-/]/g, "_")
    .replace(/@/g, "");

module.exports = (env, argv) => {
    let mode;

    // if user specified mode flag take that value
    if (argv && argv.mode) {
        mode = argv.mode;
    }
    // else take webpack default (production)
    else {
        mode = "production";
    }

    const entry = {
        main: argv && argv.entry ? argv.entry : "./src/lib/index.js",
    };
    const demo = entry.main !== "./src/lib/index.js";

    const filename_js = demo
        ? "output.js"
        : `${dashLibraryName}.${mode === "development" ? "dev" : "min"}.js`;
    const filename_css = demo ? "output.css" : `${dashLibraryName}.css`;

    const devtool =
        argv.devtool || (mode === "development" ? "eval-source-map" : false);

    const externals = demo
        ? undefined
        : {
              react: "React",
              "react-dom": "ReactDOM",
              "plotly.js": "Plotly",
          };

    return {
        mode,
        entry,
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
        output: {
            path: demo
                ? __dirname
                : path.resolve(__dirname, "..", dashLibraryName),
            filename: filename_js,
            library: dashLibraryName,
            libraryTarget: "window",
        },
        optimization: {
            minimizer: [new TerserJSPlugin({}), new CssMinimizerPlugin({})],
        },
        externals,
        plugins: [
            new MiniCssExtractPlugin({
                filename: demo
                    ? filename_css
                    : path.join("..", dashLibraryName, filename_css),
            }),
            // fix "process is not defined" error:
            // https://stackoverflow.com/questions/41359504/webpack-bundle-js-uncaught-referenceerror-process-is-not-defined
            new webpack.ProvidePlugin({
                process: "process/browser",
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                },
                {
                    test: /\.scss$/,
                    use: ["vue-style-loader", "css-loader", "sass-loader"],
                },

                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader",
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/i,
                    use: [
                        {
                            loader: "url-loader",
                        },
                    ],
                },
                {
                    test: /\.(fs|vs).glsl$/i,
                    use: [
                        {
                            loader: "raw-loader",
                        },
                    ],
                },
                {
                    enforce: "pre",
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "source-map-loader",
                },
            ],
        },
        devtool,
    };
};
