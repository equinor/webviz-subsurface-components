import { toMatchImageSnapshot } from "jest-image-snapshot";

import type { Page } from "@playwright/test";
import {
    getStoryContext,
    type TestContext,
    type TestRunnerConfig,
} from "@storybook/test-runner";

// https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
const customDiffConfig = {};

/**
 * Polls `sample()` until two consecutive samples are equal (by `isEqual`), or
 * until `maxAttempts` is reached, whichever comes first. Returns the last
 * sample taken.
 *
 * Used to wait out stories whose rendering settles asynchronously (debounced
 * `ResizeObserver` layout, animations, etc.) before asserting a screenshot or
 * DOM snapshot against them. Bounded so that a story which never settles
 * fails fast with a diff to inspect, instead of silently consuming the whole
 * Jest `testTimeout`.
 */
async function waitUntilStable<T>(
    sample: () => Promise<T>,
    isEqual: (a: T, b: T) => boolean,
    { maxAttempts, poll }: { maxAttempts: number; poll: number }
): Promise<T> {
    let previous: T = await sample();

    for (let attempt = 1; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, poll));

        const current = await sample();
        if (isEqual(current, previous)) {
            return current;
        }
        previous = current;
    }

    return previous;
}

/**
 * `page.screenshot()` can intermittently throw
 * `Protocol error (Page.captureScreenshot): Unable to capture screenshot`
 * when Chromium's compositor is captured mid-frame (observed almost
 * exclusively on stories with continuously-running animations). This is a
 * transient CDP failure, not a rendering problem, so a couple of retries
 * clear it without masking genuine screenshot failures, which still throw
 * after exhausting the attempts.
 */
async function screenshotWithRetry(page: Page, attempts = 3): Promise<Buffer> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await page.screenshot({
                animations: "disabled",
                caret: "hide",
                timeout: 15000,
            });
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

const screenshotTest = async (page: Page, context: TestContext) => {
    const screenshot = await waitUntilStable(
        () => screenshotWithRetry(page),
        (a, b) => a.equals(b),
        { maxAttempts: 20, poll: 500 }
    );

    expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: context.id,
        // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
        failureThreshold: 0.01,
        failureThresholdType: "percent",
        // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
        customDiffConfig,
    });
};

const domSnapshotTest = async (page: Page) => {
    // Some stories render their DOM in multiple passes (e.g. a debounced
    // ResizeObserver-driven layout for axis ticks), so poll until the
    // markup stops changing before asserting - mirroring the stability
    // loop used by screenshotTest above.
    const html = await waitUntilStable(
        async () => {
            const elementHandler = await page.$("#storybook-root");
            return elementHandler ? await elementHandler.innerHTML() : "";
        },
        (a, b) => a === b,
        { maxAttempts: 20, poll: 500 }
    );

    expect(html).toMatchSnapshot();
};

const config: TestRunnerConfig = {
    setup() {
        jest.retryTimes(3);

        expect.extend({ toMatchImageSnapshot });
    },

    async preVisit(page) {
        // Tell preview.tsx's motion decorator to skip Framer Motion
        // animations for this story. Set here (rather than read once at
        // module load) because the test-runner navigates to iframe.html a
        // single time in its `prepare` step and reuses that page for every
        // story - preview.tsx's module body runs before any preVisit hook,
        // so a flag read at import time would always be stale.
        await page.evaluate(() => {
            window.__WEBVIZ_SKIP_MOTION__ = true;
        });
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
