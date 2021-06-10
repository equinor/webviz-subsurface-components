export type VariableVectorMapType = {
    variableName: string;
    vectorName: string[];
};

export type ExpressionType = {
    name: string;
    expression: string;
    id: string;
    variableVectorMap: VariableVectorMapType[];
    isValid: boolean; ///! Is name, expression and map valid
    isDeletable: boolean;
};

export type ExternalParseData = {
    // TODO: Add message string for parsing failure?
    expression: string;
    id: string;
    variables: string[];
    isValid: boolean; // Is expression successfully parsed
};
