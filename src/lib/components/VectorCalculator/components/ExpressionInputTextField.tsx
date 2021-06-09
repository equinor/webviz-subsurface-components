import React, { ReactNode, useCallback } from "react";
import { Icon, TextField, Progress } from "@equinor/eds-core-react";
import { error_filled, thumbs_up } from "@equinor/eds-icons";

import "../VectorCalculator.css";

export enum ExpressionStatus {
    Valid = 1,
    Invalid = 2,
    Evaluating = 3,
}

interface ExpressionInputTextFieldProps {
    expression: string;
    status: ExpressionStatus;
    disabled?: boolean;
    onExpressionChange: (expression: string) => void;
}

export const ExpressionInputTextField: React.FC<ExpressionInputTextFieldProps> =
    (props: ExpressionInputTextFieldProps) => {
        const { expression, status, disabled } = props;

        const [textFieldVariantState, setTextFieldVariantState] =
            React.useState<"success" | "error" | "warning" | "default">(
                "default"
            );
        const [textFieldIconState, setTextFieldIconState] =
            React.useState<ReactNode | undefined>(undefined);

        Icon.add({ error_filled });
        Icon.add({ thumbs_up });

        const textFieldVariant = useCallback(():
            | "error"
            | "success"
            | "default" => {
            if (status === ExpressionStatus.Valid) {
                return "success";
            }
            if (status === ExpressionStatus.Invalid) {
                return "error";
            }
            return "default";
        }, [status]);

        const textFieldIcon = useCallback((): ReactNode | undefined => {
            if (status === ExpressionStatus.Evaluating) {
                return <Progress.Circular />;
            }
            if (status === ExpressionStatus.Valid) {
                return <Icon key="thumbs" name="thumbs_up" />;
            }
            if (status === ExpressionStatus.Invalid) {
                return <Icon key="error" name="error_filled" />;
            }
            return undefined;
        }, [status]);

        React.useEffect(() => {
            setTextFieldVariantState(textFieldVariant());
            setTextFieldIconState(textFieldIcon());
        }, [status]);

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
            ></TextField>
        );
    };
