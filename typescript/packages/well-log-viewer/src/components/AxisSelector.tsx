import type { ReactNode } from "react";
import React, { Component } from "react";

interface Props {
    header?: string | JSX.Element; // language dependent string
    axes: string[];
    axisTitles: Record<string, string>; // language dependent strings
    value: string;
    onChange: (value: string) => void;
    /**
     * Hide the component when only one axis is available
     */
    autoHide?: boolean;
}

class AxisSelector extends Component<Props> {
    createItem(label: string, value: string): ReactNode {
        return (
            <div key={value}>
                <input
                    type="radio"
                    value={value}
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    checked={this.props.value === value}
                    onChange={(ev) => {
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        this.props.onChange(ev.target.value);
                    }}
                />
                {label}
            </div>
        );
    }

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.autoHide && this.props.axes.length <= 1)
            return <></>; // do not need to render anything
        return (
            <div className="axis-selector">
                <fieldset>
                    {/* TODO: Fix this the next time the file is edited. */}
                    {/* eslint-disable-next-line react/prop-types */}
                    <legend>{this.props.header}</legend>
                    {/* TODO: Fix this the next time the file is edited. */}
                    {/* eslint-disable-next-line react/prop-types */}
                    {this.props.axes.map((axis) => {
                        return this.createItem(
                            // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
                            this.props.axisTitles ? // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line react/prop-types
                            this.props.axisTitles[axis] : axis,
                            axis
                        );
                    })}
                </fieldset>
            </div>
        );
    }
}

export default AxisSelector;
