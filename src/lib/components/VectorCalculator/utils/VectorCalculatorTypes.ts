interface HashTable {
    [key: string]: string[];
}

//export type VariableVectorMapType = { [key: string]: string[]; }

export type VariableVectorMapType = {
    variableName: string;
    vectorName: string[];
};

export type ExpressionType = {
    name: string;
    expression: string;
    id: string;
    variableVectorMap: VariableVectorMapType[];
};
