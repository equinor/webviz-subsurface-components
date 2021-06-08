import React, { ReactNode, useCallback } from "react";
import { TextField, Icon } from "@equinor/eds-core-react";
import { error_filled, thumbs_up } from "@equinor/eds-icons";

import "../VectorCalculator.css";
import { ExpressionType } from "../utils/VectorCalculatorTypes";

interface ExpressionInputTextFieldProps {
    expression: string;
    isValid: boolean;
    disabled?: boolean;
    onExpressionChange: (expression: string) => void;
}

export const ExpressionInputTextField: React.FC<ExpressionInputTextFieldProps> =
    (props: ExpressionInputTextFieldProps) => {
        const { expression, isValid, disabled } = props;

        const [textFieldVariantState, setTextFieldVariantState] =
            React.useState<"success" | "error" | "warning" | "default">(
                "default"
            );
        const [textFieldIconState, setTextFieldIconState] =
            React.useState<ReactNode | undefined>(undefined);

        Icon.add({ error_filled });
        Icon.add({ thumbs_up });

        const textFieldVariant = useCallback((): "error" | "success" => {
            if (!isValid) {
                return "error";
            }
            return "success";
        }, [isValid]);

        const textFieldIcon = useCallback((): ReactNode | undefined => {
            if (!isValid) {
                return <Icon key="error" name="error_filled" />;
            }
            return <Icon key="thumbs" name="thumbs_up" />;
        }, [isValid]);

        React.useEffect(() => {
            setTextFieldVariantState(textFieldVariant());
            setTextFieldIconState(textFieldIcon());
        }, [isValid]);

        const handleInputChange = (
            e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
        ): void => {
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
