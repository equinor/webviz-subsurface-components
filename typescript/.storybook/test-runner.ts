import { getStoryContext, type TestRunnerConfig } from '@storybook/test-runner';

import { toMatchImageSnapshot } from 'jest-image-snapshot';

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const screenshotTest = async (page, context) => {
    let previousScreenshot: Buffer = Buffer.from("");

    let stable = false;

    const timerStart = new Date();

    const timeout = 10000;
    const poll = 2000;

    //await new Promise(resolve => setTimeout(resolve, poll));
    //await page.waitForTimeout(poll);

    //const currentScreenshot = await page.screenshot();
    //previousScreenshot = currentScreenshot;

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
            //await new Promise(resolve => setTimeout(resolve, 1000));
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
  /*
  setup() {
    jest.retryTimes(5);
    jest.setTimeout(60000);

    expect.extend({ toMatchImageSnapshot });
  },

  async prepare({ page, browserContext, testRunnerConfig }) {
    browserContext.setDefaultNavigationTimeout(60000);
    browserContext.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    const targetURL = process.env.TARGET_URL;
    const iframeURL = new URL('iframe.html', targetURL).toString();

    if (testRunnerConfig?.getHttpHeaders) {
      const headers = await testRunnerConfig.getHttpHeaders(iframeURL);
      await browserContext.setExtraHTTPHeaders(headers);
    }

    await page.goto(iframeURL, { waitUntil: 'load', timeout: 60000 }).catch((err) => {
      if (err.message?.includes('ERR_CONNECTION_REFUSED')) {
        const errorMessage = `Could not access the Storybook instance at ${targetURL}. Are you sure it's running?\n\n${err.message}`;
        throw new Error(errorMessage);
      }

      throw err;
    });
  },
  */
/*   async preVisit(page, context) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
  }, */

  /*
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    if (!storyContext.tags.includes("no-screenshot-test")) {
        screenshotTest(page, context);
    }
  },
  */
};

export default config;