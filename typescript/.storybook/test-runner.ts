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
 *
 * When `maxAttempts` is exhausted without ever reaching
 * `requiredStableSamples`, this previously returned the last sample with no
 * signal that stabilization had failed - a mid-render capture and a
 * genuinely-settled-but-different-from-baseline capture were
 * indistinguishable from the failure message alone. `stabilized` makes that
 * visible: callers should log it (or fold it into their assertion failure
 * message) so a future silent mid-render capture is self-explaining instead
 * of appearing as an unexplained diff. Deliberately *not* turned into an
 * automatic failure here - a story that never fully settles but still
 * matches its baseline passes today, and this must not regress that.
 */
async function waitUntilStable<T>(
    sample: () => Promise<T>,
    isEqual: (a: T, b: T) => boolean,
    {
        maxAttempts,
        poll,
        requiredStableSamples = 2,
    }: { maxAttempts: number; poll: number; requiredStableSamples?: number }
): Promise<{ value: T; stabilized: boolean }> {
    let previous: T = await sample();
    let stableStreak = 1;

    for (let attempt = 1; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, poll));

        const current = await sample();
        if (isEqual(current, previous)) {
            stableStreak++;
            if (stableStreak >= requiredStableSamples) {
                return { value: current, stabilized: true };
            }
        } else {
            stableStreak = 1;
        }
        previous = current;
    }

    return { value: previous, stabilized: false };
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

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    // eslint-disable-next-line no-var
    var __STORYBOOK_ADDONS_CHANNEL__:
        | {
              once: (event: string, listener: () => void) => void;
              emit: (event: string, payload: unknown) => void;
          }
        | undefined;
}

// Tracks how many times postVisit has run for each story id, so a jest
// retry (`jest.retryTimes` below) can be detected and handled differently
// from a story's first attempt. Module-scope state is safe here because
// the test-runner reuses one page/module per worker process across all
// stories in a file, and each story id only overlaps with itself across
// retries (never concurrently, since Jest retries a failed test in place
// before moving on).
const postVisitAttempts = new Map<string, number>();

/**
 * Storybook's `setCurrentStory` channel event (what `__test` in
 * `@storybook/test-runner` uses to navigate to a story) re-renders the
 * currently-mounted story *in place* when passed the same story id - it
 * does not tear down and recreate the DOM. That means a Jest retry of a
 * failed story reuses the exact same DOM nodes as the first attempt: any
 * failure caused by a mount-time artifact (e.g. non-deterministic
 * attribute-insertion order, observed once on
 * `WellLogViewer/Demo/SyncLogViewer`) reproduces byte-for-byte on every
 * retry, making `jest.retryTimes` a no-op for that whole class of flake.
 *
 * `forceRemount` is the channel event Storybook's own toolbar "remount"
 * button uses - it genuinely tears down and rebuilds the story's DOM.
 * Emitting it before a retry's assertions run gives the retry a real
 * second chance instead of re-asserting identical bytes. Never rejects -
 * this is a best-effort improvement to retries, not a correctness
 * requirement, so a timeout just means the retry proceeds against
 * whatever is already on the page.
 *
 * Deliberately called **at most once per story** (see the `attempts === 2`
 * check at the call site), not on every retry. Remounting resets any
 * in-flight `ResizeObserver` convergence (see `waitForMutationQuiescence`)
 * back to its unmeasured starting state, so a slow-settling story has to
 * redo its *entire* settle ramp after every remount. Under sustained CI
 * contention that ramp can take much longer than the bounded stability
 * wait's budget (observed 10x+ slowdown under CPU throttling) - repeatedly
 * resetting it on every retry would then fail every attempt identically,
 * for a *different* reason than the flake this exists to fix. Remounting
 * once still gives mount-time non-determinism a fresh, independent draw,
 * while leaving any later retries free to simply keep observing the same
 * (already remounted) story as it continues settling - accumulating real
 * wall-clock time across attempts instead of restarting the clock.
 */
async function forceRemount(page: Page, storyId: string): Promise<void> {
    await page
        .evaluate((id) => {
            return new Promise<void>((resolve) => {
                const channel = globalThis.__STORYBOOK_ADDONS_CHANNEL__;
                if (!channel) {
                    resolve();
                    return;
                }

                const timer = setTimeout(resolve, 15000);
                channel.once("storyRendered", () => {
                    clearTimeout(timer);
                    resolve();
                });
                channel.emit("forceRemount", { storyId: id });
            });
        }, storyId)
        .catch(() => {
            // Best-effort only - if this throws (e.g. the page navigated
            // away), just proceed with the retry as-is.
        });
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
    const { value: screenshot, stabilized } = await waitUntilStable(
        () => screenshotWithRetry(page),
        (a, b) => a.equals(b),
        { maxAttempts: 20, poll: 500, requiredStableSamples: 5 }
    );

    if (!stabilized) {
        // Not a failure by itself (see waitUntilStable's doc comment) -
        // but if the image-snapshot assertion below does fail, this line
        // in the test output explains *why* a diff might exist: the
        // capture may be a mid-render frame rather than the story's true
        // final state.
        // eslint-disable-next-line no-console
        console.warn(
            `[${context.id}] screenshotTest: never reached ${5} consecutive ` +
                `stable samples within the poll budget - the captured ` +
                `screenshot may not reflect the story's fully-settled state.`
        );
    }

    expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: context.id,
        // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
        failureThreshold: 0.01,
        failureThresholdType: "percent",
        // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
        customDiffConfig,
    });
};

