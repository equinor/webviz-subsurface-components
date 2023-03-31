const fs = require("fs");
const path = require("path");

const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const packageJson = require("./package.json");

const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === "development",
    require(resolveApp("package.json")).homepage,
    process.env.PUBLIC_URL
);

const paths = {
    src: resolveApp("src"),
    build: resolveApp("build"),
    dist: resolveApp("dist"),
    public: resolveApp("public"),
    assets: resolveApp("static"),
    appPath: resolveApp("."),
    appPackageJson: resolveApp("package.json"),
    appNodeModules: resolveApp("node_modules"),
    publicUrlOrPath,
    appTsBuildInfoFile: resolveApp("node_modules/.cache/tsconfig.tsbuildinfo"),
};

module.exports = (env) => {
    const isEnvDevelopment = env.production === "development";
    const isEnvProduction = env.production === "production";

    return {
        name: "npm-dist",
        mode: isEnvProduction ? "production" : "development",
        target: "web",
        entry: {
            VectorSelector: path.resolve(paths.dist, "lib/components/VectorSelector/index.js"),
        },
        devtool: isEnvDevelopment ? "cheap-module-source-map" : "source-map",
        output: {
            path: path.resolve(paths.dist, "package"),
            assetModuleFilename: "assets/[name].[hash][ext]",
            asyncChunks: true,
            library: {
                type: "module",
            },
            filename: "[name].js",
            chunkFilename: isEnvProduction
                ? "[name].[contenthash:8].chunk.js"
                : "[name].chunk.js",
        },
        experiments: {
            outputModule: true,
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isEnvProduction
                    ? "css/[name].[contenthash].chunk.css"
                    : "css/[name].css",
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/,
                    use: ["babel-loader", "webpack-conditional-loader"],
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
            ],
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
        optimization: {
            minimize: false,
            minimizer: [new TerserJSPlugin({}), new CssMinimizerPlugin({})],
        },
    };
};
