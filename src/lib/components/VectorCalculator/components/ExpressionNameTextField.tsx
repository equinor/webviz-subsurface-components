import React, { ReactNode, useCallback } from "react";
import { TextField, Icon } from "@equinor/eds-core-react";
import { error_filled, warning_filled, thumbs_up } from "@equinor/eds-icons";

import { ExpressionType } from "../utils/VectorCalculatorTypes";
import { isExpressionNameExisting } from "../utils/VectorCalculatorHelperFunctions";
import { parseName } from "../utils/VectorCalculatorRegex";

interface ExpressionNameTextFieldProps {
    initialName: string;
    currentName: string;
    existingExpressions: ExpressionType[];
    disabled?: boolean;
    onNameChange: (name: string) => void;
    onValidChange: (isValid: boolean) => void;
}

export const ExpressionNameTextField: React.FC<ExpressionNameTextFieldProps> = (
    props: ExpressionNameTextFieldProps
) => {
    const { currentName, initialName, existingExpressions, disabled } = props;
    const [name, setName] = React.useState(initialName);

    const [textFieldVariantState, setTextFieldVariantState] =
        React.useState<"success" | "error" | "warning" | "default">("success");
    const [textFieldHelperTextState, setTextFieldHelperTextState] =
        React.useState<string>("");
    const [textFieldIconState, setTextFieldIconState] = React.useState<
        ReactNode | undefined
    >(<Icon key="thumbs" name="thumbs_up" />);

    Icon.add({ error_filled, thumbs_up, warning_filled });

    const isExisting = useCallback(
        (name: string): boolean => {
            return isExpressionNameExisting(name, existingExpressions);
        },
        [isExpressionNameExisting, existingExpressions]
    );

    const getTextFieldVariant = useCallback(
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
            if (isExisting(name)) {
                return "warning";
            }
            return "success";
        },
        [parseName, isExisting, initialName]
    );

    const getTextFieldHelperText = useCallback(
        (name: string): string => {
            if (name === "") {
                return "";
            }
            if (!parseName(name)) {
                return 'Name can only contain characthers: a-z, numbers 0-9, " _ " and " : "';
            }
            if (isExisting(name) && name !== initialName) {
                return "Name is already existing";
            }
            return "";
        },
        [parseName, isExisting, initialName]
    );

    const getTextFieldIcon = useCallback(
        (name: string): ReactNode | undefined => {
            if (!parseName(name)) {
                return <Icon key="error" name="error_filled" />;
            }
            if (isExisting(name) && name !== initialName) {
                return <Icon key="warning" name="warning_filled" />;
            }
            return <Icon key="thumbs" name="thumbs_up" />;
        },
        [parseName, isExisting, initialName]
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

    const handleInputChange = (
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
    };

    const validateName = useCallback(
        (name: string): boolean => {
            if (!parseName(name)) {
                return false;
            }
            if (name === initialName) {
                return true;
            }
            if (isExisting(name)) {
                return false;
            }
            return true;
        },
        [parseName, isExisting, initialName]
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
