import type { ChangeEvent } from "react";
import React from "react";
import { Label, Switch } from "@equinor/eds-core-react";

interface Props {
    /**
     * Label for the component.
     */
    label: string;
    /**
     * Initial state of the component.
     */
    checked: boolean;
    /**
     * Callback to update the state of the component.
     */
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ToggleButton: React.FC<Props> = React.memo(
    ({ label, checked, onChange }: Props) => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Label
                    label={label}
                    id={`${label}-switch-label`}
                    style={{
                        paddingTop: 15,
                        fontSize: 15,
                    }}
                />
                <Switch
                    id={`${label}-switch`}
                    aria-label={label}
                    label={""}
                    onChange={onChange}
                    checked={checked}
                    style={{
                        paddingRight: 10,
                        width: "3rem",
                    }}
                />
            </div>
        );
    }
);

ToggleButton.displayName = "ToggleButton";
export default ToggleButton;
