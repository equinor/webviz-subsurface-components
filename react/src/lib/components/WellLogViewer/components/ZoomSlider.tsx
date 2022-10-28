import React, { Component } from "react";

import Slider from "@material-ui/core/Slider";

interface Props {
    onChange: (value: number) => void;
    value: number; // zoom value.

    max?: number; // max zoom value. default 256
    step?: number; // step of zoom level. default 0.5
}

interface State {
    level: number;
}

function convertLevelToValue(level: number): number {
    // convert zoom level to zoom value
    return 2 ** level;
}
function convertValueToLevel(value: number): number {
    // convert zoom value to zoom level
    return value > 0 ? Math.log2(value) : 0;
}

function valueLabelFormat(value: number /*, index: number*/): string {
    return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
}

class ZoomSlider extends Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);

        const level = convertValueToLevel(this.props.value);
        this.state = {
            level: level,
        };
        this.onChange = this.onChange.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.value !== prevProps.value) {
            this.setState((state: Readonly<State>) => {
                const level = convertValueToLevel(this.props.value);
                if (state.level == level) return null;
                return { level: level };
            });
        }
    }

    // callback function from Zoom slider
    onChange(
        _event: React.ChangeEvent<Record<string, unknown>>,
        level: number | number[] // zoom level
    ): void {
        if (typeof level === "number") {
            this.setState((state: Readonly<State>) => {
                if (state.level === level) return null;
                if (this.props.onChange)
                    this.props.onChange(convertLevelToValue(level));
                else console.error("ZoomSlider props.onChange not set");
                return { level: level as number };
            });
        }
    }

    render(): JSX.Element {
        return (
            <Slider
                value={this.state.level}
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
