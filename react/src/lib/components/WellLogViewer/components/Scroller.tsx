import React, { Component, ReactNode } from "react";

interface Props {
    zoomX?: number;
    zoomY?: number;

    x: number; // fraction
    y: number; // fraction
    onScroll: (x: number, y: number) => void;
}

function getScrollbarSizes(): { vertical: number; horizontal: number } {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // forcing scrollbar to appear
    //!!! commented to avoid error TS2339: Property 'msOverflowStyle' does not exist on type 'CSSStyleDeclaration'.
    //!!! outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const vertical = outer.offsetWidth - inner.offsetWidth; // vertical scrollbar
    const horizontal = outer.offsetHeight - inner.offsetHeight; // horizontal scrollbar

    // Removing temporary elements from the DOM
    document.body /*outer.parentNode*/
        .removeChild(outer);

    return {
        vertical,
        horizontal,
    };
}

class Scroller extends Component<Props> {
    scroller: React.RefObject<HTMLInputElement>;
    scrollable: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        this.scroller = React.createRef();
        this.scrollable = React.createRef();

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount(): void {
        //this.scrollTo(this.props.x, this.props.y);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.x !== prevProps.x || this.props.y !== prevProps.y) {
            this.scrollTo(this.props.x, this.props.y);
        }
    }

    onScroll(): void {
        // callback from HTML element
        const el = this.scroller.current as HTMLElement;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const scrollLeft = el.scrollLeft;
        const scrollWidth = el.scrollWidth - el.clientWidth;
        /*
        console.log(
            "scrollTop=" +
                scrollTop +
                " scrollLeft=" +
                scrollLeft +
                " scrollHeight=" +
                scrollHeight +
                " scrollWidth=" +
                scrollWidth
        );
        */
        // compute fractions
        const x = scrollWidth ? scrollLeft / scrollWidth : 0;
        const y = scrollHeight ? scrollTop / scrollHeight : 0;
        console.log("from scrollbars x=" + x + " y=" + y);

        this.props.onScroll(x, y); // notify parent
        /*
        scrollTo(this.logController, this.props.horizontal ? f2 : f1)
        const posMax = this._scrollPosMax();
        //let pos = this.props.horizontal ? scrollTop: scrollLeft;
        let pos = (this.props.horizontal ? f1 : f2) * posMax;
        console.log("pos=" + pos, "horizontal=" + this.props.horizontal)
        this.scrollTo(pos)
        */
    }

    scrollTo(x: number, y: number): void {
        console.log("scrollTo(" + x + "," + y + ")");
        if (x < 0.0) x = 0.0;
        if (x > 1.0) x = 1.0;
        if (y < 0.0) y = 0.0;
        if (y > 1.0) y = 1.0;

        const { vertical, horizontal } = getScrollbarSizes();
        const el = this.scroller.current as HTMLElement;
        const width = el.getBoundingClientRect().width;
        const height = el.getBoundingClientRect().height;

        const el2 = this.scrollable.current as HTMLElement;
        const width2 = el2.getBoundingClientRect().width + vertical;
        const height2 = el2.getBoundingClientRect().height + horizontal;

        //console.log("el.scroll=", el.scrollLeft, el.scrollTop);
        let left = x * (width2 - width);
        let top = y * (height2 - height);
        left = Math.round(left);
        top = Math.round(top);

        if (el.scrollLeft !== left || el.scrollTop !== top) {
            //console.log(left, top);
            el.scrollLeft = left;
            el.scrollTop = top;
        }
    }

    render(): ReactNode {
        const { vertical, horizontal } = getScrollbarSizes();
        const Width = 1165;
        const Height = 390;

        const width = Width - vertical;
        const height = Height - horizontal;

        const wZ = this.props.zoomX ? this.props.zoomX : 1;
        const hZ = this.props.zoomY ? this.props.zoomY : 1;

        const width2 = width * wZ;
        const height2 = height * hZ;

        //const left = this.props.x * (width2 - width);
        //const top = this.props.y * (height2 - height);
        //console.log("render scrollTo(" + left + "," + top + ")", wZ, hZ);
        //console.log("Scroller render zoom=", wZ, hZ);
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    style={{
                        overflow: "scroll",
                        width: Width + "px",
                        height: Height + "px",
                    }}
                    ref={this.scroller}
                    onScroll={this.onScroll}
                >
                    <div
                        style={{
                            /*left: -left + "px",
                            top: -top + "px",*/
                            width: width2 + "px",
                            height: height2 + "px",
                        }}
                        ref={this.scrollable}
                    >
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
            </div>
        );
    }
}

export default Scroller;
