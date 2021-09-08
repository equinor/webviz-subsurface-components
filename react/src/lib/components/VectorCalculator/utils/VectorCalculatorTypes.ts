export type VariableVectorMapType = {
    variableName: string;
    vectorName: string[];
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

export type ExternalParseData = {
    expression: string;
    id: string;
    variables: string[];
    isValid: boolean; // Is expression successfully parsed
    message: string;
};
