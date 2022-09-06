import { defineConfig } from 'cypress';
import getCompareSnapshotsPlugin from 'cypress-visual-regression/dist/plugin';;

export default defineConfig({
  e2e: {
    // setupNodeEvents(on, config) {
    //   return require('./cypress/plugins/index.ts')(on, config)
    // },
    baseUrl: 'http://localhost:6006',
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
  },
})
