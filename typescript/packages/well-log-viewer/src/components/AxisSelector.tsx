import type { ReactNode } from "react";
import React, { Component } from "react";

interface Props {
    header: string; // language dependent string
    axes: string[];
    axisLabels: Record<string, string>; // language dependent strings
    value: string;
    onChange: (value: string) => void;
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
        if (!this.props.axes || this.props.axes.length < 1) return <></>; // nothing to render
        return (
            <div className="axis-selector">
                {" "}
                // for CSS customization
                <fieldset>
                    <legend>{this.props.header}</legend>
                    {this.props.axes.map((axis) => {
                        return this.createItem(
                            this.props.axisLabels
                                ? this.props.axisLabels[axis]
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
