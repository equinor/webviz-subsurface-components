import { defineConfig } from "cypress";
import getCompareSnapshotsPlugin from 'cypress-visual-regression/dist/plugin';

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    "screenshotsFolder": "./cypress/snapshots/actual",
    "trashAssetsBeforeRuns": true,
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
    env: {pluginVisualRegressionImagesDir: 'snapshots-directory'}
  },
});
