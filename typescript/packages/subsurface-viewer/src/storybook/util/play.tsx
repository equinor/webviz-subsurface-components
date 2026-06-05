import { fireEvent, userEvent } from "storybook/test";

/**
 * Shared utilities for Storybook `play` functions.
 *
 * @example
 * ```ts
 * export const MyStory: StoryObj = {
 *     play: async () => {
 *         const canvas = await Play.activateCanvas();
 *         if (!canvas) return;
 *         await Play.pick(canvas, { clientX: 100, clientY: 200 });
 *     },
 * };
 * ```
 */
export const Play = {
    /** Base delay in milliseconds used between simulated user interactions. */
    DELAY: 500,

    /**
     * Selects the first `<canvas>` element in the document, clicks it to
     * ensure the SubsurfaceViewer deck.gl canvas has focus, and returns it.
     *
     * @returns The canvas element, or `null` if none is found.
     */
    activateCanvas: async (): Promise<HTMLCanvasElement | null> => {
        const canvas = document.querySelector("canvas");

        if (!canvas) {
            return null;
        }
        await userEvent.click(canvas, { delay: Play.DELAY });
        return canvas;
    },

    /**
     * Simulates a tooltip-triggering hover at the given canvas position.
     *
     * The pointer is first moved to the canvas origin `(0, 0)` to ensure a
     * clean `mouseenter` event before being moved to the target position.
     *
     * @param canvas - The canvas element to interact with.
     * @param position - The target client coordinates to hover over.
     */
    pick: async (
        canvas: HTMLCanvasElement,
        position: { clientX: number; clientY: number }
    ) => {
        await userEvent.hover(canvas, { delay: Play.DELAY });

        await fireEvent.mouseMove(canvas, {
            clientX: 0,
            clientY: 0,
            delay: Play.DELAY,
        });

        await fireEvent.mouseMove(canvas, {
            ...position,
            delay: Play.DELAY,
        });
    },
} as const;
