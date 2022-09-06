import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // setupNodeEvents(on, config) {
    //   return require('./cypress/plugins/index.ts')(on, config)
    // },
    baseUrl: 'http://localhost:6006/?path=/story/deckglmap--default',
  },
})
