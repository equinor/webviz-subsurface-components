import type { Decorator, Preview } from "@storybook/react-webpack5";
import { MotionGlobalConfig } from "motion/react";

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
    }
}

const withMotionTestOverride: Decorator = (Story) => {
    MotionGlobalConfig.skipAnimations = Boolean(
        typeof window !== "undefined" && window.__WEBVIZ_SKIP_MOTION__
    );

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

    decorators: [withMotionTestOverride],
};

export default preview;
