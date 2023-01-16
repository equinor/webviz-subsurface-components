import React, { Component } from "react";

import WellLogViewer from "../WellLogViewer";

import { getBaseVertScale } from "./WellLogView";

interface Props {
    parent: WellLogViewer;
    label?: string;
    values?: number[];
}
interface State {
    scale: number; // value for scale combo
}

function getScale(
    scale: number,
    values: number[]
): {
    shouldAddCustomValue: boolean;
    scale: number;
} {
    // get nearest value in the list
    let nearestScale: number | undefined = undefined;
    if (values.length) {
        nearestScale = values[values.length - 1];
        for (let i = 1; i < values.length; i++) {
            if (scale < (values[i - 1] + values[i]) * 0.5) {
                nearestScale = values[i - 1];
                break;
            }
        }
    }

    // make a "round value"
    const r = // "round" step
        scale > 5000
            ? 1000
            : scale > 2000
            ? 500
            : scale > 1000
            ? 200
            : scale > 500
            ? 100
            : scale > 200
            ? 50
            : scale > 100
            ? 20
            : scale > 50
            ? 10
            : scale > 20
            ? 5
            : scale > 10
            ? 2
            : 1;
    scale = Number((scale / r).toFixed(0)) * r;

    return { shouldAddCustomValue: nearestScale !== scale, scale: scale };
}

function addOption(scale: number): JSX.Element {
    return (
        <option key={scale} value={scale}>
            {"1:" + scale}
        </option>
    );
}

export class WellLogScaleSelector extends Component<Props, State> {
    static defValues: number[] = [
        100, 200, 500, 1000 /* 1 cm == 10 m */, 2000, 5000, 10000, 20000, 50000,
    ];
    constructor(props: Props, state: State) {
        super(props, state);

        this.state = {
            scale: 1.0,
        };

        this.onScaleChange = this.onScaleChange.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
        this.props.parent.onContentRescales.push(this.onContentRescale);
    }
    componentWillUnmount(): void {
        const i = this.props.parent.onContentRescales.indexOf(
            this.onContentRescale
        );
        if (i >= 0) this.props.parent.onContentRescales.slice(i, 1);
    }

    // callback function from Vertical Scale combobox
    onScaleChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        event.preventDefault();
        const zoom =
            getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            ) / parseFloat(event.target.value);
        this.props.parent.controller?.zoomContent(zoom);
    }

    onContentRescale(): void {
        this.setState((state: Readonly<State>) => {
            const controller = this.props.parent.controller;
            if (!controller) return null;
            const zoomValue = controller.getContentZoom();
            const baseVertScale = getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            );
            const scale = baseVertScale / zoomValue;
            if (Math.abs(state.scale - scale) < 1) return null;
            return {
                scale: scale,
            };
        });
    }

    render(): JSX.Element {
        const values = this.props.values || WellLogScaleSelector.defValues;
        const { shouldAddCustomValue, scale } = getScale(
            this.state.scale,
            values
        );
        return (
            <div style={{ paddingLeft: "10px", display: "flex" }}>
                {this.props.label && <span>{this.props.label}</span>}
                <span style={{ paddingLeft: "10px" }}>
                    <select onChange={this.onScaleChange} value={scale}>
                        {shouldAddCustomValue && addOption(scale)}
                        {values.map((scale) => addOption(scale))}
                    </select>
                </span>
            </div>
        );
    }
}

export default WellLogScaleSelector;
