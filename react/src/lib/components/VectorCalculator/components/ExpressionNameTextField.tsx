import React from "react";
import { error_filled, warning_filled, thumbs_up } from "@equinor/eds-icons";
import { TextField, Icon } from "@equinor/eds-core-react";
import { TreeDataNode } from "@webviz/core-components";

import { StoreActions, useStore } from "./ExpressionsStore";
import {
    isNameOccupiedByVectors,
    doesNameExistInExpressionList,
    isValidExpressionNameString,
    expressionNameValidationMessage,
} from "../utils/VectorCalculatorHelperFunctions";

import "!style-loader!css-loader!../VectorCalculator.css";

type ExpressionNameTextFieldVariantType =
    | "success"
    | "error"
    | "warning"
    | "default";

type ExpressionNameTextFieldStyleData = {
    icon: React.ReactNode | undefined;
    variant: ExpressionNameTextFieldVariantType;
    helperText: string;
};

interface ExpressionNameTextFieldProps {
    vectors: TreeDataNode[];
    disabled?: boolean;
    onValidChanged: (isValid: boolean) => void;
}

export const ExpressionNameTextField: React.FC<ExpressionNameTextFieldProps> = (
    props: ExpressionNameTextFieldProps
) => {
    const { vectors, disabled } = props;
    const store = useStore();
    const [isValid, setIsValid] = React.useState<boolean>(false);
    const [textFieldStyleDataState, setTextFieldStyleDataState] =
        React.useState<ExpressionNameTextFieldStyleData>({
            variant: "success",
            icon: [],
            helperText: "",
        });

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const getTextFieldStyleData = React.useCallback(
        (name: string): ExpressionNameTextFieldStyleData => {
            const initialName = store.state.activeExpression.name;

            if (!isValidExpressionNameString(name)) {
                return {
                    variant: "error",
                    icon: <Icon key="error" name="error_filled" />,
                    helperText: expressionNameValidationMessage(name),
                };
            }

            if (isNameOccupiedByVectors(name, vectors)) {
                return {
                    variant: "warning",
                    icon: <Icon key="warning" name="warning_filled" />,
                    helperText: "Name occupied by existing vector!",
                };
            }
            if (
                doesNameExistInExpressionList(name, store.state.expressions) &&
                name !== initialName
            ) {
                return {
                    variant: "warning",
                    icon: <Icon key="warning" name="warning_filled" />,
                    helperText: "Name of existing expression!",
                };
            }
            return {
                variant: "success",
                icon: <Icon key="thumbs" name="thumbs_up" />,
                helperText: "",
            };
        },
        [
            expressionNameValidationMessage,
            isValidExpressionNameString,
            isNameOccupiedByVectors,
            doesNameExistInExpressionList,
            disabled,
            store.state.expressions,
            store.state.activeExpression,
            vectors,
        ]
    );

    const isValidName = React.useCallback(
        (name: string): boolean => {
            const initialName = store.state.activeExpression.name;

            if (!isValidExpressionNameString(name)) {
                return false;
            }
            if (isNameOccupiedByVectors(name, vectors)) {
                return false;
            }
            if (name === initialName) {
                return true;
            }
            if (doesNameExistInExpressionList(name, store.state.expressions)) {
                return false;
            }
            return true;
        },
        [
            isValidExpressionNameString,
            doesNameExistInExpressionList,
            isNameOccupiedByVectors,
            store.state.activeExpression,
            store.state.expressions,
            vectors,
        ]
    );

    React.useEffect(() => {
        if (disabled) {
            setTextFieldStyleDataState({
                variant: "default",
                icon: [],
                helperText: "",
            });
        } else {
            setTextFieldStyleDataState(
                getTextFieldStyleData(store.state.editableName)
            );
        }
    }, [disabled]);

    React.useEffect(() => {
        props.onValidChanged(isValid);
    }, [isValid]);

    React.useEffect(() => {
        setIsValid(isValidName(store.state.editableName));
        setTextFieldStyleDataState(
            getTextFieldStyleData(store.state.editableName)
        );
    }, [store.state.editableName, getTextFieldStyleData]);

    React.useEffect(() => {
        store.dispatch({
            type: StoreActions.SetName,
            payload: { name: store.state.activeExpression.name },
        });
    }, [store.state.activeExpression.name, store.state.resetActionCounter]);

    const handleInputChange = React.useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
        ): void => {
            const newName: string = e.target.value;
            store.dispatch({
                type: StoreActions.SetName,
                payload: { name: newName },
            });
        },
        [isValidName]
    );

    return (
        <div className="TextFieldWrapper">
            <TextField
                id="expression_name_input_field"
                label="Name"
                placeholder="New name"
                onChange={handleInputChange}
                value={store.state.editableName}
                variant={textFieldStyleDataState.variant}
                inputIcon={textFieldStyleDataState.icon}
                helperText={textFieldStyleDataState.helperText}
                disabled={disabled}
            />
        </div>
    );
};
