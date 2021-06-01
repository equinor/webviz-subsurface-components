import React, { ReactNode } from 'react';
import { TextField, Icon } from '@equinor/eds-core-react'
import { error_filled, thumbs_up } from '@equinor/eds-icons'

import { parseExpression } from '../utils/VectorCalculatorRegex';
import '../VectorCalculator.css';

interface ExpressionInputTextFieldProps {
    expression: string,
    disabled?: boolean,
    onExpressionChange: (expression: string) => void,
    onValidChanged: (isValid: boolean) => void,
};

export const ExpressionInputTextField: React.FC<ExpressionInputTextFieldProps> = (props: ExpressionInputTextFieldProps) => {
    const { expression, disabled } = props;

    const [textFieldVariantState, setTextFieldVariantState] =
        React.useState<"success" | "error" | "warning" | "default">("default");
    const [textFieldIconState, setTextFieldIconState] =
        React.useState<ReactNode | undefined>(undefined);

    Icon.add({ error_filled });
    Icon.add({ thumbs_up });

    const textFieldVariant = (isValid: boolean): "error" | "success" => {
        if (!isValid) {
            return "error";
        }
        return "success";
    };

    const textFieldIcon = (isValid: boolean): ReactNode | undefined => {
        if (!isValid) {
            return (<Icon key="error" name="error_filled" />);
        }
        return (<Icon key="thumbs" name="thumbs_up" />);
    };

    React.useEffect(() => {
        const isValid = parseExpression(expression);
        setTextFieldVariantState(textFieldVariant(isValid))
        setTextFieldIconState(textFieldIcon(isValid))
        props.onValidChanged(isValid);
    }, [expression]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>): void => {
        const newExpression: string = e.target.value;
        props.onExpressionChange(newExpression);
    };

    return (
        <TextField
            id="expression_input_field"
            label="Expression"
            placeholder="New expression"
            onChange={handleInputChange}
            value={expression}
            disabled={disabled}
            variant={textFieldVariantState}
            inputIcon={textFieldIconState}
        />
    );
};
