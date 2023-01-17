import React from "react";

interface Props {
    onChange: (axis: string) => void;
    axis: string;

    header?: string; // language dependent string
    axes: string[];
    axisLabels: Record<string, string>; // language dependent strings
}

function createItem(props: Props, label: string, axis: string): JSX.Element {
    return (
        <div key={axis}>
            <input
                type="radio"
                value={axis}
                checked={props.axis === axis}
                onChange={(ev) => props.onChange(ev.target.value)}
            />
            {label}
        </div>
    );
}

export function AxisSelector(props: Props): JSX.Element {
    if (!props.axes || props.axes.length < 1) return <></>; // nothing to render

    return (
        <div>
            <fieldset>
                {props.header && <legend>{props.header}</legend>}
                {props.axes.map((axis) => {
                    return createItem(
                        props,
                        props.axisLabels ? props.axisLabels[axis] : axis,
                        axis
                    );
                })}
            </fieldset>
        </div>
    );
}

export default AxisSelector;
