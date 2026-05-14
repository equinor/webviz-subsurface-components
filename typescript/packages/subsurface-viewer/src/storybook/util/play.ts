import { fireEvent, userEvent } from "@storybook/test";

export const Play = {
    DELAY: 500,

    activateCanvas: async (): Promise<HTMLCanvasElement | null> => {
        const canvas = document.querySelector("canvas");

        if (!canvas) {
            return null;
        }
        await userEvent.click(canvas, { delay: Play.DELAY });
        return canvas;
    },

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