/**
 * `WellLogViewer`'s gradient-fill legend (`gradientfill-plot-legend.ts`)
 * generates each `<linearGradient>`'s `id` from a module-scope counter
 * (`"grad" + ++__idGradient`) that is never reset and is shared by every
 * story rendered on the page before this one - including, notably, the
 * stories embedded in this component's own auto-generated Storybook Docs
 * page (`tags: ["autodocs"]` in preview.tsx), which is visited before any
 * individual story's dedicated test and silently consumes a variable
 * number of ids depending on test order/sharding/retries. Confirmed
 * empirically: a story's own gradients are always created once, in a
 * fixed, self-consistent, sequential run (e.g. `grad31,32,33` with the
 * `id` and every `url(#...)` reference matching), but the *starting*
 * number is not a property of the story at all - only unrelated
 * page/test-execution history. That makes the raw id unstable across
 * environments/CI runs (observed drifting from `grad86` to `grad152`
 * between two CI runs of the exact same story) despite being internally
 * consistent within any one render.
 *
 * Renumbering sequentially in document order (first occurrence order)
 * removes that dependency while still asserting everything that matters:
 * every `id="gradN"` and its matching `fill="url(#gradN)"` reference are
 * rewritten together, so a real wiring bug (wrong/missing/misordered
 * gradient reference) still fails the snapshot - only the meaningless
 * absolute number is discarded.
 */
function normalizeGradientIds(html: string): string {
    const idMap = new Map<string, string>();
    let nextId = 1;
    return html.replace(/grad(\d+)/g, (_match, num: string) => {
        let mapped = idMap.get(num);
        if (!mapped) {
            mapped = `grad${nextId++}`;
            idMap.set(num, mapped);
        }
        return mapped;
    });
}

const domSnapshotTest = async (page: Page, context: TestContext) => {
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

    const { value: html, stabilized } = await waitUntilStable(
        async () => {
            const elementHandler = await page.$("#storybook-root");
            const raw = elementHandler ? await elementHandler.innerHTML() : "";
            // Normalized before the stability comparison too, so that
            // incidental gradient-id churn between polls (e.g. an
            // unrelated render happening on the shared page) can't be
            // mistaken for the section itself being unstable.
            return normalizeGradientIds(raw);
        },
        (a, b) => a === b,
        { maxAttempts: 20, poll: 500, requiredStableSamples: 5 }
    );

    if (!stabilized) {
        // See screenshotTest's identical warning - not a failure by
        // itself, but explains a subsequent snapshot mismatch as a
        // possible mid-render capture rather than an unexplained diff.
        // eslint-disable-next-line no-console
        console.warn(
            `[${context.id}] domSnapshotTest: never reached ${5} consecutive ` +
                `stable samples within the poll budget - the captured HTML ` +
                `may not reflect the story's fully-settled state.`
        );
    }

    expect(html).toMatchSnapshot();
};

const config: TestRunnerConfig = {
    setup() {
        jest.retryTimes(3);

        expect.extend({ toMatchImageSnapshot });
    },

    async preVisit(page) {
        // Tell preview.tsx's motion decorator to skip Framer Motion
        // animations for this story, and its color-counter decorator to
        // reset generateColor()'s shared palette index before rendering.
        // Set here (rather than read once at module load) because the
        // test-runner navigates to iframe.html a single time in its
        // `prepare` step and reuses that page for every story -
        // preview.tsx's module body runs before any preVisit hook, so a
        // flag read at import time would always be stale.
        await page.evaluate(() => {
            window.__WEBVIZ_SKIP_MOTION__ = true;
            window.__WEBVIZ_RESET_COLOR_COUNTER__ = true;
        });
    },

    async postVisit(page, context) {
        const storyContext = await getStoryContext(page, context);

        if (storyContext.tags.includes("no-test")) {
            return;
        }

        // If this is the *first* jest.retryTimes retry for this story
        // (postVisit already ran once, and failed), force a fresh remount
        // before asserting anything. Without this, the retry re-renders in
        // place and reasserts the exact same DOM/pixels as the failed
        // attempt - see the forceRemount doc comment above for why that
        // makes retries a no-op for mount-time flakes. Only done once
        // (attempts === 2, not attempts > 1) - see forceRemount's doc
        // comment for why repeating it on every retry would be
        // counterproductive for slow-settling stories.
        const attempts = (postVisitAttempts.get(context.id) ?? 0) + 1;
        postVisitAttempts.set(context.id, attempts);
        if (attempts === 2) {
            await forceRemount(page, context.id);
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
