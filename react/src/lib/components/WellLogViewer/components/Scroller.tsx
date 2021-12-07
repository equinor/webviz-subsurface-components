import React, { Component, ReactNode } from "react";

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

interface Props {
    onScroll: (x: number, y: number) => void;
}

class Scroller extends Component<Props> {
    scroller: HTMLDivElement | null; // Outer
    scrollable: HTMLDivElement | null; // Inner
    content: HTMLDivElement | null; // Content over inner
    resizeObserver: ResizeObserver;

    constructor(props: Props) {
        super(props);
        this.scroller = null;
        this.scrollable = null;
        this.content = null;

        this.resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.target) {
                const Width = (entry.target as HTMLElement).offsetWidth;
                const Height = (entry.target as HTMLElement).offsetHeight;

                if (this.content) {
                    const { vertical, horizontal } = getScrollbarSizes();

                    this.content.style.width = Width - vertical + "px";
                    this.content.style.height = Height - horizontal + "px";
                }
            }
        });

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount(): void {
        if (this.scroller) this.resizeObserver.observe(this.scroller);
    }
    componentWillUnmount(): void {
        if (this.scroller) this.resizeObserver.unobserve(this.scroller);
    }

    /* 
      callback from HTML element
     */
    onScroll(): void {
        const elOuter = this.scroller;
        if (!elOuter) return;

        const scrollTop = elOuter.scrollTop;
        const scrollHeight = elOuter.scrollHeight - elOuter.clientHeight;
        const scrollLeft = elOuter.scrollLeft;
        const scrollWidth = elOuter.scrollWidth - elOuter.clientWidth;

        // compute fractions
        const x = scrollWidth ? scrollLeft / scrollWidth : 0;
        const y = scrollHeight ? scrollTop / scrollHeight : 0;
        this.props.onScroll(x, y); // notify parent
    }

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

    render(): ReactNode {
        return (
            <div
                ref={(el) => (this.scroller = el as HTMLDivElement)}
                style={{ overflow: "scroll", width: "100%", height: "100%" }}
                onScroll={this.onScroll}
            >
                <div ref={(el) => (this.scrollable = el as HTMLDivElement)}>
                    <div
                        ref={(el) => (this.content = el as HTMLDivElement)}
                        style={{ position: "absolute" }}
                    >
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default Scroller;
