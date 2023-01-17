import React, { ChangeEvent } from "react";
import { Label, Input } from "@equinor/eds-core-react";

interface Props {
    /**
     * Label for the component.
     */
    label: string;
    /**
     * Initial state of the component.
     */
    value: number;

    min?: number;
    max?: number;
    step?: number;

    /**
     * Callback to update the state of the component.
     */
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const NumericInput: React.FC<Props> = React.memo(
    ({ label, value, min, max, step, onChange }: Props) => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Label
                    label={label}
                    id={`${label}-input-label`}
                    style={{
                        paddingTop: 5,
                        paddingBottom: 5,
                        fontSize: 15,
                    }}
                />
                <Input
                    id={`${label}-input`}
                    type={"number"}
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                    style={{
                        fontSize: 15,
                        textAlign: "right",
                        width: "3rem",
                    }}
                />
            </div>
        );
    }
);

NumericInput.defaultProps = {
    min: 0,
    step: 1,
};

NumericInput.displayName = "NumericInput";
export default NumericInput;
