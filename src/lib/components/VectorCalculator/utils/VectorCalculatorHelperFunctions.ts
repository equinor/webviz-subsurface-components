import {
    ExpressionType,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";
import {
    TreeDataNode,
    TreeDataNodeMetaData,
} from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";
import TreeData from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeData";

export const parseName = (name: string): boolean => {
    const regex = new RegExp(
        /^(?=.{1,50}$)[A-Za-z]{1}([:_]?[A-Za-z0-9]+){0,}$/
    );
    return regex.test(name);
};

export const nameInVectors = (
    name: string,
    vectors: TreeDataNode[]
): boolean => {
    const nodes: string[] = name.split(":");
    let children: TreeDataNode[] | undefined = vectors;

    for (const node of nodes) {
        if (!children) {
            return false;
        }

        const foundChild: TreeDataNode | undefined = children.find(
            (child) => child.name === node
        );

        if (!foundChild) {
            return false;
        }

        children = foundChild.children;
    }
    return true;
};

export const validName = (name: string, vectors: TreeDataNode[]): boolean => {
    return parseName(name) && !nameInVectors(name, vectors);
};

export const nameParseMessage = (name: string): string => {
    if (parseName(name)) {
        return "";
    }

    if (name.length < 0) {
        return "Minimum 1 character!";
    }
    if (name.length > 50) {
        return "Maximum 50 characters!";
    }
    if (name.match(/\s+/)) {
        return "Whitespace not allowed!";
    }
    if (!name[0].match(/[A-Za-z]/)) {
        return "First character must be: a-z or A-Z";
    }
    if (name[name.length - 1].match(/[:]/)) {
        return 'Cannot end with " : "';
    }
    if (name[name.length - 1].match(/[_]/)) {
        return 'Cannot end with " _ "';
    }
    if (name.match(/[:]{2,}/)) {
        return 'Only one " : " in a row';
    }
    if (name.match(/[_]{2,}/)) {
        return 'Only one " _ " in a row';
    }
    if (name.match(/[:][^a-zA-Z0-9]{1}/)) {
        return '" : " Must be followed by: a-z, A-Z or 0-9';
    }
    if (name.match(/[_][^a-zA-Z0-9]{1}/)) {
        return '" _ " Must be followed by: a-z, A-Z or 0-9';
    }

    return 'Valid characters: a-z, A-Z, 0-9, " _ " and " : "';
};

export const nameInExpressions = (
    name: string,
    expressions: ExpressionType[]
): boolean => {
    return expressions.some((expression) => expression.name === name);
};

export const getDetailedExpression = (expression: ExpressionType): string => {
    if (!expression.isValid) {
        return "";
    }
    let detailedExpr = expression.expression;
    for (const elm of expression.variableVectorMap) {
        detailedExpr = detailedExpr.replace(
            elm.variableName,
            elm.vectorName[0]
        );
    }
    return detailedExpr;
};

export const getAvailableName = (
    nameSuggestion: string,
    expressions: ExpressionType[]
): string => {
    let availableName = nameSuggestion;
    let n = 1;
    while (nameInExpressions(availableName, expressions)) {
        availableName = `${nameSuggestion}_${n}`;
        ++n;
    }
    return availableName;
};

export const isVariableVectorMapValid = (
    variableVectorMap: VariableVectorMapType[],
    delimiter: string,
    vectorData: TreeDataNode[]
): boolean => {
    if (variableVectorMap.length <= 0) {
        return false;
    }
    const vectorNames: (string | undefined)[] = variableVectorMap.map(
        (pair) => {
            return pair.vectorName.length <= 0 ? undefined : pair.vectorName[0];
        }
    );
    return allVectorNamesValid(vectorNames, delimiter, vectorData);
};

export const allVectorNamesValid = (
    names: (string | undefined)[],
    delimiter: string,
    vectorData: TreeDataNode[]
): boolean => {
    return names.every((name) =>
        name === undefined
            ? false
            : isVectorNameValid(name, delimiter, vectorData)
    );
};

export const isVectorNameValid = (
    name: string,
    delimiter: string,
    vectorData: TreeDataNode[]
): boolean => {
    const nodePath: string[] = name.split(delimiter);
    const treeData = new TreeData({
        treeData: vectorData,
        delimiter: delimiter,
    });

    if (nodePath.length <= 0 || vectorData.length <= 0) {
        return false;
    }

    // Retrieve all meta data nodes in path
    const metaNodes: TreeDataNodeMetaData[] | null = treeData.findFirstNode(
        nodePath,
        true
    );

    return metaNodes !== null;
};
