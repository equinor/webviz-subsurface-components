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

    // @ts-expect-error TS2551
    expect(previousScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: context.id,
        // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
        failureThreshold: 50,
        failureThresholdType: "pixel",
        // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
        customDiffConfig,
    });
};

const domSnapshotTest = async (page: Page, context: TestContext) => {
    try {
        // Try to wait for network idle, but with a shorter timeout
        await page.waitForLoadState("networkidle", { timeout: 10000 });
    } catch {
        // If networkidle times out, wait for domcontentloaded instead
        await page.waitForLoadState("domcontentloaded");
        // Add a small delay to allow for initial rendering
        await page.waitForTimeout(2000);
    }

    // Wait for the story to be rendered
    await page.waitForSelector("#storybook-root", { timeout: 10000 });

    // Get the DOM content of the story container
    const domContent = await page.evaluate(() => {
        const storyElement = document.querySelector("#storybook-root");
        return storyElement ? storyElement.innerHTML : "";
    });

    // Create a snapshot of the DOM
    expect(domContent).toMatchSnapshot(`${context.id}.dom.html`);
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
            await domSnapshotTest(page, context);
        }
    },
};

export default config;
