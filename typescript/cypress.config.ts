import { defineConfig } from "cypress";
import getCompareSnapshotsPlugin from "cypress-image-diff-js/dist/plugin";

export default defineConfig({
    component: {
        devServer: {
            framework: "create-react-app",
            bundler: "webpack",
        },
        video: false,
        setupNodeEvents(on, config) {
            getCompareSnapshotsPlugin(on, config),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                on("before:browser:launch", (browser = {}, launchOptions) => {
                    if (
                        browser.family === "chromium" &&
                        browser.name !== "electron"
                    ) {
                        launchOptions.args.push("--start-fullscreen");

                        return launchOptions;
                    }
                    if (browser.name === "electron") {
                        launchOptions.preferences["fullscreen"] = true;

                        return launchOptions;
                    }
                    return null;
                });
        },
    },
});
