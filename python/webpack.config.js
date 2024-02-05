const path = require("path");
const WebpackDashDynamicImport = require("@plotly/webpack-dash-dynamic-import");
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
        libraryTarget: "umd",
    };
    const externals = {
        react: {
            commonjs: "react",
            commonjs2: "react",
            amd: "react",
            umd: "react",
            root: "React",
            window: "react",
        },
        "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "react-dom",
            umd: "react-dom",
            root: "ReactDOM",
            window: "react-dom",
        },
    };

    return {
        output,
        mode,
        entry,
        target: "web",
        externals,
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            fallback: {
                os: false,
                child_process: false,
                worker_threads: false,
            },
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
                    use: [
                        {
                            loader: "style-loader",
                            options: {
                                insert: function insertAtTop(element) {
                                    var parent = document.querySelector("head");
                                    var lastInsertedElement =
                                        window._lastElementInsertedByStyleLoader;

                                    if (!lastInsertedElement) {
                                        parent.insertBefore(
                                            element,
                                            parent.firstChild
                                        );
                                    } else if (
                                        lastInsertedElement.nextSibling
                                    ) {
                                        parent.insertBefore(
                                            element,
                                            lastInsertedElement.nextSibling
                                        );
                                    } else {
                                        parent.appendChild(element);
                                    }

                                    window._lastElementInsertedByStyleLoader =
                                        element;
                                },
                            },
                        },
                        {
                            loader: "css-loader",
                        },
                    ],
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
        plugins: [new WebpackDashDynamicImport()],
    };
};
