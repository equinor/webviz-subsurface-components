import React, { FormEvent } from "react";
import { Label, Slider } from "@equinor/eds-core-react";

interface Props {
    /**
     * Label for the component.
     */
    label: string;
    /**
     * Initial state of the component.
     */
    value: number;
    /**
     * Min value.
     */
    min?: number;
    /**
     * Max value.
     */
    max?: number;
    /**
     * Stepping interval.
     */
    step?: number;
    /**
     * Callback to update the state of the component.
     */
    onChange: (e: FormEvent<HTMLDivElement>, value: number | number[]) => void;
}

const SliderInput: React.FC<Props> = React.memo(
    ({ label, value, min, max, step, onChange }: Props) => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Label
                    id={`${label}-slider-label`}
                    label={label}
                    style={{
                        paddingTop: 5,
                        fontSize: 15,
                    }}
                />
                <Slider
                    ariaLabelledby={`${label}-slider-label`}
                    id={`${label}-slider`}
                    value={value * 100}
                    min={min}
                    max={max}
                    step={step}
                    minMaxDots={false}
                    minMaxValues={false}
                    onChange={onChange}
                    style={{
                        paddingTop: 5,
                        paddingRight: 10,
                        paddingBottom: 25,
                        width: "3rem",
                    }}
                />
            </div>
        );
    }
);

SliderInput.displayName = "SliderInput";
export default SliderInput;
