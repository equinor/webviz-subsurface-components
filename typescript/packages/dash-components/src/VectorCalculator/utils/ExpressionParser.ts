import { create, parseDependencies } from "mathjs";

import type { ExpressionParsingData } from "../utils/VectorCalculatorTypes";

const { parse } = create({
    parseDependencies,
});

const operatorWhitelist: string[] = ["+", "-", "*", "/", "^"];

/** Note whitelisted functions:
 * ln - Natural logarithm
 * log10 - Base-10 logarithm
 * sqrt - Square root
 */
const functionWhitelist: string[] = ["ln", "log10", "sqrt"];

type ParsingResult = { variables: string[] };

/** Parsing is handled by usage of parsing function, generating a
 * node tree - which can be further analyzed and evaluated.
 * - parsing and evaluation - https://mathjs.org/docs/expressions/parsing.html
 * - expression trees - https://mathjs.org/docs/expressions/expression_trees.html
 */
const parseExpression = (expression: string): ParsingResult => {
    if (expression.length <= 0) {
        throw new Error("Empty expression!");
    }

    if (expression.match(/\s+/)) {
        throw new Error("Whitespace not supported!");
    }

    if (!parse) {
        throw new Error("Undefined parse function!");
    }

    // Retreive node tree
    const node = parse(expression);

    const operatorNodes: string[] = [];
    const symbolNodes: string[] = [];
    const functionNodes: string[] = [];

    // Traverse and handle valid node types
    node.traverse((node) => {
        switch (node.type) {
            case "OperatorNode":
                node.op && operatorNodes.push(node.op);
                break;
            case "SymbolNode":
                node.name && symbolNodes.push(node.name);
                break;
            case "FunctionNode":
                node.fn && node.name && functionNodes.push(node.name);
                break;
            case "ConstantNode":
            case "ParenthesisNode":
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

    return { variables: variables };
};

export const getExpressionParseData = (
    expression: string
): ExpressionParsingData => {
    try {
        const variables = parseExpression(expression).variables;
        return {
            isValid: true,
            parsingMessage: "",
            variables: variables,
        };
    } catch (e) {
        // Return empty message for empty expression
        return {
            isValid: false,
            parsingMessage:
                expression.length <= 0 ? "" : String((e as Error).message),
            variables: [],
        };
    }
};
