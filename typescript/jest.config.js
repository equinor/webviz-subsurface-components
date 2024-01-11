/** @type {import('jest').Config} */

const path = require("path");

/**
 * The jest tests had an error: SyntaxError: Cannot use import statement outside a module
 * After some investigation, it leads to this page https://github.com/facebook/jest/issues/9395.
 */
module.exports = {
    rootDir: "./",
    resolver: "@nx/jest/plugins/resolver",
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|scss)$":
            path.resolve(__dirname, "__mocks__/fileMock.js"),
        "\\.(css|less)$": path.resolve(__dirname, "__mocks__/styleMock.js"),
    },
    transform: {
        "\\.(js|ts|jsx|tsx)$": [
            "babel-jest",
            { configFile: path.resolve(__dirname, "config/babel.config.js") },
        ],
    },
    transformIgnorePatterns: [
        path.resolve(__dirname, "node_modules") +
            "//(?!(@webviz|(@emerson-eps/color-tables)|d3-.+|d3|delaunator|robust-predicates|internmap|@mapbox/tiny-sdf)/)",
    ],
    testPathIgnorePatterns: [path.resolve(__dirname, "node_modules"), "dist"],
    modulePathIgnorePatterns: ["dist"],
    setupFiles: ["jest-canvas-mock"],
};
