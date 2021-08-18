import React from "react";
import { error_filled, warning_filled, thumbs_up } from "@equinor/eds-icons";
import { TextField, Icon } from "@equinor/eds-core-react";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { ExpressionType } from "../utils/VectorCalculatorTypes";
import {
    isNameOccupiedByVectors,
    doesNameExistInExpressionList,
    isValidExpressionName,
    expressionNameValidationMessage,
} from "../utils/VectorCalculatorHelperFunctions";

type ExpressionNameTextFieldVariantType =
    | "success"
    | "error"
    | "warning"
    | "default";

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

    const [textFieldVariantState, setTextFieldVariantState] =
        React.useState<ExpressionNameTextFieldVariantType>("success");
    const [textFieldHelperTextState, setTextFieldHelperTextState] =
        React.useState<string>("");
    const [textFieldIconState, setTextFieldIconState] = React.useState<
        React.ReactNode | undefined
    >(<Icon key="thumbs" name="thumbs_up" />);

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const getTextFieldVariant = React.useCallback(
        (name: string): ExpressionNameTextFieldVariantType => {
            if (name === "") {
                return "default";
            }
            if (!isValidExpressionName(name)) {
                return "error";
            }
            if (name == initialName) {
                return "success";
            }
            if (
                isNameOccupiedByVectors(name, vectors) ||
                doesNameExistInExpressionList(name, existingExpressions)
            ) {
                return "warning";
            }
            return "success";
        },
        [
            isValidExpressionName,
            isNameOccupiedByVectors,
            doesNameExistInExpressionList,
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    const getTextFieldHelperText = React.useCallback(
        (name: string): string => {
            if (name === "" || name === initialName) {
                return "";
            }
            if (!isValidExpressionName(name)) {
                return expressionNameValidationMessage(name);
            }
            if (isNameOccupiedByVectors(name, vectors)) {
                return "Name occupied by existing vector!";
            }
            if (doesNameExistInExpressionList(name, existingExpressions)) {
                return "Name of existing expression!";
            }
            return "";
        },
        [
            isValidExpressionName,
            isNameOccupiedByVectors,
            doesNameExistInExpressionList,
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    const getTextFieldIcon = React.useCallback(
        (name: string): React.ReactNode | undefined => {
            if (!isValidExpressionName(name)) {
                return <Icon key="error" name="error_filled" />;
            }
            if (name === initialName) {
                return <Icon key="thumbs" name="thumbs_up" />;
            }
            if (
                isNameOccupiedByVectors(name, vectors) ||
                doesNameExistInExpressionList(name, existingExpressions)
            ) {
                return <Icon key="warning" name="warning_filled" />;
            }
            return <Icon key="thumbs" name="thumbs_up" />;
        },
        [
            isValidExpressionName,
            isNameOccupiedByVectors,
            doesNameExistInExpressionList,
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    React.useEffect(() => {
        if (currentName === initialName) {
            setName(currentName);
            setTextFieldVariantState(getTextFieldVariant(currentName));
            setTextFieldHelperTextState(getTextFieldHelperText(currentName));
            setTextFieldIconState(getTextFieldIcon(currentName));
        }
    }, [
        currentName,
        initialName,
        getTextFieldVariant,
        getTextFieldHelperText,
        getTextFieldIcon,
    ]);

    const validateName = React.useCallback(
        (name: string): boolean => {
            if (!isValidExpressionName(name)) {
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
            isValidExpressionName,
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
            setTextFieldVariantState(getTextFieldVariant(newName));
            setTextFieldHelperTextState(getTextFieldHelperText(newName));
            setTextFieldIconState(getTextFieldIcon(newName));

            props.onNameChange(newName);
            props.onValidChange(isValid);
        },
        [
            validateName,
            setName,
            setTextFieldVariantState,
            setTextFieldHelperTextState,
            setTextFieldIconState,
            getTextFieldVariant,
            getTextFieldHelperText,
            getTextFieldIcon,
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
                variant={textFieldVariantState}
                inputIcon={textFieldIconState}
                helperText={textFieldHelperTextState}
                disabled={disabled}
            />
        </div>
    );
};
