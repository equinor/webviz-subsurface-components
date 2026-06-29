/** @type {import('jest').Config} */

const config = {
    preset: "../../jest.config.js",

    setupFiles: ["<rootDir>/jest.polyfills.ts"],
};

module.exports = config;
