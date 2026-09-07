import { toMatchImageSnapshot } from "jest-image-snapshot";

import type { Page } from "@playwright/test";
import {
    getStoryContext,
    type TestContext,
    type TestRunnerConfig,
} from "@storybook/test-runner";

// https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
const customDiffConfig = {};

// Stability settings for the two waits below. Named and interpolated into
// their warning messages (rather than hardcoded per call site) so tuning
// either never desynchronises the prose from the actual behaviour.
const SCREENSHOT_STABILITY = {
    maxAttempts: 40,
    poll: 500,
    requiredStableSamples: 5,
};
const DOM_STABILITY = { maxAttempts: 20, poll: 500, requiredStableSamples: 5 };

/**
 * Polls `sample()` until `requiredStableSamples` *consecutive* samples are
 * equal (by `isEqual`), or `maxAttempts` is reached, whichever comes first.
 *
 * Exists because some stories settle asynchronously (debounced
 * `ResizeObserver` layout, in-flight animations, etc.) and a screenshot or
 * DOM snapshot taken too early captures a mid-render frame rather than the
 * final state. `requiredStableSamples` defaults to 2 but should be raised
 * for stories whose settling can plateau for a while mid-ramp, long enough
 * to fool a lower count into declaring stability early - see issue #2833
 * for the background investigation.
 *
 * Returns `stabilized: false` (never throws) if the budget runs out first,
 * and `samplesTaken` alongside it - together these let a caller's failure
 * handling distinguish "never stabilized" from "stabilized but still wrong"
 * (see `logStabilityDiagnosticsOnFailure`). Deliberately not turned into an
 * automatic failure here: a story that never fully settles but still
 * matches its baseline should keep passing.
 */
async function waitUntilStable<T>(
    sample: () => Promise<T>,
    isEqual: (a: T, b: T) => boolean,
    {
        maxAttempts,
        poll,
        requiredStableSamples = 2,
    }: { maxAttempts: number; poll: number; requiredStableSamples?: number }
): Promise<{ value: T; stabilized: boolean; samplesTaken: number }> {
    let previous: T = await sample();
    let stableStreak = 1;
    let samplesTaken = 1;

    for (let attempt = 1; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, poll));

        const current = await sample();
        samplesTaken++;
        if (isEqual(current, previous)) {
            stableStreak++;
            if (stableStreak >= requiredStableSamples) {
                return { value: current, stabilized: true, samplesTaken };
            }
        } else {
            stableStreak = 1;
        }
        previous = current;
    }

    return { value: previous, stabilized: false, samplesTaken };
}

/**
 * Logs, on assertion failure only, which of two distinct causes preceded it:
 *
 * - `stabilized: false` - the poll budget ran out before the capture ever
 *   settled. Likely a genuinely slow/contended render; a longer budget or
 *   less CI contention is the applicable fix.
 * - `stabilized: true` with a low `samplesTaken` - the capture was quiet
 *   from the start but still didn't match the baseline: a *stably-wrong*
 *   result (typically a mount-time race), which no amount of extra waiting
 *   can fix - only a fresh mount can (see the `remount-every-retry` tag).
 *
 * Naming the class makes a future failure self-explaining instead of
 * requiring the investigation in issue #2833 to be redone from scratch.
 */
function logStabilityDiagnosticsOnFailure(
    storyId: string,
    testName: string,
    stabilized: boolean,
    samplesTaken: number
): void {
    // eslint-disable-next-line no-console
    console.warn(
        `[${storyId}] ${testName} failed after stabilized=${stabilized}, ` +
            `samplesTaken=${samplesTaken}. ` +
            (stabilized
                ? "The capture never changed across polls but still didn't " +
                  "match the baseline - likely a stably-wrong mount-time " +
                  "race, not a slow render. See the remount-every-retry tag."
                : "The poll budget was exhausted before the capture ever " +
                  "settled - likely a genuinely slow/contended render " +
                  "captured mid-frame.")
    );
}

