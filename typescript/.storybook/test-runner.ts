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
 * Polls `sample()` until `requiredStableSamples` *consecutive* samples are
 * all equal (by `isEqual`), or until `maxAttempts` is reached, whichever
 * comes first. Returns the last sample taken.
 *
 * Used to wait out stories whose rendering settles asynchronously (debounced
 * `ResizeObserver` layout, animations, etc.) before asserting a screenshot or
 * DOM snapshot against them. Bounded so that a story which never settles
 * fails fast with a diff to inspect, instead of silently consuming the whole
 * Jest `testTimeout`.
 *
 * `requiredStableSamples` defaults to 2 (the historical "two matching
 * samples in a row" check), but some stories are driven by a
 * `ResizeObserver` feedback loop that ramps gradually and can plateau for
 * several hundred ms mid-ramp (observed: up to ~750ms) - long enough to
 * fool a 2-sample check into declaring stability early and capturing a
 * mid-render frame. Callers with that risk should pass a higher
 * `requiredStableSamples` so the *total* stable window
 * (`poll * (requiredStableSamples - 1)`) comfortably exceeds the longest
 * observed plateau.
 */
async function waitUntilStable<T>(
    sample: () => Promise<T>,
    isEqual: (a: T, b: T) => boolean,
    {
        maxAttempts,
        poll,
        requiredStableSamples = 2,
    }: { maxAttempts: number; poll: number; requiredStableSamples?: number }
): Promise<T> {
    let previous: T = await sample();
    let stableStreak = 1;

    for (let attempt = 1; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, poll));

        const current = await sample();
        if (isEqual(current, previous)) {
            stableStreak++;
            if (stableStreak >= requiredStableSamples) {
                return current;
            }
        } else {
            stableStreak = 1;
        }
        previous = current;
    }

    return previous;
}

/**
 * Waits until `#storybook-root`'s subtree has produced no DOM mutations
 * (childList, attributes, or character data - anywhere in the subtree) for
 * a continuous `quietWindowMs`, or until `timeoutMs` elapses, whichever
 * comes first. Never rejects - a timeout just means the caller proceeds to
 * its own (bounded) sampling loop instead of trusting this gate alone.
 *
 * This directly targets the root cause behind the WellLogViewer/Scroller
 * flake: a `ResizeObserver` callback repeatedly writes inline `style`
 * attributes as it converges on a final layout size, with no CSS animation
 * or Web Animations API entry involved - so it is invisible to any
 * animation-based wait, but is exactly what a `MutationObserver` sees.
 * Cheap relative to screenshot/DOM-string sampling, so running it first
 * lets the more expensive stage 2 sampling only start once the page is
 * already quiet.
 */
async function waitForMutationQuiescence(
    page: Page,
    { quietWindowMs, timeoutMs }: { quietWindowMs: number; timeoutMs: number }
): Promise<void> {
    await page.evaluate(
        ({ quietWindowMs, timeoutMs }) => {
            return new Promise<void>((resolve) => {
                const root = document.getElementById("storybook-root");
                if (!root) {
                    resolve();
                    return;
                }

                let quietTimer: ReturnType<typeof setTimeout>;
                const overallTimer = setTimeout(() => {
                    observer.disconnect();
                    clearTimeout(quietTimer);
                    resolve();
                }, timeoutMs);

                const finish = () => {
                    clearTimeout(overallTimer);
                    observer.disconnect();
                    resolve();
                };

                const observer = new MutationObserver(() => {
                    clearTimeout(quietTimer);
                    quietTimer = setTimeout(finish, quietWindowMs);
                });

                observer.observe(root, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true,
                });

                // Arm the quiet timer immediately too, in case there are no
                // further mutations at all after this point.
                quietTimer = setTimeout(finish, quietWindowMs);
            });
        },
        { quietWindowMs, timeoutMs }
    );
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
async function screenshotWithRetry(
    page: Page,
    attempts = 4,
    retryDelay = 250
): Promise<Buffer> {
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

            // Give the CDP session a brief moment to recover before
            // retrying - retrying instantly back-to-back doesn't reliably
            // clear the transient error, since the compositor may still be
            // mid-frame from the previous attempt.
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }
    }

    throw lastError;
}

const screenshotTest = async (page: Page, context: TestContext) => {
    // No cheap in-page signal (canvas/WebGL content doesn't produce DOM
    // mutations), so stability relies entirely on requiring several
    // consecutive identical screenshots. requiredStableSamples=5 at a
    // 500ms poll demands a continuous ~2s stable window, comfortably above
    // the longest observed mid-render plateau (~750ms, on a camera-control
    // story) - a 2-sample check does not.
    const screenshot = await waitUntilStable(
        () => screenshotWithRetry(page),
        (a, b) => a.equals(b),
        { maxAttempts: 20, poll: 500, requiredStableSamples: 5 }
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
    // Some stories render their DOM in multiple passes (e.g. a
    // ResizeObserver-driven layout feedback loop that converges gradually
    // over ~2s via repeated inline-style writes, with no CSS animation or
    // Web Animations API entry involved). First wait for the subtree to go
    // quiet (cheap), then require several consecutive identical samples
    // (not just 2) so a mid-ramp plateau can't be mistaken for the final
    // state - mirroring the stability loop used by screenshotTest above.
    await waitForMutationQuiescence(page, {
        quietWindowMs: 750,
        timeoutMs: 5000,
    });

    const html = await waitUntilStable(
        async () => {
            const elementHandler = await page.$("#storybook-root");
            return elementHandler ? await elementHandler.innerHTML() : "";
        },
        (a, b) => a === b,
        { maxAttempts: 20, poll: 500, requiredStableSamples: 5 }
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
