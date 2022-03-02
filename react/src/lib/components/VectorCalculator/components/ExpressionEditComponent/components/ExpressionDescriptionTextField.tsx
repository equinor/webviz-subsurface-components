import React from "react";

import { MaxLengthTextField } from "./MaxLengthTextField";

import { StoreActions, useStore } from "../../ExpressionsStore";

import "!style-loader!css-loader!../../../VectorCalculator.css";

interface ExpressionDescriptionTextFieldProps {
    maxLength: number;
    disabled?: boolean;
}

export const ExpressionDescriptionTextField: React.FC<
    ExpressionDescriptionTextFieldProps
> = (props: ExpressionDescriptionTextFieldProps) => {
    const store = useStore();

    React.useEffect(() => {
        store.dispatch({
            type: StoreActions.SetDescription,
            payload: {
                description: store.state.activeExpression.description,
            },
        });
    }, [store.state.activeExpression.description]);

    React.useEffect(() => {
        store.dispatch({
            type: StoreActions.SetDescription,
            payload: {
                description: store.state.activeExpression.description,
            },
        });
    }, [store.state.resetActionCounter]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
    ): void => {
        const newDescription: string = e.target.value;
        store.dispatch({
            type: StoreActions.SetDescription,
            payload: { description: newDescription },
        });
    };

    return (
        <div className="TextFieldWrapper">
            <MaxLengthTextField
                id="expression_description_input_field"
                maxLength={props.maxLength}
                label="Description"
                placeholder="Description (optional)"
                onChange={handleInputChange}
                value={
                    store.state.editableDescription
                        ? store.state.editableDescription
                        : ""
                }
                disabled={props.disabled}
            />
        </div>
    );
};
