import React from "react";

import { MaxLengthTextField } from "./MaxLengthTextField";

import { StoreActions, useStore } from "./ExpressionsStore";

import "!style-loader!css-loader!../VectorCalculator.css";

interface ExpressionDescriptionTextFieldProps {
    maxLength: number;
    disabled?: boolean;
}

export const ExpressionDescriptionTextField: React.FC<
    ExpressionDescriptionTextFieldProps
> = (props: ExpressionDescriptionTextFieldProps) => {
    const store = useStore();
    // const [description, setDescription] = React.useState<string>(
    //     store.state.editableExpression.description
    //         ? store.state.editableExpression.description
    //         : ""
    // );

    // React.useEffect(() => {
    //     setDescription(
    //         store.state.editableExpression.description
    //             ? store.state.editableExpression.description
    //             : ""
    //     );
    // }, [store.state.editableExpression.description]);

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
                    store.state.editableExpression.description
                        ? store.state.editableExpression.description
                        : ""
                }
                disabled={props.disabled}
            />
        </div>
    );
};
