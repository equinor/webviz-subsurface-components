import React from "react";
import { error_filled, warning_filled, thumbs_up } from "@equinor/eds-icons";
import { TextField, Icon } from "@equinor/eds-core-react";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { ExpressionType } from "../utils/VectorCalculatorTypes";
import {
    isNameOccupiedByVectors,
    doesNameExistInExpressionList,
    isValidExpressionNameString,
    expressionNameValidationMessage,
} from "../utils/VectorCalculatorHelperFunctions";

import "../VectorCalculator.css";

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
    initialName: string;
    currentName: string;
    existingExpressions: ExpressionType[];
    vectors: TreeDataNode[];
    disabled?: boolean;
    onNameChange: (name: string) => void;
    onValidChange: (isValid: boolean) => void;
}

export const ExpressionNameTextField: React.FC<ExpressionNameTextFieldProps> = (
    props: ExpressionNameTextFieldProps
) => {
    const { currentName, initialName, existingExpressions, vectors, disabled } =
        props;
    const [name, setName] = React.useState(initialName);
    const [textFieldStyleDataState, setTextFieldStyleDataState] =
        React.useState<ExpressionNameTextFieldStyleData>({
            variant: "success",
            icon: [],
            helperText: "",
        });

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const getTextFieldStyleData = React.useCallback(
        (name: string): ExpressionNameTextFieldStyleData => {
            if (disabled) {
                return { variant: "default", icon: [], helperText: "" };
            }
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
                doesNameExistInExpressionList(name, existingExpressions) &&
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
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    React.useEffect(() => {
        if (currentName === initialName) {
            setName(currentName);
            setTextFieldStyleDataState(getTextFieldStyleData(currentName));
        }
    }, [currentName, initialName, getTextFieldStyleData]);

    const validateName = React.useCallback(
        (name: string): boolean => {
            if (!isValidExpressionNameString(name)) {
                return false;
            }
            if (isNameOccupiedByVectors(name, vectors)) {
                return false;
            }
            if (name === initialName) {
                return true;
            }
            if (doesNameExistInExpressionList(name, existingExpressions)) {
                return false;
            }
            return true;
        },
        [
            isValidExpressionNameString,
            doesNameExistInExpressionList,
            isNameOccupiedByVectors,
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    const handleInputChange = React.useCallback(
        (
            e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
        ): void => {
            const newName: string = e.target.value;
            const isValid = validateName(newName);

            setName(newName);
            setTextFieldStyleDataState(getTextFieldStyleData(newName));

            props.onNameChange(newName);
            props.onValidChange(isValid);
        },
        [
            validateName,
            setName,
            setTextFieldStyleDataState,
            getTextFieldStyleData,
            props.onNameChange,
            props.onValidChange,
        ]
    );

    return (
        <div className="TextFieldWrapper">
            <TextField
                id="expression_name_input_field"
                label="Name"
                placeholder="New name"
                onChange={handleInputChange}
                value={name}
                variant={textFieldStyleDataState.variant}
                inputIcon={textFieldStyleDataState.icon}
                helperText={textFieldStyleDataState.helperText}
                disabled={disabled}
            />
        </div>
    );
};
