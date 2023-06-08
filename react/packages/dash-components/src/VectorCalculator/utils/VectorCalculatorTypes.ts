import PropTypes from "prop-types";

export type VariableVectorMapType = {
    variableName: string;
    vectorName: string[];
};

export const VariableVectorMapTypePropTypes = {
    variableName: PropTypes.string.isRequired,
    vectorName: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export type ExpressionType = {
    name: string;
    expression: string;
    id: string;
    variableVectorMap: VariableVectorMapType[];
    description?: string;
    isValid: boolean; ///! Is name, expression and map valid
    isDeletable: boolean;
};

export const ExpressionTypePropTypes = {
    name: PropTypes.string.isRequired,
    expression: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    variableVectorMap: PropTypes.arrayOf(
        PropTypes.shape(VariableVectorMapTypePropTypes).isRequired
    ).isRequired,
    description: PropTypes.string,
    isValid: PropTypes.bool.isRequired,
    isDeletable: PropTypes.bool.isRequired,
};

/// Data sent to external parser
export type ExternalParseData = {
    expression: string;
    id: string;
    variables: string[];
    isValid: boolean; // Is expression successfully parsed
    message: string;
};

export const ExternalParseDataPropTypes = {
    expression: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    variables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    isValid: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
};

/// Data retrieved from parsing (for both external and internal)
export type ExpressionParsingData = {
    isValid: boolean;
    parsingMessage: string;
    variables: string[];
};
