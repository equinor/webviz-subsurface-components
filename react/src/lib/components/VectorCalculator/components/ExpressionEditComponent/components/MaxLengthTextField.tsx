import React from "react";

import { TextField, TextFieldProps } from "@equinor/eds-core-react";

type Variants = "error" | "default";
type MaxLengthTextFieldProps = TextFieldProps & {
    maxLength: number;
};

export const MaxLengthTextField: React.FC<MaxLengthTextFieldProps> = (
    props: MaxLengthTextFieldProps
) => {
    const { maxLength, onChange, ...other } = props;
    const [variant, setVariant] = React.useState<Variants>("default");
    const [helperText, setHelperText] = React.useState<string>("");

    const errorTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        // Unmount timer
        return () => {
            errorTimer.current && clearTimeout(errorTimer.current);
        };
    }, []);

    React.useEffect(() => {
        errorTimer.current && clearTimeout(errorTimer.current);

        if (!props.value) {
            setHelperText(`0 / ${maxLength}`);
            setVariant("default");
            return;
        }

        if (props.value.length > maxLength) {
            setHelperText(`Exceeded maximum ${maxLength} characters!`);
            setVariant("error");
        } else {
            setHelperText(
                `${props.value ? props.value.length : 0} / ${maxLength}`
            );
            setVariant("default");
        }
    }, [props.value]);

    const handleOnChange = (
        e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
    ): void => {
        if (e.target.value.length >= maxLength) {
            e.target.value = e.target.value.slice(0, maxLength);

            setHelperText(`Maximum ${maxLength} characters!`);
            setVariant("error");

            errorTimer.current && clearTimeout(errorTimer.current);
            errorTimer.current = setTimeout(() => {
                setVariant("default");
                setHelperText(
                    `${
                        e.target.value ? e.target.value.length : 0
                    } / ${maxLength}`
                );
            }, 3000);
        } else {
            setHelperText(
                `${e.target.value ? e.target.value.length : 0} / ${maxLength}`
            );
            setVariant("default");
        }
        onChange && onChange(e);
    };

    return (
        <TextField
            {...other}
            onChange={handleOnChange}
            value={props.value}
            variant={variant}
            helperText={helperText}
        />
    );
};
