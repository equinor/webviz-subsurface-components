import React, { Component, ReactNode } from "react";

interface Props {
    header: string;
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
                />
                {label}
            </div>
        );
    }

    render(): ReactNode {
        const time = this.props.value === "time"
        return (
            <div>
                <fieldset>
                    <legend>{this.props.header}</legend>
                    {time ? this.createItem("TIME", "time") : ""}
                    {!time? this.createItem("MD", "md"): ""}
                    {!time?this.createItem("TVD", "tvd"): ""}
                </fieldset>
            </div>
        );
    }
}

export default AxisSelector;
