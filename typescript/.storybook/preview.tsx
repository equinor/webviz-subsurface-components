import type { Decorator, Preview } from "@storybook/react-webpack5";
import { MotionGlobalConfig } from "motion/react";

import { resetColorGenerator } from "../packages/well-log-viewer/src/utils/generateColor";

declare global {
    interface Window {
        /**
         * Test-only flag set by the Storybook test-runner (see
         * `.storybook/test-runner.ts`, `preVisit`) before each story is
         * visited. When set, Framer Motion animations are skipped so that
         * screenshot and DOM snapshot assertions run against a settled
         * frame instead of racing an in-flight spring animation (this is
         * what made the `GroupTreePlot` stories intermittently fail with
         * `Page.captureScreenshot` protocol errors).
         *
         * Deliberately *not* driven by `prefers-reduced-motion`: gating on
         * that media query would also disable animations for anyone
         * manually browsing Storybook with that OS setting enabled, which
         * would misrepresent the real, motion-enabled component behaviour.
         * This flag is only ever set by Playwright, so manual Storybook use
         * is unaffected.
         */
        __WEBVIZ_SKIP_MOTION__?: boolean;

        /**
         * Test-only flag set by the Storybook test-runner (see
         * `.storybook/test-runner.ts`, `preVisit`) before each story is
         * visited. When set, `generateColor`'s shared palette counter
         * (`packages/well-log-viewer/src/utils/generateColor.ts`) is reset
         * before the story renders, so a story's auto-assigned legend
         * colors depend only on its own template, not on how many other
         * stories/templates called `generateColor()` earlier in the same
         * test file or worker (the same page/test-execution-history
         * dependency documented for gradient ids in
         * `normalizeGradientIds`, but for colors rather than ids).
         *
         * Only ever set by Playwright: real embedding applications, and
         * anyone manually browsing Storybook, never see this flag, so
         * `generateColor()`'s real, session-shared counter behaviour is
         * unaffected outside of tests.
         */
        __WEBVIZ_RESET_COLOR_COUNTER__?: boolean;
    }
}

const withMotionTestOverride: Decorator = (Story) => {
    MotionGlobalConfig.skipAnimations = Boolean(
        typeof window !== "undefined" && window.__WEBVIZ_SKIP_MOTION__
    );

    return Story();
};

const withColorCounterTestReset: Decorator = (Story) => {
    if (
        typeof window !== "undefined" &&
        window.__WEBVIZ_RESET_COLOR_COUNTER__
    ) {
        resetColorGenerator();
    }

    return Story();
};

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        docs: {
            story: {
                height: "500px",
            },

            codePanel: true,
        },
    },

    tags: ["autodocs"],

    decorators: [withMotionTestOverride, withColorCounterTestReset],
};

export default preview;
