import { defineConfig } from "cypress";
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    video:false,
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    }
  },
});
