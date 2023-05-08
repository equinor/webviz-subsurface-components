/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import { Icon, TextField, Progress } from "@equinor/eds-core-react";
import { error_filled, thumbs_up } from "@equinor/eds-icons";
Icon.add({ error_filled, thumbs_up });

import {
    ExpressionStatus,
    StoreActions,
    useStore,
} from "../../ExpressionsStore";

import { getExpressionParseData } from "../../../utils/ExpressionParser";

import "!style-loader!css-loader!../../../VectorCalculator.css";

type ExpressionInputTextFieldVariantType = "success" | "error" | "default";

type ExpressionInputTextFieldStyleData = {
    icon: React.ReactNode | undefined;
    variant: ExpressionInputTextFieldVariantType;
};

interface ExpressionInputTextFieldProps {
    externalParsing: boolean;
    disabled?: boolean;
    onStatusChanged: (status: ExpressionStatus) => void;
}

export const ExpressionInputTextField: React.FC<
    ExpressionInputTextFieldProps
> = (props: ExpressionInputTextFieldProps) => {
    const store = useStore();
    const [status, setStatus] = React.useState<ExpressionStatus>(
        ExpressionStatus.Valid
    );
    const [helperText, setHelperText] = React.useState<string>(
        store.state.parseData.parsingMessage
    );
    const [textFieldStyleDataState, setTextFieldStyleDataState] =
        React.useState<ExpressionInputTextFieldStyleData>({
            variant: "default",
            icon: [],
        });

    const getTextFieldStyleData =
        React.useCallback((): ExpressionInputTextFieldStyleData => {
            const styleData: ExpressionInputTextFieldStyleData = {
                variant: "default",
                icon: [],
            };
            if (props.disabled) {
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
        }, [props.disabled, status]);

    React.useEffect(() => {
        setTextFieldStyleDataState(getTextFieldStyleData());
        props.onStatusChanged(status);
    }, [status]);

    React.useEffect(() => {
        if (helperText !== store.state.parseData.parsingMessage) {
            setHelperText(store.state.parseData.parsingMessage);
        }
    }, [store.state.parseData.parsingMessage]);

    React.useEffect(() => {
        if (props.externalParsing) {
            const status = store.state.parseData.isValid
                ? ExpressionStatus.Valid
                : ExpressionStatus.Invalid;
            setStatus(status);
        }
    }, [store.state.parseData]);

    const dispatchParseActions = React.useCallback(
        (expression: string): void => {
            if (props.externalParsing) {
                setStatus(ExpressionStatus.Evaluating);
                setHelperText("");
            } else {
                const parseData = getExpressionParseData(expression);
                setStatus(
                    parseData.isValid
                        ? ExpressionStatus.Valid
                        : ExpressionStatus.Invalid
                );
                store.dispatch({
                    type: StoreActions.SetParsingData,
                    payload: {
                        data: {
                            isValid: parseData.isValid,
                            parsingMessage: parseData.parsingMessage,
                            variables: parseData.variables,
                        },
                    },
                });
            }
        },
        [props.externalParsing, getExpressionParseData]
    );

    React.useEffect(() => {
        dispatchParseActions(store.state.editableExpression);
    }, [store.state.editableExpression]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
    ): void => {
        store.dispatch({
            type: StoreActions.SetExpression,
            payload: {
                expression: e.target.value,
            },
        });
    };

    return (
        <div className="TextFieldWrapper">
            <TextField
                id="expression_input_field"
                label="Expression"
                placeholder="New expression"
                onChange={handleInputChange}
                value={store.state.editableExpression}
                disabled={props.disabled}
                variant={textFieldStyleDataState.variant}
                inputIcon={textFieldStyleDataState.icon}
                helperText={helperText}
            ></TextField>
        </div>
    );
};
