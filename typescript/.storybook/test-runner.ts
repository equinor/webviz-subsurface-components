import { getStoryContext, type TestRunnerConfig } from '@storybook/test-runner';

import { toMatchImageSnapshot } from 'jest-image-snapshot';

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const screenshotTest = async (page, context) => {
    let previousScreenshot: Buffer = Buffer.from("");

    let stable = false;

    const timerStart = new Date();

    const timeout = 5000;

    while(!stable) {
        const currentScreenshot = await page.screenshot();
        if (currentScreenshot === previousScreenshot){
            stable = true;
        }
        else {
            previousScreenshot = currentScreenshot;
        }

        if (!stable) {
            //await page.waitForTimeout(2000);
            await new Promise(resolve => setTimeout(resolve, 1000));
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
    //jest.retryTimes(2);
    //jest.setTimeout(60000);

    expect.extend({ toMatchImageSnapshot });
  },

/*   async preVisit(page, context) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
  }, */

  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    if (!storyContext.tags.includes("no-screenshot-test")) {
        screenshotTest(page, context);
    }
  },
};

export default config;