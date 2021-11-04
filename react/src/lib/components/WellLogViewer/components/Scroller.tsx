import React, { Component, ReactNode } from "react";

function getScrollbarSizes(): { vertical: number; horizontal: number } {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    //!!! commented to avoid error TS2339: Property 'msOverflowStyle' does not exist on type 'CSSStyleDeclaration'.
    //!!! outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    /* Old variant
    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);
    // Calculating difference between container's full width and the child width
    const vertical = outer.offsetWidth - inner.offsetWidth; // vertical scrollbar
    const horizontal = outer.offsetHeight - inner.offsetHeight; // horizontal scrollbar
    */

    // New variant: scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    const vertical = outer.offsetWidth - outer.clientWidth;
    const horizontal = outer.offsetHeight - outer.clientHeight;

    // Removing temporary elements from the DOM
    document.body.removeChild(outer);

    return { vertical, horizontal };
}

interface Props {
    width: number;
    height: number;
    onScroll: (x: number, y: number) => void;
}
interface State {
    width: number;
    height: number;
}

class Scroller extends Component<Props, State> {
    scroller?: HTMLDivElement | null; // Outer
    scrollable: HTMLDivElement | null; // Inner
    resizeObserver: ResizeObserver;

    constructor(props: Props) {
        super(props);
        this.scroller = null;
        this.scrollable = null;

        this.state = {
            width: this.props.width,
            height: this.props.height,
        };

        this.onScroll = this.onScroll.bind(this);

        this.resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.target) {
                const Width = (entry.target as HTMLElement).offsetWidth;//getBoundingClientRect().width;
                const Height = (entry.target as HTMLElement).offsetHeight;//getBoundingClientRect().height;
                console.log("resizeObserver width, height=", Width, Height);

                this.setState({
                    width: Width,
                    height: Height,
                });
            }
        });
    }
    componentDidMount(): void {
        console.log("componentDidMount", this.scroller);
        if (this.scroller) this.resizeObserver.observe(this.scroller);
    }
    componentWillUnmount(): void {
        if (this.scroller) this.resizeObserver.unobserve(this.scroller);
    }

    onScroll(): void {
        // callback from HTML element
        const elOuter = this.scroller;
        if (!elOuter) return;

        const scrollTop = elOuter.scrollTop;
        const scrollHeight = elOuter.scrollHeight - elOuter.clientHeight;
        const scrollLeft = elOuter.scrollLeft;
        const scrollWidth = elOuter.scrollWidth - elOuter.clientWidth;

        // compute fractions
        const x = scrollWidth ? scrollLeft / scrollWidth : 0;
        const y = scrollHeight ? scrollTop / scrollHeight : 0;
        console.log("from HTML scrollbars x=" + x + " y=" + y);

        this.props.onScroll(x, y); // notify parent
    }
    scrollTo(x: number, y: number): void {
        console.log("Scroller.scrollTo(" + x + "," + y + ")");
        if (x < 0.0) x = 0.0;
        else if (x > 1.0) x = 1.0;
        if (y < 0.0) y = 0.0;
        else if (y > 1.0) y = 1.0;

        const elOuter = this.scroller;
        if (!elOuter) return;

        let scrollLeft = x * (elOuter.scrollWidth - elOuter.clientWidth);
        let scrollTop = y * (elOuter.scrollHeight - elOuter.clientHeight);
        scrollLeft = Math.round(scrollLeft);
        scrollTop = Math.round(scrollTop);

        const { vertical, horizontal } = getScrollbarSizes();
        const widthOuter = elOuter.getBoundingClientRect().width - vertical;
        const heightOuter = elOuter.getBoundingClientRect().height - horizontal;

        const elInner = this.scrollable;
        if (!elInner) return;
        const widthInner = elInner.offsetWidth; //getBoundingClientRect().width;
        const heightInner = elInner.offsetHeight; //getBoundingClientRect().height;

        let left = x * (widthInner - widthOuter);
        let top = y * (heightInner - heightOuter);
        left = Math.round(left);
        top = Math.round(top);

        left = scrollLeft;
        top = scrollTop;

        if (elOuter.scrollLeft !== left || elOuter.scrollTop !== top) {
            console.log("elOuter.scrollTo(" + left + "," + top + ")");
            elOuter.scrollTo(left, top); //elOuter.scrollLeft = left; elOuter.scrollTop = top;
        }
    }
    zoom(xZoom: number, yZoom: number): void {
        console.log("Scroller.zoom(" + xZoom + "," + yZoom + ")");

        const elOuter = this.scroller;
        if (!elOuter) return;

        const elInner = this.scrollable;
        if (!elInner) return;

        const { vertical, horizontal } = getScrollbarSizes();

        const widthOuter = elOuter.getBoundingClientRect().width - vertical;
        const heightOuter = elOuter.getBoundingClientRect().height - horizontal;

        const widthInner = widthOuter * xZoom + "px";
        const heightInner = heightOuter * yZoom + "px";

        if (
            elInner.style.width !== widthInner &&
            elInner.style.height !== heightInner
        ) {
            console.log(
                "elOuter.elInner.width,height(" +
                    widthInner +
                    "," +
                    heightInner +
                    ")"
            );
            elInner.style.width = widthInner;
            elInner.style.height = heightInner;
        }
    }

    render(): ReactNode {
        const Width = this.state.width;
        const Height = this.state.height;
        const { vertical, horizontal } = getScrollbarSizes();

        const width = Width - vertical;
        const height = Height - horizontal;

        console.log("Scroller.render Width, Weight=", Width, Height);
        return (
            <div
                style={{ overflow: "scroll", width: "100%", height: "100%" }}
                ref={(el) => (this.scroller = el as HTMLDivElement)}
                onScroll={this.onScroll}
            >
                <div ref={(el) => (this.scrollable = el as HTMLDivElement)}>
                    <div
                        style={{
                            position: "absolute",
                            width: width + "px",
                            height: height + "px",
                        }}
                    >
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default Scroller;
