import React, { Component, ReactNode } from "react";

interface Props {
    zoomX: number;
    zoomY?: number;

    x: number;
    y: number;
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
        const x = scrollHeight ? scrollTop / scrollHeight : 0;
        const y = scrollWidth ? scrollLeft / scrollWidth : 0;
        console.log("scroller x=" + x + " y=" + y);

        this.props.onScroll(x, y);
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
        const { vertical, horizontal } = getScrollbarSizes();
        const el = this.scroller.current as HTMLElement;
        const width = el.getBoundingClientRect().width;
        const height = el.getBoundingClientRect().height;

        const el2 = this.scrollable.current as HTMLElement;
        const width2 = el2.getBoundingClientRect().width + vertical;
        const height2 = el2.getBoundingClientRect().height + horizontal;
        el2.style.left = -x * (width2 - width) + "px";
        el2.style.top = -y * (height2 - height) + "px";
    }

    render(): ReactNode {
        const { vertical, horizontal } = getScrollbarSizes();
        const width = 1165;
        const height = 390;
        const wZ = this.props.zoomX ? this.props.zoomX : 1;
        const hZ = this.props.zoomY ? this.props.zoomY : 1;

        return (
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    style={{
                        overflow: "scroll",
                        width: width + "px",
                        height: height + "px",
                    }}
                    ref={this.scroller}
                    onScroll={this.onScroll}
                >
                    <div
                        style={{
                            width: (width - vertical) * wZ,
                            height: (height - horizontal) * hZ + "px",
                        }}
                        ref={this.scrollable}
                    >
                        <div
                            style={{
                                position: "absolute",
                                width: width - vertical + "px",
                                height: height - horizontal + "px",
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
