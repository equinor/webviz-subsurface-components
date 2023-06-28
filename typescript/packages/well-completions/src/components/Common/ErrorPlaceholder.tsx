import { Typography } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React from "react";

const PREFIX = "ErrorPlaceholder";

const classes = {
    root: `${PREFIX}-root`,
    text: `${PREFIX}-text`,
};

const Root = styled("div")(() => ({
    [`&.${classes.root}`]: {
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    [`& .${classes.text}`]: {
        userSelect: "none",
    },
}));

interface Props {
    text: string;
}
const ErrorPlaceholder: React.FC<Props> = React.memo(({ text }: Props) => {
    // Style

    return (
        <Root className={classes.root}>
            <Typography color="secondary">{text}</Typography>
        </Root>
    );
});

ErrorPlaceholder.displayName = "ErrorPlaceholder";
export default ErrorPlaceholder;
