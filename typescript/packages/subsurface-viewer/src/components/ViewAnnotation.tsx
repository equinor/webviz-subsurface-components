import React from "react";
import PropTypes from "prop-types";

export interface ViewAnnotationProps {
    id: string;
    children?: React.ReactNode;
}

export const ViewAnnotation: React.FC<ViewAnnotationProps> = ({ children }) => {
    return <> {children} </>;
};

ViewAnnotation.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.any,
};
