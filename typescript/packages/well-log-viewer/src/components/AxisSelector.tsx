import type { ReactNode } from "react";
import React from "react";

interface Props {
    header?: string | JSX.Element; // language dependent string
    axes: string[];
    axisTitles: Record<string, string>; // language dependent strings
    value: string;
    onChange: (value: string) => void;
    /**
     * Hide the component when only one axis is available
     */
    autoHide?: boolean;
}

export const AxisSelector: React.FC<Props> = ({
    header,
    axes,
    axisTitles,
    value,
    onChange,
    autoHide,
}) => {
    if (autoHide && axes.length <= 1) return <></>; // do not need to render anything

    const createItem = (label: string, axisValue: string): ReactNode => (
        <div key={axisValue}>
            <input
                type="radio"
                value={axisValue}
                checked={value === axisValue}
                onChange={(ev) => onChange(ev.target.value)}
            />
            {label}
        </div>
    );

    return (
        <div className="axis-selector">
            <fieldset>
                <legend>{header}</legend>
                {axes.map((axis) =>
                    createItem(axisTitles ? axisTitles[axis] : axis, axis)
                )}
            </fieldset>
        </div>
    );
};
