import { Typography } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        text: {
            userSelect: "none",
        },
    })
);

interface Props {
    text: string;
}
const ErrorPlaceholder: React.FC<Props> = React.memo(({ text }: Props) => {
    // Style
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography color="secondary">{text}</Typography>
        </div>
    );
});

ErrorPlaceholder.displayName = "ErrorPlaceholder";
export default ErrorPlaceholder;
