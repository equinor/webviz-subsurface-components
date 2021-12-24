import React, { Component, ReactNode } from "react";

import Slider from "@material-ui/core/Slider";

interface Props {
    onChange: (value: number) => void;
    value: number; // zoom value.

    max?: number; // max zoom value. default 256
    step?: number; // step of zoom level. default 0.5
}

interface State {
    value: number;
}

function convertLevelToValue(x: number): number {
    // convert zoom level to zoom value
    return 2 ** x;
}
function convertValueToLevel(x: number): number {
    // convert zoom value to zoom level
    return Math.log2(x);
}

function valueLabelFormat(value: number /*, index: number*/): string {
    return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
}

class ZoomSlider extends Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);

        this.state = {
            value: props.value,
        };
        this.onChange = this.onChange.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.value !== prevProps.value)
            this.setState({ value: convertValueToLevel(this.props.value) });
    }

    // callback function from Zoom slider
    onChange(
        _event: React.ChangeEvent<Record<string, unknown>>,
        value: number | number[] // zoom level
    ): void {
        if (typeof value === "number") {
            this.setState({ value: value });

            this.props.onChange(convertLevelToValue(value));
        }
    }

    render(): ReactNode {
        return (
            <Slider
                value={this.state.value}
                defaultValue={0}
                min={0}
                step={this.props.step || 0.5}
                max={convertValueToLevel(this.props.max || 256)}
                scale={convertLevelToValue} // convert zoom level to zoom value function
                onChange={this.onChange}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                aria-labelledby="non-linear-slider"
                valueLabelDisplay="auto"
            />
        );
    }
}

export default ZoomSlider;
