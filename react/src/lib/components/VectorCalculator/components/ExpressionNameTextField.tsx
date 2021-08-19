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

type ExpressionNameTextFieldVariantType =
    | "success"
    | "error"
    | "warning"
    | "default";

type ExpressionNameTextFieldAnimationData = {
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
    const [textFieldAnimationDataState, setTextFieldAnimationDataState] =
        React.useState<ExpressionNameTextFieldAnimationData>({
            variant: "success",
            icon: [],
            helperText: "",
        });

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const getTextFieldAnimationData = React.useCallback(
        (name: string): ExpressionNameTextFieldAnimationData => {
            if (!isValidExpressionNameString(name)) {
                return {
                    variant: "error",
                    icon: <Icon key="error" name="error_filled" />,
                    helperText: expressionNameValidationMessage(name),
                };
            }

            if (
                isNameOccupiedByVectors(name, vectors) &&
                name !== initialName
            ) {
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
            existingExpressions,
            initialName,
            vectors,
        ]
    );

    React.useEffect(() => {
        if (currentName === initialName) {
            setName(currentName);
            setTextFieldAnimationDataState(
                getTextFieldAnimationData(currentName)
            );
        }
    }, [currentName, initialName, getTextFieldAnimationData]);

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
            setTextFieldAnimationDataState(getTextFieldAnimationData(newName));

            props.onNameChange(newName);
            props.onValidChange(isValid);
        },
        [
            validateName,
            setName,
            setTextFieldAnimationDataState,
            getTextFieldAnimationData,
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
                variant={textFieldAnimationDataState.variant}
                inputIcon={textFieldAnimationDataState.icon}
                helperText={textFieldAnimationDataState.helperText}
                disabled={disabled}
            />
        </div>
    );
};
