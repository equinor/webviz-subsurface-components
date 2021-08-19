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

type ExpressionInputTextFieldAnimationData = {
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

        const [textFieldAnimationDataState, setTextFieldAnimationDataState] =
            React.useState<ExpressionInputTextFieldAnimationData>({
                variant: "default",
                icon: [],
            });

        Icon.add({ error_filled, thumbs_up });

        const textFieldAnimationData =
            React.useCallback((): ExpressionInputTextFieldAnimationData => {
                const animationData: ExpressionInputTextFieldAnimationData = {
                    variant: "default",
                    icon: [],
                };
                if (status === ExpressionStatus.Evaluating) {
                    animationData.icon = <Progress.Circular />;
                }
                if (status === ExpressionStatus.Valid) {
                    animationData.variant = "success";
                    animationData.icon = <Icon key="thumbs" name="thumbs_up" />;
                }
                if (status === ExpressionStatus.Invalid) {
                    animationData.variant = "error";
                    animationData.icon = (
                        <Icon key="error" name="error_filled" />
                    );
                }
                return animationData;
            }, [status]);

        React.useEffect(() => {
            setTextFieldAnimationDataState(textFieldAnimationData());
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
                    variant={textFieldAnimationDataState.variant}
                    inputIcon={textFieldAnimationDataState.icon}
                    helperText={helperText}
                ></TextField>
            </div>
        );
    };
