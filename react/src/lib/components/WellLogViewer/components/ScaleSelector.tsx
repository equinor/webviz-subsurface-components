import React from "react";

interface Props {
    values?: number[];
    scale: number; // value for scale combo
    onScaleChange(value: number): void;
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

const defValues: number[] = [
    100, 200, 500, 1000 /* 1 cm == 10 m */, 2000, 5000, 10000, 20000, 50000,
];

export function ScaleSelector(props: Props): JSX.Element {
    // callback function from Vertical Scale combobox
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        event.preventDefault();
        props.onScaleChange?.(parseFloat(event.target.value));
    };

    const values = props.values || defValues;
    const { shouldAddCustomValue, scale } = getScale(props.scale, values);
    return (
        <select onChange={onChange} value={scale}>
            {shouldAddCustomValue && addOption(scale)}
            {values.map((scale: number) => addOption(scale))}
        </select>
    );
}

export default ScaleSelector;
