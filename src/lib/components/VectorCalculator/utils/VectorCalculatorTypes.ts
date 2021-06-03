export type VariableVectorMapType = {
    variableName: string;
    vectorName: string[];
};

export type ExpressionType = {
    name: string;
    expression: string;
    id: string;
    variableVectorMap: VariableVectorMapType[];
    isValid: boolean;
};
