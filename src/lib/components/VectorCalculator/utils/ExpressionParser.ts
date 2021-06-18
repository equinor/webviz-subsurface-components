import { create, parseDependencies } from "mathjs";

const { parse } = create({
    parseDependencies,
});

const operatorWhitelist: string[] = ["+", "-", "*", "/", "^"];
const functionWhitelist: string[] = ["log", "sqrt"];

type ParseData = {
    variables: string[];
    functions: string[];
    operators: string[];
};

const parseExpression = (expression: string): ParseData => {
    if (expression.length <= 0) {
        throw new Error("");
    }

    if (expression.match(/\s+/)) {
        throw new Error("Whitespace not supported!");
    }

    if (!parse) {
        throw new Error("Undefined parse function!");
    }

    // Retreive node tree
    var node = parse(expression);

    var operatorNodes: string[] = [];
    var symbolNodes: string[] = [];
    var functionNodes: string[] = [];

    // Traverse and handle valid node types
    node.traverse((node) => {
        switch (node.type) {
            case "OperatorNode":
                node.op && operatorNodes.push(node.op);
                break;
            case "ConstantNode":
                break;
            case "ParenthesisNode":
                break;
            case "SymbolNode":
                node.name && symbolNodes.push(node.name);
                break;
            case "FunctionNode":
                node.name && functionNodes.push(node.name);
                break;
            default:
                throw new Error(`Unsupported expression node: ${node.type}`);
        }
    });

    // Whitelisting functions and operators
    for (const func of functionNodes) {
        if (!functionWhitelist.some((elm) => elm === func)) {
            throw new Error(`Unsupported function: ${func}()`);
        }
    }
    for (const op of operatorNodes) {
        if (!operatorWhitelist.some((elm) => elm === op)) {
            throw new Error(`Unsupported operator: ${op}`);
        }
    }

    // Filter duplicates
    const functions = functionNodes.filter(
        (elm, idx) => functionNodes.indexOf(elm) === idx
    );
    const operators = operatorNodes.filter(
        (elm, idx) => operatorNodes.indexOf(elm) === idx
    );
    const symbols = symbolNodes.filter(
        (elm, idx) => symbolNodes.indexOf(elm) === idx
    );

    // Variables are the symbols not present among functions
    const variables = symbols.filter(
        (sym) => !functions.some((func) => func === sym)
    );
    const mulCharVars = variables.filter((elm) => elm.length > 1);
    if (mulCharVars.length > 0) {
        throw new Error(
            "Not allowed with multi character variables: " + mulCharVars
        );
    }

    return {
        variables: variables,
        functions: functions,
        operators: operators,
    };
};

export const validateExpression = (expression: string): boolean => {
    try {
        parseExpression(expression);
        return true;
    } catch (e) {
        return false;
    }
};

export const expressionParseMessage = (expression: string): string => {
    try {
        parseExpression(expression);
        return "";
    } catch (e) {
        return String(e.message);
    }
};

export const expressionVariables = (expression: string): string[] => {
    try {
        const variables = parseExpression(expression).variables;
        return variables;
    } catch (e) {
        return [];
    }
};
