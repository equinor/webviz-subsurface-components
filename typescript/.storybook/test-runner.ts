//import { expect } from "@testing-library/jest-dom/extend-expect";
import type { TestRunnerConfig } from '@storybook/test-runner';
//import { getJestConfig, waitForPageReady } from '@storybook/test-runner';

import { toMatchImageSnapshot } from 'jest-image-snapshot';

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Awaits for the page to be loaded and available including assets (e.g., fonts)
    //await waitForPageReady(page);

    // Generates a snapshot file based on the story identifier
    let previousScreenshot: Buffer = Buffer.from("");
    //const screenshot = await page.screenshot();

    let stable = false;

    const timerStart = new Date();

    const timeout = 10000;

    while(!stable) {
        const currentScreenshot = await page.screenshot();
        if (currentScreenshot === previousScreenshot){
            stable = true;
        }
        else {
            previousScreenshot = currentScreenshot;
        }
        if (!stable) await new Promise(resolve => setTimeout(resolve, 4000));

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

  },
};

export default config;