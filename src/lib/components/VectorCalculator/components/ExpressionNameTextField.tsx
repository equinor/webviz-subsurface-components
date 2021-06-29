import React from "react";
import { TextField, Icon } from "@equinor/eds-core-react";
import { error_filled, warning_filled, thumbs_up } from "@equinor/eds-icons";

import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";
import { ExpressionType } from "../utils/VectorCalculatorTypes";
import {
    nameOccupiedByVectors,
    nameInExpressions,
    parseName,
    nameParseMessage,
} from "../utils/VectorCalculatorHelperFunctions";

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
        React.useState<"success" | "error" | "warning" | "default">("success");
    const [textFieldHelperTextState, setTextFieldHelperTextState] =
        React.useState<string>("");
    const [textFieldIconState, setTextFieldIconState] = React.useState<
        React.ReactNode | undefined
    >(<Icon key="thumbs" name="thumbs_up" />);

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const getTextFieldVariant = React.useCallback(
        (name: string): "success" | "error" | "warning" | "default" => {
            if (name === "") {
                return "default";
            }
            if (!parseName(name)) {
                return "error";
            }
            if (name == initialName) {
                return "success";
            }
            if (
                nameOccupiedByVectors(name, vectors) ||
                nameInExpressions(name, existingExpressions)
            ) {
                return "warning";
            }
            return "success";
        },
        [
            parseName,
            nameOccupiedByVectors,
            nameInExpressions,
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
            if (!parseName(name)) {
                return nameParseMessage(name);
            }
            if (nameOccupiedByVectors(name, vectors)) {
                return "Name occupied existing vector!";
            }
            if (nameInExpressions(name, existingExpressions)) {
                return "Name of existing expression!";
            }
            return "";
        },
        [
            parseName,
            nameOccupiedByVectors,
            nameInExpressions,
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    const getTextFieldIcon = React.useCallback(
        (name: string): React.ReactNode | undefined => {
            if (!parseName(name)) {
                return <Icon key="error" name="error_filled" />;
            }
            if (name === initialName) {
                return <Icon key="thumbs" name="thumbs_up" />;
            }
            if (
                nameOccupiedByVectors(name, vectors) ||
                nameInExpressions(name, existingExpressions)
            ) {
                return <Icon key="warning" name="warning_filled" />;
            }
            return <Icon key="thumbs" name="thumbs_up" />;
        },
        [
            parseName,
            nameOccupiedByVectors,
            nameInExpressions,
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
            if (!parseName(name)) {
                return false;
            }
            if (nameOccupiedByVectors(name, vectors)) {
                return false;
            }
            if (name === initialName) {
                return true;
            }
            if (nameInExpressions(name, existingExpressions)) {
                return false;
            }
            return true;
        },
        [
            parseName,
            nameInExpressions,
            nameOccupiedByVectors,
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
    );
};
