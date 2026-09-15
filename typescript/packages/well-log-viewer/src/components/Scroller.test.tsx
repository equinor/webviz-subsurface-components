import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import "jest-styled-components";

import Scroller from "./Scroller";

let resizeCallback: ResizeObserverCallback | undefined;

class TestResizeObserver implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
    }

    disconnect(): void {}
    observe(target: Element, options?: ResizeObserverOptions): void {
        void target;
        void options;
    }
    unobserve(target: Element): void {
        void target;
    }
}

beforeEach(() => {
    resizeCallback = undefined;
    globalThis.ResizeObserver = TestResizeObserver;
});

describe("Test scroller", () => {
    it("snapshot test", () => {
        const { container } = render(
            <Scroller onScroll={(x: number, y: number) => [x, y]} />
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("keeps content below native scrollbars", () => {
        const { container } = render(<Scroller />);
        const content = (container.firstChild as HTMLDivElement).firstChild
            ?.firstChild as HTMLDivElement;

        expect(content.style.position).toBe("absolute");
        expect(content.style.zIndex).toBe("-1");
    });

    it("sizes content to the scroller viewport", () => {
        const { container } = render(<Scroller />);
        const scroller = container.firstChild as HTMLDivElement;
        const content = scroller.firstChild?.firstChild as HTMLDivElement;

        Object.defineProperties(scroller, {
            clientWidth: { configurable: true, value: 100 },
            clientHeight: { configurable: true, value: 80 },
        });

        resizeCallback?.(
            [{ target: scroller } as unknown as ResizeObserverEntry],
            {} as ResizeObserver
        );

        expect(content.style.width).toBe("100px");
        expect(content.style.height).toBe("80px");
    });
});
