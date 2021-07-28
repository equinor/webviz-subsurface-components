import React, { Component, ReactNode } from "react";

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
            <div>
                <input
                    type="radio"
                    value={value}
                    checked={this.props.value === value}
                    onChange={(ev) => {
                        this.props.onChange(ev.target.value);
                    }}
                    key={value}
                />
                {/* set key prop just for react pleasure */}
                {label}
            </div>
        );
    }

    render(): ReactNode {
        if (!this.props.axes || this.props.axes.length < 1) return <></>; // nothing to render
        return (
            <div>
                <fieldset>
                    <legend>{this.props.header}</legend>
                    {this.props.axes.map((axis) => {
                        return this.createItem(
                            this.props.axisLabels[axis],
                            axis
                        );
                    })}
                </fieldset>
            </div>
        );
    }
}

export default AxisSelector;
