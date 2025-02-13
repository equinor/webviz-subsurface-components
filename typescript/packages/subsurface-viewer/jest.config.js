/** @type {import('jest').Config} */

const config = {
    setupFilesAfterEnv: ["./jest.setup.ts"],
    preset: "../../jest.config.js",
};

module.exports = config;
