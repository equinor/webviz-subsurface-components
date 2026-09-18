import type { ReactNode } from "react";
import type React from "react";
import { Component } from "react";

import "./Scroller.scss";

export interface ScrollerProps {
    /**
     * callback with new scroll positions
     */
    onScroll?: (x: number, y: number) => void;
    children?: ReactNode;
}

class Scroller extends Component<ScrollerProps> {
    scroller: HTMLDivElement | null; // Outer
    scrollable: HTMLDivElement | null; // Inner
    content: HTMLDivElement | null; // Content over inner
    resizeObserver: ResizeObserver;

    constructor(props: ScrollerProps) {
        super(props);
        this.scroller = null;
        this.scrollable = null;
        this.content = null;

        this.resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]): void => {
                const entry = entries[0];
                if (entry && entry.target) {
                    const width = (entry.target as HTMLElement).clientWidth;
                    const height = (entry.target as HTMLElement).clientHeight;

                    if (this.content) {
                        this.content.style.width = width + "px";
                        this.content.style.height = height + "px";
                    }
                }
            }
        );

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount(): void {
        if (this.scroller) this.resizeObserver.observe(this.scroller);
    }
    componentWillUnmount(): void {
        if (this.scroller) this.resizeObserver.unobserve(this.scroller);
    }

    /* current position access functions */
    getScrollX(): number {
        const elOuter = this.scroller;
        if (!elOuter) return 0;
        const scrollWidth = elOuter.scrollWidth - elOuter.clientWidth;
        return scrollWidth ? elOuter.scrollLeft / scrollWidth : 0;
    }
    getScrollY(): number {
        const elOuter = this.scroller;
        if (!elOuter) return 0;
        const scrollHeight = elOuter.scrollHeight - elOuter.clientHeight;
        return scrollHeight ? elOuter.scrollTop / scrollHeight : 0;
    }
    getScrollPos(vertical: boolean | undefined): number {
        return vertical ? this.getScrollY() : this.getScrollX();
    }

    /**
     * callback from HTML element
     */
    onScroll(): void {
        const elOuter = this.scroller;
        if (!elOuter) return;
        // notify parent
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onScroll?.(this.getScrollX(), this.getScrollY());
    }

    /* functions to externally set zoom and scroll position */

    /**
     * @param x value to set the horizontal beginning of visible part of content (fraction)
     * @param y value to set the vertical beginning of visible part of content (fraction)
     * @returns true if visible part is changed
     */
    scrollTo(x: number, y: number): boolean {
        if (x < 0.0) x = 0.0;
        else if (x > 1.0) x = 1.0;
        if (y < 0.0) y = 0.0;
        else if (y > 1.0) y = 1.0;

        const elOuter = this.scroller;
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
    }
    /**
     * @param xZoom set X zoom factor of visible part of content
     * @param yZoom set Y zoom factor of visible part of content
     * @returns true if visible part is changed
     */
    zoom(xZoom: number, yZoom: number): boolean {
        const elOuter = this.scroller;
        if (!elOuter) return false;

        const elInner = this.scrollable;
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
    }

    render(): React.JSX.Element {
        return (
            <div
                ref={(el) => {
                    this.scroller = el as HTMLDivElement;
                }}
                className="well-log-scroller"
                style={{
                    overflow: "scroll",
                    width: "100%",
                    height: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    scrollbarColor: "gray transparent",
                }}
                onScroll={this.onScroll}
            >
                <div
                    ref={(el) => {
                        this.scrollable = el as HTMLDivElement;
                    }}
                >
                    <div
                        ref={(el) => {
                            this.content = el as HTMLDivElement;
                        }}
                        className="well-log-scroller-content"
                        style={{ position: "sticky", top: 0, left: 0 }}
                    >
                        {/* TODO: Fix this the next time the file is edited. */}
                        {/* eslint-disable-next-line react/prop-types */}
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default Scroller;
