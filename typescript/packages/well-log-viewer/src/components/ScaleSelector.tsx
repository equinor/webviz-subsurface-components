import React from "react";

export interface ScaleSelectorProps {
    values?: number[]; // Available scale values array
    value: number; // value for scale combo
    round?: boolean | number; // round the value to a "good" number (true for auto or number for rounding step)
    onChange(value: number): void; // A callback to recieve current value selected by user
}

function getScale(
    value: number,
    values: number[],
    round?: boolean | number
): {
    shouldAddCustomValue: boolean;
    valueRound: number;
} {
    // get nearest value in the list
    let nearestValue: number | undefined = undefined;
    const len = values.length;
    if (len) {
        nearestValue = values[len - 1];
        for (let i = 1; i < len; i++) {
            if (value < (values[i - 1] + values[i]) * 0.5) {
                nearestValue = values[i - 1];
                break;
            }
        }
    }

    if (round) {
        // make a "round value"
        let r: number = 1; // "round" step
        if (round === true) {
            // boolean : automatically compute the round step
            const ticks: number[] = [
                10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1,
            ];
            const n: number = ticks.length;
            for (let i = 0; i + 2 < n; i++) {
                if (value < ticks[i]) continue;
                r = ticks[i + 2];
                break;
            }
        } else {
            r = round; // get user round step
        }
        value = Number((value / r).toFixed(0)) * r;
    }

    return { shouldAddCustomValue: nearestValue !== value, valueRound: value };
}

function addOption(value: number): JSX.Element {
    return (
        <option key={value} value={value}>
            {"1:" + value}
        </option>
    );
}

const defValues: number[] = [
    100, 200, 500, 1000 /* 1 cm == 10 m */, 2000, 5000, 10000, 20000, 50000,
];

export function ScaleSelector(props: ScaleSelectorProps): JSX.Element {
    const [value, setValue] = React.useState(props.value);
    React.useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    // callback function from combobox
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        event.preventDefault();
        const value: number = parseFloat(event.target.value);
        props.onChange?.(value);
        setValue(value);
    };

    const values = props.values || defValues;
    const { shouldAddCustomValue, valueRound } = getScale(
        value,
        values,
        props.round
    );
    return (
        <select onChange={onChange} value={valueRound}>
            {shouldAddCustomValue && addOption(valueRound)}
            {values.map((value: number) => addOption(value))}
        </select>
    );
}

export default ScaleSelector;
