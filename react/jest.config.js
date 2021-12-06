/**
 * The jest tests had an error: SyntaxError: Cannot use import statement outside a module
 * After some investigation, it leads to this page https://github.com/facebook/jest/issues/9395.
 */
module.exports = {
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    },
    transform: {
        "\\.(js|ts|jsx|tsx)$": [
            "babel-jest",
            { configFile: "./config/babel.config.json" },
        ],
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!(@webviz)/)"],
};
