import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { getStoryContext, type TestRunnerConfig } from '@storybook/test-runner';

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const screenshotTest = async (page, context) => {
    let previousScreenshot: Buffer = Buffer.from("");

    let stable = false;

    const timerStart = new Date();

    const timeout = 30000;
    const poll = 2000;

    while(!stable) {
        const currentScreenshot = await page.screenshot();
        if (currentScreenshot === previousScreenshot){
            stable = true;
        }
        else {
            previousScreenshot = currentScreenshot;
        }

        if (!stable) {
            await page.waitForTimeout(poll);
        }

        // time out
        const elapsed = new Date().getTime() - timerStart.getTime();
        if (elapsed > timeout) {
            break;
        }
    }

    expect(previousScreenshot).toMatchImageSnapshot({
      customSnapshotsDir,
      customSnapshotIdentifier: context.id,
    });


};

const config: TestRunnerConfig = {
  setup() {
    jest.retryTimes(2);
    //jest.setTimeout(60000);

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