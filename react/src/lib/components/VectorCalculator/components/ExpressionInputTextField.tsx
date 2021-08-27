import React from "react";
import { Icon, TextField, Progress } from "@equinor/eds-core-react";
import { error_filled, thumbs_up } from "@equinor/eds-icons";

import "../VectorCalculator.css";

export enum ExpressionStatus {
    Valid = 1,
    Invalid = 2,
    Evaluating = 3,
}

type ExpressionInputTextFieldVariantType = "success" | "error" | "default";

type ExpressionInputTextFieldStyleData = {
    icon: React.ReactNode | undefined;
    variant: ExpressionInputTextFieldVariantType;
};

interface ExpressionInputTextFieldProps {
    expression: string;
    status: ExpressionStatus;
    helperText: string;
    disabled?: boolean;
    onExpressionChange: (expression: string) => void;
}

export const ExpressionInputTextField: React.FC<ExpressionInputTextFieldProps> =
    (props: ExpressionInputTextFieldProps) => {
        const { expression, status, helperText, disabled } = props;

        const [textFieldStyleDataState, setTextFieldStyleDataState] =
            React.useState<ExpressionInputTextFieldStyleData>({
                variant: "default",
                icon: [],
            });

        Icon.add({ error_filled, thumbs_up });

        const getTextFieldStyleData =
            React.useCallback((): ExpressionInputTextFieldStyleData => {
                const styleData: ExpressionInputTextFieldStyleData = {
                    variant: "default",
                    icon: [],
                };
                if (disabled) {
                    return styleData;
                }
                if (status === ExpressionStatus.Evaluating) {
                    styleData.icon = <Progress.Circular />;
                }
                if (status === ExpressionStatus.Valid) {
                    styleData.variant = "success";
                    styleData.icon = <Icon key="thumbs" name="thumbs_up" />;
                }
                if (status === ExpressionStatus.Invalid) {
                    styleData.variant = "error";
                    styleData.icon = <Icon key="error" name="error_filled" />;
                }
                return styleData;
            }, [disabled, status]);

        React.useEffect(() => {
            setTextFieldStyleDataState(getTextFieldStyleData());
        }, [status]);

        const handleInputChange = (
            e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
        ): void => {
            const newExpression: string = e.target.value;
            props.onExpressionChange(newExpression);
        };

        return (
            <div className="TextFieldWrapper">
                <TextField
                    id="expression_input_field"
                    label="Expression"
                    placeholder="New expression"
                    onChange={handleInputChange}
                    value={expression}
                    disabled={disabled}
                    variant={textFieldStyleDataState.variant}
                    inputIcon={textFieldStyleDataState.icon}
                    helperText={helperText}
                ></TextField>
            </div>
        );
    };
