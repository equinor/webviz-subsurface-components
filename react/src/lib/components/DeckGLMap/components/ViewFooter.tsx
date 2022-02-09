import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        viewFooter: {
            position: "absolute",
            bottom: theme.spacing(0),
            right: theme.spacing(2),
            zIndex: 999999,

            float: "right",
            backgroundColor: "#ffffffcc",
            color: "#000000ff",
            paddingLeft: "3px",
            display: "tableRow",
        },
    })
);

interface ViewFooterProps {
    children?: React.ReactNode;
}

const ViewFooter: React.FC<ViewFooterProps> = ({
    children,
}: ViewFooterProps) => {
    const classes = useStyles();
    return <div className={classes.viewFooter}>{children}</div>;
};

ViewFooter.displayName = "ViewFooter";
export default ViewFooter;