/**
 * Waits until `#storybook-root`'s subtree has produced no DOM mutations for
 * a continuous `quietWindowMs`, or `timeoutMs` elapses, whichever comes
 * first. Never rejects - a timeout just means the caller proceeds to its
 * own bounded sampling loop instead of trusting this gate alone.
 *
 * Targets layout that converges via repeated inline-style writes (e.g. a
 * `ResizeObserver` callback), which has no CSS animation or Web Animations
 * API entry and so is invisible to any animation-based wait, but is exactly
 * what a `MutationObserver` sees. Cheap relative to screenshot/DOM-string
 * sampling, so running it first lets the more expensive stage-2 sampling
 * only start once the page is already quiet.
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
// from a story's first attempt. Module-scope state is safe here because the
// test-runner reuses one page/module per worker process across all stories
// in a file, and a story id is never visited concurrently with itself.
const postVisitAttempts = new Map<string, number>();

/**
 * Storybook's `setCurrentStory` channel event re-renders the currently
 * mounted story *in place* - it does not tear down and recreate the DOM. A
 * Jest retry of a failed story therefore reuses the exact same DOM as the
 * first attempt, so any mount-time flake reproduces byte-for-byte on every
 * retry, making `jest.retryTimes` a no-op for that class of failure.
 *
 * `forceRemount` is the channel event Storybook's own toolbar "remount"
 * button uses - it genuinely tears down and rebuilds the story's DOM,
 * giving a retry a real second chance. Never rejects: this is a best-effort
 * improvement to retries, not a correctness requirement.
 *
 * Called with two different policies, because two distinct flake shapes
 * need opposite trade-offs (see issue #2833 for both investigations):
 *
 * - **Slow-settling stories** (the default): remount **once**, on the
 *   first retry only. Remounting resets any in-flight settle ramp (see
 *   `waitForMutationQuiescence`), so remounting on *every* retry would
 *   force a slow story to redo its entire ramp each time - under CI
 *   contention that can exceed the stability budget and fail every retry
 *   for a different reason than the original flake. One remount still
 *   gives mount-time non-determinism a fresh draw, while later retries
 *   keep accumulating real settle time instead of restarting it.
 * - **Mount-time-race stories** (opt in via the `"remount-every-retry"`
 *   tag): remount on *every* retry. Here the failure is a *stably-wrong*
 *   result - `waitUntilStable` reports `stabilized: true`, so waiting
 *   longer cannot help; only a fresh mount gives the race a new,
 *   independent draw. This turns `jest.retryTimes(3)`'s retries into
 *   independent draws instead of one draw asserted repeatedly.
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
 * `page.screenshot()` can intermittently throw a CDP "Unable to capture
 * screenshot" error when Chromium's compositor is captured mid-frame
 * (observed mostly on stories with continuously-running animations). This
 * is a transient capture failure, not a rendering problem, so a couple of
 * retries clear it without masking genuine screenshot failures.
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

            // Give the CDP session a brief moment to recover - the
            // compositor may still be mid-frame from the previous attempt.
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }
    }

    throw lastError;
}

const screenshotTest = async (page: Page, context: TestContext) => {
    // No cheap in-page signal for canvas/WebGL content (it produces no DOM
    // mutations), so stability relies entirely on requiring several
    // consecutive identical screenshots - see waitUntilStable's doc comment.
    const {
        value: screenshot,
        stabilized,
        samplesTaken,
    } = await waitUntilStable(
        () => screenshotWithRetry(page),
        (a, b) => a.equals(b),
        SCREENSHOT_STABILITY
    );

    if (!stabilized) {
        // Not a failure by itself - but if the assertion below does fail,
        // this explains a possible cause instead of an unexplained diff.
        // eslint-disable-next-line no-console
        console.warn(
            `[${context.id}] screenshotTest: never reached ` +
                `${SCREENSHOT_STABILITY.requiredStableSamples} consecutive ` +
                `stable samples within the poll budget - the captured ` +
                `screenshot may not reflect the story's fully-settled state.`
        );
    }

    try {
        expect(screenshot).toMatchImageSnapshot({
            customSnapshotIdentifier: context.id,
            // https://www.npmjs.com/package/jest-image-snapshot/v/4.0.2#-api
            failureThreshold: 0.01,
            failureThresholdType: "percent",
            // https://github.com/mapbox/pixelmatch#pixelmatchimg1-img2-output-width-height-options
            customDiffConfig,
        });
    } catch (error) {
        logStabilityDiagnosticsOnFailure(
            context.id,
            "screenshotTest",
            stabilized,
            samplesTaken
        );
        throw error;
    }
};

/**
 * `WellLogViewer`'s gradient-fill legend gives each `<linearGradient>` a
 * plot-instance-scoped id (see `gradientfill-plot-legend.ts`), but a
 * story's own gradients still aren't numbered from zero: Storybook's
 * autodocs page pre-renders every story in a file before that story's own
 * dedicated test visit, consuming some ids first, and how many depends on
 * test order/sharding/retries rather than anything about the story itself
 * (see issue #2833). That makes the raw id unstable across environments/CI
 * runs despite being internally self-consistent within any one render.
 *
 * Renumbering sequentially in first-occurrence order removes that
 * dependency while still asserting everything that matters: every
 * `id="gradN"` and its matching `fill="url(#gradN)"` reference are
 * rewritten together, so a real wiring bug (wrong/missing/misordered
 * reference) still fails the snapshot - only the meaningless absolute
 * number is discarded.
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
    // Some stories render their DOM in multiple passes as layout settles
    // (see waitForMutationQuiescence's doc comment). Wait for the subtree
    // to go quiet first (cheap), then require several consecutive identical
    // samples so a mid-ramp plateau can't be mistaken for the final state -
    // mirroring screenshotTest's stability loop above.
    await waitForMutationQuiescence(page, {
        quietWindowMs: 750,
        timeoutMs: 5000,
    });

    const {
        value: html,
        stabilized,
        samplesTaken,
    } = await waitUntilStable(
        async () => {
            const elementHandler = await page.$("#storybook-root");
            const raw = elementHandler ? await elementHandler.innerHTML() : "";
            // Normalized before the stability comparison too, so incidental
            // gradient-id churn between polls can't be mistaken for the
            // section itself being unstable.
            return normalizeGradientIds(raw);
        },
        (a, b) => a === b,
        DOM_STABILITY
    );

    if (!stabilized) {
        // See screenshotTest's identical warning above.
        // eslint-disable-next-line no-console
        console.warn(
            `[${context.id}] domSnapshotTest: never reached ` +
                `${DOM_STABILITY.requiredStableSamples} consecutive stable ` +
                `samples within the poll budget - the captured HTML may ` +
                `not reflect the story's fully-settled state.`
        );
    }

    try {
        expect(html).toMatchSnapshot();
    } catch (error) {
        logStabilityDiagnosticsOnFailure(
            context.id,
            "domSnapshotTest",
            stabilized,
            samplesTaken
        );
        throw error;
    }
};

const config: TestRunnerConfig = {
    setup() {
        jest.retryTimes(3);

        expect.extend({ toMatchImageSnapshot });
    },

    async preVisit(page) {
        // Tell preview.tsx's test-only decorators to skip Framer Motion
        // animations and reset generateColor()'s shared palette for this
        // story. Set here (rather than read once at module load) because
        // the test-runner navigates once and reuses the page for every
        // story, so a flag read at import time would always be stale.
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

        // Force a fresh remount before a retry's assertions run - see
        // forceRemount's doc comment for the two policies and why they
        // differ per story.
        const attempts = (postVisitAttempts.get(context.id) ?? 0) + 1;
        postVisitAttempts.set(context.id, attempts);
        const remountEveryRetry = storyContext.tags.includes(
            "remount-every-retry"
        );
        if (attempts === 2 || (remountEveryRetry && attempts > 2)) {
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
