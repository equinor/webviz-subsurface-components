import type { ReactNode } from "react";
import React, {
    useRef,
    useEffect,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from "react";

function getScrollbarSizes(): { vertical: number; horizontal: number } {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    //!!! commented to avoid error TS2339: Property 'msOverflowStyle' does not exist on type 'CSSStyleDeclaration'.
    //!!! outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    const vertical = outer.offsetWidth - outer.clientWidth;
    const horizontal = outer.offsetHeight - outer.clientHeight;

    // Removing temporary elements from the DOM
    document.body.removeChild(outer);

    return { vertical, horizontal };
}

export interface ScrollerProps {
    /**
     * callback with new scroll positions
     */
    onScroll?: (x: number, y: number) => void;
    children?: ReactNode;
}

export interface ScrollerRef {
    getScrollX(): number;
    getScrollY(): number;
    getScrollPos(vertical: boolean | undefined): number;
    scrollTo(x: number, y: number): boolean;
    zoom(xZoom: number, yZoom: number): boolean;
}

const Scroller = forwardRef<ScrollerRef, ScrollerProps>(
    ({ onScroll, children }, ref) => {
        const scrollerRef = useRef<HTMLDivElement>(null);
        const scrollableRef = useRef<HTMLDivElement>(null);
        const contentRef = useRef<HTMLDivElement>(null);
        const resizeObserverRef = useRef<ResizeObserver | null>(null);

        useEffect(() => {
            if (!resizeObserverRef.current) {
                resizeObserverRef.current = new ResizeObserver(
                    (entries: ResizeObserverEntry[]): void => {
                        const entry = entries[0];
                        if (entry && entry.target) {
                            const Width = (entry.target as HTMLElement)
                                .offsetWidth;
                            const Height = (entry.target as HTMLElement)
                                .offsetHeight;

                            if (contentRef.current) {
                                const { vertical, horizontal } =
                                    getScrollbarSizes();

                                contentRef.current.style.width =
                                    Width - vertical + "px";
                                contentRef.current.style.height =
                                    Height - horizontal + "px";
                            }
                        }
                    }
                );
            }

            const scrollerElem = scrollerRef.current;

            if (scrollerElem && resizeObserverRef.current) {
                resizeObserverRef.current.observe(scrollerElem);
            }

            return () => {
                if (scrollerElem && resizeObserverRef.current) {
                    resizeObserverRef.current.unobserve(scrollerElem);
                }
            };
        }, []);

        /* current position access functions */
        const getScrollX = useCallback((): number => {
            const elOuter = scrollerRef.current;
            if (!elOuter) return 0;
            const scrollWidth = elOuter.scrollWidth - elOuter.clientWidth;
            return scrollWidth ? elOuter.scrollLeft / scrollWidth : 0;
        }, []);

        const getScrollY = useCallback((): number => {
            const elOuter = scrollerRef.current;
            if (!elOuter) return 0;
            const scrollHeight = elOuter.scrollHeight - elOuter.clientHeight;
            return scrollHeight ? elOuter.scrollTop / scrollHeight : 0;
        }, []);

        const getScrollPos = useCallback(
            (vertical: boolean | undefined): number => {
                return vertical ? getScrollY() : getScrollX();
            },
            [getScrollX, getScrollY]
        );

        /**
         * callback from HTML element
         */
        const handleScroll = useCallback((): void => {
            const elOuter = scrollerRef.current;
            if (!elOuter) return;
            // notify parent
            onScroll?.(getScrollX(), getScrollY());
        }, [onScroll, getScrollX, getScrollY]);

        /* functions to externally set zoom and scroll position */

        /**
         * @param x value to set the horizontal beginning of visible part of content (fraction)
         * @param y value to set the vertical beginning of visible part of content (fraction)
         * @returns true if visible part is changed
         */
        const scrollTo = useCallback((x: number, y: number): boolean => {
            if (x < 0.0) x = 0.0;
            else if (x > 1.0) x = 1.0;
            if (y < 0.0) y = 0.0;
            else if (y > 1.0) y = 1.0;

            const elOuter = scrollerRef.current;
            if (!elOuter) return false;

            const scrollLeft = Math.round(
                x * (elOuter.scrollWidth - elOuter.clientWidth)
            );
            const scrollTop = Math.round(
                y * (elOuter.scrollHeight - elOuter.clientHeight)
            );

            if (
                elOuter.scrollLeft !== scrollLeft ||
                elOuter.scrollTop !== scrollTop
            ) {
                elOuter.scrollTo(scrollLeft, scrollTop);
                return true;
            }
            return false;
        }, []);

        /**
         * @param xZoom set X zoom factor of visible part of content
         * @param yZoom set Y zoom factor of visible part of content
         * @returns true if visible part is changed
         */
        const zoom = useCallback((xZoom: number, yZoom: number): boolean => {
            const elOuter = scrollerRef.current;
            if (!elOuter) return false;

            const elInner = scrollableRef.current;
            if (!elInner) return false;

            const widthInner = Math.round(elOuter.clientWidth * xZoom) + "px";
            const heightInner = Math.round(elOuter.clientHeight * yZoom) + "px";

            if (
                elInner.style.width !== widthInner ||
                elInner.style.height !== heightInner
            ) {
                elInner.style.width = widthInner;
                elInner.style.height = heightInner;

                return true;
            }
            return false;
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                getScrollX,
                getScrollY,
                getScrollPos,
                scrollTo,
                zoom,
            }),
            [getScrollX, getScrollY, getScrollPos, scrollTo, zoom]
        );

        return (
            <div
                ref={scrollerRef}
                style={{ overflow: "scroll", width: "100%", height: "100%" }}
                onScroll={handleScroll}
            >
                <div ref={scrollableRef}>
                    <div ref={contentRef} style={{ position: "absolute" }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
);

Scroller.displayName = "Scroller";

export default Scroller;
