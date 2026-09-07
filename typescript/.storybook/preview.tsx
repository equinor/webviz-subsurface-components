import type { Decorator, Preview } from "@storybook/react-webpack5";
import { MotionGlobalConfig } from "motion/react";

import { resetColorGenerator } from "../packages/well-log-viewer/src/utils/generateColor";

declare global {
    interface Window {
        /**
         * Test-only flag set by the test-runner's `preVisit` before each
         * story visit. Skips Framer Motion animations so screenshot/DOM
         * assertions run against a settled frame rather than an in-flight
         * animation. Deliberately not driven by `prefers-reduced-motion`,
         * which would also affect manual Storybook browsing and
         * misrepresent the real, motion-enabled component.
         */
        __WEBVIZ_SKIP_MOTION__?: boolean;

        /**
         * Test-only flag set by the test-runner's `preVisit` before each
         * story visit. Resets `generateColor`'s shared palette counter so a
         * story's colors depend only on its own template, not on unrelated
         * calls earlier in the same test run.
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
