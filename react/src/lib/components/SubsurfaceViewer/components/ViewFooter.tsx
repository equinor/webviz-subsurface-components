import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/system";

const StyledViewFooter = styled("div")(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(0),
    right: theme.spacing(2),
    zIndex: 999999,

    float: "right",
    backgroundColor: "#ffffffcc",
    color: "#000000ff",
    paddingLeft: "3px",
    display: "tableRow",
}));

interface ViewFooterProps {
    children?: React.ReactNode;
}

export const ViewFooter: React.FC<ViewFooterProps> = ({
    children,
}: ViewFooterProps) => {
    return <StyledViewFooter>{children}</StyledViewFooter>;
};

ViewFooter.propTypes = {
    children: PropTypes.any,
};
