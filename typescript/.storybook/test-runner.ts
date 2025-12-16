import { toMatchImageSnapshot } from "jest-image-snapshot";

import { getStoryContext, type TestRunnerConfig } from "@storybook/test-runner";

// https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
const customDiffConfig = {};

const screenshotTest = async (page, context) => {
    let previousScreenshot: Buffer = Buffer.from("");

    let stable = false;

    const poll = 10000;

    while (!stable) {
        const currentScreenshot = await page.screenshot();
        if (currentScreenshot.equals(previousScreenshot)) {
            stable = true;
        } else {
            previousScreenshot = currentScreenshot;
        }

        if (!stable) {
            await page.waitForTimeout(poll);
        }
    }

    // @ts-expect-error TS2551
    expect(previousScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: context.id,
        // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
        failureThreshold: 0.01,
        failureThresholdType: "percent",
        // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
        customDiffConfig,
    });
};

const config: TestRunnerConfig = {
    setup() {
        jest.retryTimes(2);

        expect.extend({ toMatchImageSnapshot });
    },

    async postVisit(page, context) {
        const storyContext = await getStoryContext(page, context);

        if (storyContext.tags.includes("no-test")) {
            return;
        }

        if (!storyContext.tags.includes("no-screenshot-test")) {
            await screenshotTest(page, context);
        }
    },
};

export default config;
