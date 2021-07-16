import React, { Component, ReactNode } from "react";

interface Props {
    header: string;
    value: string;
    onChange: (value: string) => void;
}

class ScaleSelector extends Component<Props> {
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
                />
                {label}
            </div>
        );
    }

    render(): ReactNode {
        return (
            <div>
                <fieldset>
                    <legend>{this.props.header}</legend>
                    {this.createItem("MD", "md")}
                    {this.createItem("TVD", "tvd")}
                </fieldset>
            </div>
        );
    }
}

export default ScaleSelector;
