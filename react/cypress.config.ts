import { defineConfig } from "cypress";
import { initPlugin } from '@frsource/cypress-plugin-visual-regression-diff/dist/plugins';

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      initPlugin(on, config);
    }
  },
});
