import React, { Component } from "react";

import "./WellLogLayout.scss";

export interface ViewerLayout<Parent> {
    header?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
    left?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
    right?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
    top?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
    bottom?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
    footer?: ((parent: Parent) => JSX.Element) | JSX.Element | string;
}

interface Props<Parent> {
    parent: Parent;

    center?: ((parent: Parent) => JSX.Element) | JSX.Element | string;

    layout?: ViewerLayout<Parent>;
}

export class WellLogLayout<Parent> extends Component<Props<Parent>> {
    constructor(props: Props<Parent>) {
        super(props);
    }

    createPanel(
        panel?: JSX.Element | string | ((parent: Parent) => JSX.Element)
    ): JSX.Element | string | undefined {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (typeof panel === "function")
            // eslint-disable-next-line react/prop-types
            return panel(this.props.parent);
        if (typeof panel === "object") return panel; // JSX.Element
        return panel; // JSX.Element | string
    }

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const center = this.createPanel(this.props.center);

        let header: JSX.Element | string | undefined;
        let left: JSX.Element | string | undefined;
        let right: JSX.Element | string | undefined;
        let top: JSX.Element | string | undefined;
        let bottom: JSX.Element | string | undefined;
        let footer: JSX.Element | string | undefined;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const layout = this.props.layout;
        if (!layout) {
            // use default empty layout
            header = undefined;
            left = undefined;
            right = undefined;
            top = undefined;
            bottom = undefined;
            footer = undefined;
        } else {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            header = this.createPanel(layout.header);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            left = this.createPanel(layout.left);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            right = this.createPanel(layout.right);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            top = this.createPanel(layout.top);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            bottom = this.createPanel(layout.bottom);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            footer = this.createPanel(layout.footer);
        }

        return (
            <div className="welllog-layout">
                {header && <div className="header-footer">{header}</div>}
                <div className="interior">
                    {left && <div className="left-right">{left}</div>}
                    <div className="middle">
                        {top && <div className="top-bottom">{top}</div>}
                        {center /* The main view component */}
                        {bottom && <div className="top-bottom">{bottom}</div>}
                    </div>
                    {right && <div className="left-right">{right}</div>}
                </div>
                {footer && <div className="header-footer">{footer}</div>}
            </div>
        );
    }
}

export default WellLogLayout;
