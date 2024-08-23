// @ts-expect-error TS7016
import { toMatchImageSnapshot } from "jest-image-snapshot";

import { getStoryContext, type TestRunnerConfig } from "@storybook/test-runner";

// @ts-expect-error TS7006
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
