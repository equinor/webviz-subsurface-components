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
                    checked={this.props.value === value}
                    onChange={(ev) => {
                        this.props.onChange(ev.target.value);
                    }}
                />
                {label}
            </div>
        );
    }

    render(): JSX.Element {
        if (this.props.autoHide && this.props.axes.length <= 1) return <></>; // do not need to render anything
        return (
            <div className="axis-selector">
                <fieldset>
                    <legend>{this.props.header}</legend>
                    {this.props.axes.map((axis) => {
                        return this.createItem(
                            this.props.axisTitles
                                ? this.props.axisTitles[axis]
                                : axis,
                            axis
                        );
                    })}
                </fieldset>
            </div>
        );
    }
}

export default AxisSelector;
