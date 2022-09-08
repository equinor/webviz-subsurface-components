import { defineConfig } from 'cypress';
import getCompareSnapshotsPlugin from 'cypress-visual-regression/dist/plugin';;

export default defineConfig({
  e2e: {
    // setupNodeEvents(on, config) {
    //   return require('./cypress/plugins/index.ts')(on, config)
    // },
    baseUrl: 'http://localhost:6006',
    video: true,
    screenshotsFolder: "./cypress/snapshots/actual",
    screenshotOnRunFailure:false,
    trashAssetsBeforeRuns: true,
    env: {
      failSilently: false,
      ALWAYS_GENERATE_DIFF: false,
      type: "actual"
    },
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
  },
})
