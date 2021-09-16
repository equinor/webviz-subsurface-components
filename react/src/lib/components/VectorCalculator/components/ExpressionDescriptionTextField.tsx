import React from "react";

import { MaxLengthTextField } from "./MaxLengthTextField";

import "../VectorCalculator.css";

interface ExpressionDescriptionTextFieldProps {
    maxLength: number;
    description?: string;
    disabled?: boolean;
    onDescriptionChange: (description: string) => void;
}

export const ExpressionDescriptionTextField: React.FC<ExpressionDescriptionTextFieldProps> =
    (props: ExpressionDescriptionTextFieldProps) => {
        const [description, setDescription] = React.useState<string>("");

        React.useEffect(() => {
            setDescription(props.description ? props.description : "");
        }, [props.description]);

        const handleInputChange = (
            e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
        ): void => {
            const newDescription: string = e.target.value;
            props.onDescriptionChange(newDescription);
        };

        return (
            <div className="TextFieldWrapper">
                <MaxLengthTextField
                    id="expression_description_input_field"
                    maxLength={props.maxLength}
                    label="Description"
                    placeholder="Description (optional)"
                    onChange={handleInputChange}
                    value={description}
                    disabled={props.disabled}
                />
            </div>
        );
    };
