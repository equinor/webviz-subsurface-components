import React, { Component } from "react";

export interface ViewerLayout<Parent> {
    header?: JSX.Element | ((parent: Parent) => JSX.Element);
    left?: JSX.Element | ((parent: Parent) => JSX.Element);
    right?: JSX.Element | ((parent: Parent) => JSX.Element);
    top?: JSX.Element | ((parent: Parent) => JSX.Element);
    bottom?: JSX.Element | ((parent: Parent) => JSX.Element);
    footer?: JSX.Element | ((parent: Parent) => JSX.Element);
}

export interface Props<Parent> {
    parent: Parent;

    center?: JSX.Element | ((parent: Parent) => JSX.Element);

    layout?: ViewerLayout<Parent>;
}

const styleHeaderFooter = { flex: "0", width: "100%" };
const styleTopBottom = { flex: "0" };
const styleLeftRight = { flex: "0", height: "100%" };

export class WellLogLayout<Parent> extends Component<Props<Parent>> {
    constructor(props: Props<Parent>) {
        super(props);
    }

    createPanel(
        panel?: JSX.Element | ((parent: Parent) => JSX.Element)
    ): JSX.Element | null {
        if (typeof panel == "function") return panel(this.props.parent);
        if (typeof panel == "object") return panel; // JSX.Element
        return null;
    }

    render(): JSX.Element {
        const center = this.createPanel(this.props.center);

        let header: JSX.Element | null;
        let left: JSX.Element | null;
        let right: JSX.Element | null;
        let top: JSX.Element | null;
        let bottom: JSX.Element | null;
        let footer: JSX.Element | null;
        const layout = this.props.layout;
        if (!layout) {
            // use default empty layout
            header = null;
            left = null;
            right = null; //this.createPanel(this.props.defaultSidePanel);
            top = null;
            bottom = null;
            footer = null;
        } else {
            header = this.createPanel(layout.header);
            left = this.createPanel(layout.left);
            right = this.createPanel(layout.right);
            top = this.createPanel(layout.top);
            bottom = this.createPanel(layout.bottom);
            footer = this.createPanel(layout.footer);
        }

        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {header && <div style={styleHeaderFooter}>{header}</div>}
                <div
                    style={{
                        flex: "1",
                        height: "0%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    {left && <div style={styleLeftRight}>{left}</div>}
                    <div
                        style={{
                            flex: "1",
                            height: "100%",
                            width: "0%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {top && <div style={styleTopBottom}>{top}</div>}
                        {center /* The main view component */}
                        {bottom && <div style={styleTopBottom}>{bottom}</div>}
                    </div>
                    {right && <div style={styleLeftRight}>{right}</div>}
                </div>
                {footer && <div style={styleHeaderFooter}>{footer}</div>}
            </div>
        );
    }
}

export default WellLogLayout;
