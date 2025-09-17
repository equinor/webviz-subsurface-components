import { toMatchImageSnapshot } from "jest-image-snapshot";

import type { Page } from "@playwright/test";
import {
    getStoryContext,
    type TestContext,
    type TestRunnerConfig,
} from "@storybook/test-runner";

// https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
const customDiffConfig = {};

const screenshotTest = async (page: Page, context: TestContext) => {
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

    expect(previousScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: context.id,
        // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
        failureThreshold: 50,
        failureThresholdType: "pixel",
        // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
        customDiffConfig,
    });
};

const domSnapshotTest = async (page: Page) => {
    const elementHandler = await page.$("#storybook-root");
    const innerHTML = elementHandler ? await elementHandler.innerHTML() : "";
    expect(innerHTML).toMatchSnapshot();
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

        // Run DOM snapshot test unless no-dom-test is specified
        if (!storyContext.tags.includes("no-dom-test")) {
            await domSnapshotTest(page);
        }
    },
};

export default config;
