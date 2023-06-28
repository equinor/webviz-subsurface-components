import { v4 as uuidv4 } from "uuid";

import { ExpressionType, VariableVectorMapType } from "./VectorCalculatorTypes";
import {
    TreeData,
    TreeDataNode,
    TreeDataNodeMetaData,
} from "@webviz/core-components";

export const getDefaultExpression = (): ExpressionType => {
    return {
        name: "",
        expression: "x+2*y",
        id: uuidv4(),
        variableVectorMap: [
            { variableName: "x", vectorName: [] },
            { variableName: "y", vectorName: [] },
        ],
        isValid: false,
        isDeletable: true,
    };
};

export const isValidExpressionNameString = (name: string): boolean => {
    const regex = new RegExp(
        /^(?=.{1,50}$)[A-Za-z]{1}([:_]?[A-Za-z0-9]+){0,}$/
    );
    return regex.test(name);
};

export const isNameOccupiedByVectors = (
    name: string,
    vectors: TreeDataNode[]
): boolean => {
    const nodes: string[] = name.split(":");
    let children: TreeDataNode[] = vectors;

    for (const node of nodes) {
        const childNode: TreeDataNode | undefined = children.find(
            (child) => child.name === node
        );
        // Node is available child node
        if (!childNode) {
            return false;
        }

        // Name occupied if child is last node of vector name path
        if (!childNode.children || childNode.children.length <= 0) {
            return true;
        }
        children = childNode.children;
    }
    // Did not find available child node
    return true;
};

export const isExpressionNameValidAndNotOccupiedByVectors = (
    name: string,
    vectors: TreeDataNode[]
): boolean => {
    return (
        isValidExpressionNameString(name) &&
        !isNameOccupiedByVectors(name, vectors)
    );
};

export const expressionNameValidationMessage = (name: string): string => {
    if (isValidExpressionNameString(name)) {
        return "";
    }

    if (name.length <= 0) {
        return "Empty name!";
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

export const doesNameExistInExpressionList = (
    name: string,
    expressions: ExpressionType[]
): boolean => {
    return expressions.some((expression) => expression.name === name);
};

export const getDetailedExpression = (expression: ExpressionType): string => {
    if (!expression.isValid) {
        return "";
    }

    // Retreive map as maptype
    const map = getVariablesVectorMap(expression.variableVectorMap);

    // Split if positive lookahead or positive lookbehind character is not character a-zA-Z.
    // Doc: https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
    const expressionSplit = expression.expression.split(
        /(?=[^a-zA-Z])|(?<=[^a-zA-Z])/g
    );

    // Iterate thorugh list and replace variables from map with vector name
    const newExpression: string[] = [];
    for (const elm of expressionSplit) {
        const mapElm = map.get(elm);
        if (mapElm) {
            newExpression.push(mapElm);
            continue;
        }
        newExpression.push(elm);
    }
    return newExpression.join("");
};

const getVariablesVectorMap = (
    variableVectorMap: VariableVectorMapType[]
): Map<string, string> => {
    const map = new Map<string, string>();
    variableVectorMap.forEach((elm) =>
        map.set(elm.variableName, elm.vectorName[0])
    );
    return map;
};

export const getAvailableName = (
    nameSuggestion: string,
    expressions: ExpressionType[]
): string => {
    let availableName = nameSuggestion;
    let n = 1;
    while (doesNameExistInExpressionList(availableName, expressions)) {
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
    return areAllVectorNamesValid(vectorNames, delimiter, vectorData);
};

export const areVariableVectorMapsEqual = (
    first: VariableVectorMapType[],
    second: VariableVectorMapType[]
): boolean => {
    if (first.length !== second.length) {
        return false;
    }

    // Compare if the element matches in the same index
    const res = first.every((elm, idx) => {
        return (
            elm.variableName === second[idx].variableName &&
            elm.vectorName[0] === second[idx].vectorName[0]
        );
    });

    return res;
};

export const areAllVectorNamesValid = (
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
        allowOrOperator: false,
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

export const createVariableVectorMapFromVariables = (
    variables: string[],
    variableVectorMap: VariableVectorMapType[]
): VariableVectorMapType[] => {
    return variables.map((variable) => {
        const mapElm = variableVectorMap.find(
            (elm) => elm.variableName === variable
        );
        if (!mapElm) {
            return { variableName: variable, vectorName: [] };
        } else {
            return mapElm;
        }
    });
};
