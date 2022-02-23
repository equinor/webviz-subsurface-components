import React from "react";
import { Icon, TextField, Progress } from "@equinor/eds-core-react";
import { error_filled, thumbs_up } from "@equinor/eds-icons";

import { ExpressionStatus, StoreActions, useStore } from "./ExpressionsStore";

import "!style-loader!css-loader!../VectorCalculator.css";
import { getExpressionParseData } from "../utils/ExpressionParser";

type ExpressionInputTextFieldVariantType = "success" | "error" | "default";

type ExpressionInputTextFieldStyleData = {
    icon: React.ReactNode | undefined;
    variant: ExpressionInputTextFieldVariantType;
};

interface ExpressionInputTextFieldProps {
    disabled?: boolean;
}

export const ExpressionInputTextField: React.FC<
    ExpressionInputTextFieldProps
> = (props: ExpressionInputTextFieldProps) => {
    const { disabled } = props;
    const store = useStore();
    const [status, setStatus] = React.useState<ExpressionStatus>(
        store.state.editableExpressionStatus
    );
    const [helperText, setHelperText] = React.useState<string>(
        store.state.parseMessage
    );
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

    const dispatchParseActions = React.useCallback(
        (expression: string): void => {
            if (store.state.externalParsing) {
                store.dispatch({
                    type: StoreActions.SetEditableExpressionStatus,
                    payload: { status: ExpressionStatus.Evaluating },
                });
                store.dispatch({
                    type: StoreActions.SetParseMessage,
                    payload: { message: "" },
                });
            } else {
                const parseData = getExpressionParseData(expression);
                store.dispatch({
                    type: StoreActions.SetEditableExpressionStatus,
                    payload: {
                        status: parseData.isValid
                            ? ExpressionStatus.Valid
                            : ExpressionStatus.Invalid,
                    },
                });
                store.dispatch({
                    type: StoreActions.SetParseMessage,
                    payload: { message: parseData.parsingMessage },
                });
            }
        },
        [store.state.externalParsing, getExpressionParseData]
    );

    React.useEffect(() => {
        if (status !== store.state.editableExpressionStatus) {
            setStatus(store.state.editableExpressionStatus);
        }
        if (helperText !== store.state.parseMessage) {
            setHelperText(store.state.parseMessage);
        }

        if (
            store.state.editableExpressionStatus === ExpressionStatus.Evaluating
        ) {
            dispatchParseActions(store.state.editableExpression);
        }
    }, [store.state.editableExpressionStatus, store.state.parseMessage]);

    React.useEffect(() => {
        dispatchParseActions(store.state.activeExpression.expression);
    }, [store.state.activeExpression.expression]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
    ): void => {
        const newExpression: string = e.target.value;
        store.dispatch({
            type: StoreActions.SetExpression,
            payload: { expression: newExpression },
        });

        // Perform parsing
        dispatchParseActions(newExpression);
    };

    return (
        <div className="TextFieldWrapper">
            <TextField
                id="expression_input_field"
                label="Expression"
                placeholder="New expression"
                onChange={handleInputChange}
                value={store.state.editableExpression}
                disabled={disabled}
                variant={textFieldStyleDataState.variant}
                inputIcon={textFieldStyleDataState.icon}
                helperText={helperText}
            ></TextField>
        </div>
    );
};
