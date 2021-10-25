import React, { Component, ReactNode } from "react";

interface Props {
    xZoom?: number;
    yZoom?: number;

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

    /*
    // Creating inner element and placing it in the container
    const inner = document.createElement("div");
    outer.appendChild(inner);
    // Calculating difference between container's full width and the child width
    const vertical = outer.offsetWidth - inner.offsetWidth; // vertical scrollbar
    const horizontal = outer.offsetHeight - inner.offsetHeight; // horizontal scrollbar

    */
    //scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    const vertical = outer.offsetWidth - outer.clientWidth 
    const horizontal = outer.offsetHeight - outer.clientHeight

    // Removing temporary elements from the DOM
    document.body.removeChild(outer);

    return { vertical, horizontal };
}

class Scroller extends Component<Props> {
    scroller: React.RefObject<HTMLInputElement>;  // Outer
    scrollable: React.RefObject<HTMLInputElement>; // Inner

    constructor(props: Props) {
        super(props);
        this.scroller = React.createRef();
        this.scrollable = React.createRef();

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.x !== prevProps.x || this.props.y !== prevProps.y) {
            this.scrollTo(this.props.x, this.props.y);
        }
    }

    onScroll(): void { // callback from HTML element
        const el = this.scroller.current as HTMLElement;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const scrollLeft = el.scrollLeft;
        const scrollWidth = el.scrollWidth - el.clientWidth;
        
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
        
        // compute fractions
        const x = scrollWidth ? scrollLeft / scrollWidth : 0;
        const y = scrollHeight ? scrollTop / scrollHeight : 0;
        console.log("from HTML scrollbars x=" + x + " y=" + y);

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
        console.log("Scroller.scrollTo(" + x + "," + y + ")");
        if (x < 0.0) x = 0.0; else if (x > 1.0) x = 1.0;
        if (y < 0.0) y = 0.0; else if (y > 1.0) y = 1.0;

        
            const el = this.scroller.current as HTMLElement;
            let scrollLeft = x * (el.scrollWidth - el.clientWidth) 
            let scrollTop = y * (el.scrollHeight - el.clientHeight)
        scrollLeft = Math.round(scrollLeft);
        scrollTop = Math.round(scrollTop);
        

        const { vertical, horizontal } = getScrollbarSizes();
        const elOuter = this.scroller.current as HTMLElement;
        const widthOuter = elOuter.getBoundingClientRect().width - vertical;
        const heightOuter = elOuter.getBoundingClientRect().height - horizontal;

        const elInner = this.scrollable.current as HTMLElement;
        const widthInner = elInner.offsetWidth//getBoundingClientRect().width;
        const heightInner = elInner.offsetHeight//getBoundingClientRect().height;

        //console.log("el.scroll=", el.scrollLeft, el.scrollTop);
        let left = x * (widthInner - widthOuter);
        let top = y * (heightInner - heightOuter);
        left = Math.round(left);
        top = Math.round(top);

        console.log("left, top=", scrollLeft, scrollTop);
        console.log("left, top=", left, top);
        left = scrollLeft;
        top = scrollTop;

        if (elOuter.scrollLeft !== left || elOuter.scrollTop !== top) {
            console.log("elOuter.scrollTo("+left+","+top+")");
            elOuter.scrollTo(left, top) //elOuter.scrollLeft = left; elOuter.scrollTop = top;
        }
    }

    render(): ReactNode {
        const { vertical, horizontal } = getScrollbarSizes();
        const Width = 1165;
        const Height = 390;

        const width = Width - vertical;
        const height = Height - horizontal;

        const xZoom = this.props.xZoom ? this.props.xZoom : 1;
        const yZoom = this.props.yZoom ? this.props.yZoom : 1;

        const widthInner = width * xZoom;
        const heightInner = height * yZoom;

        let left = this.props.x * (widthInner - width);
        let top = this.props.y * (heightInner - height);
        left = Math.round(left);
        top = Math.round(top);
        console.log("render scrollTo(" + left + "," + top + ")", xZoom, yZoom);
        //console.log("Scroller render zoom=", xZoom, yZoom);
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
                            width: widthInner + "px",
                            height: heightInner + "px",
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
