const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const packagejson = require("./package.json");
const dashLibraryName = packagejson.name.replace(/-/g, "_");

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
        argv.devtool || (mode === "development" ? "eval-source-map" : "none");

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
            path: demo ? __dirname : path.resolve(__dirname, dashLibraryName),
            filename: filename_js,
            library: dashLibraryName,
            libraryTarget: "window",
        },
        optimization: {
            minimizer: [
                new TerserJSPlugin({}),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
        externals,
        plugins: [
            new MiniCssExtractPlugin({
                filename: filename_css,
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(t|j)s?x?$/,
                    exclude: /node_modules/,
                    use: { loader: "ts-loader" },
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
