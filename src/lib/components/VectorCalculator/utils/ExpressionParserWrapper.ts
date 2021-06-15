import { Parser, Expression } from "expr-eval";

export class ExpressionParserWrapper {
    private _parser: Parser;

    constructor() {
        // Expression parsing object which wraps external expression parser library to append additional
        // parsing rules.
        //
        // Valid operators: +,-,*,/,^
        // Valid functions: log(), sqrt()
        //
        // Open-soruce parsing lib: https://github.com/silentmatt/expr-eval
        //
        // Utilizing external parsing library, which handles both unary operators and pre-defined javascript
        // functions. Operators can be disabled, whereas pre-defined functions cannot be disabled.
        //
        // Note: All disabled operators will be handled as variables in parsing
        //
        // Operator example:
        // sin enabled:  x+sin(y) gives variables = ["x", "y"] and symbols = ["x", "y"]
        // sin disabled: x+sin(y) gives variables = ["x", "sin", "y"] and symbols = ["x", "sin", "y"]
        //
        // Pre-defined functions example:
        // max() : x+max(y) gives variables = ["x", "y"] and symbols = ["x", "max", "y"]

        this._parser = new Parser({
            allowMemberAccess: false,
            operators: {
                add: true,
                divide: true,
                multiply: true,
                power: true,
                subtract: true,
                sqrt: true,
                log: true,
                abs: false,
                comparison: false,
                concatenate: false,
                conditional: false,
                factorial: false,
                logical: false,
                remainder: false,
                sin: false,
                cos: false,
                tan: false,
                asin: false,
                acos: false,
                atan: false,
                sinh: false,
                cosh: false,
                tanh: false,
                asinh: false,
                acosh: false,
                atanh: false,
                ln: false,
                lg: false,
                log10: false,
                ceil: false,
                floor: false,
                round: false,
                trunc: false,
                exp: false,
                length: false,
                in: false,
                random: false,
                min: false,
                max: false,
                assignment: false,
                fndef: false,
                cbrt: false,
                expm1: false,
                log1p: false,
                sign: false,
                log2: false,
            },
        });
    }

    public parse = (expression: string): Expression => {
        const expr = this._parser.parse(expression);

        // Whitespace check
        if (expression.match("\\s+")) {
            throw new Error("Whitespace not allowed");
        }

        // Blacklist multiple expressions separator ";"
        if (expression.match("\\;+")) {
            throw new Error('Unknown characther ";"');
        }

        // Only single character variables (Note: Disabled operators will be treated as multicharacter variables)
        // E.g.: sin: false in constructor gives: x+sin(y) -> "x", "sin", "y" as variables
        const mulCharVars = expr.variables().filter((elm) => elm.length > 1);
        if (mulCharVars.length > 0) {
            throw new Error(
                "Not allowed with multi character variables: " + mulCharVars
            );
        }

        // Filter invalid pre-defined functions (Not able to disable, but will be listed in symbols if used)
        // E.g.: x+pow(y) -> "x", "pow", "y" as symbols
        const mulCharSymbols = expr.symbols().filter((elm) => elm.length > 1);
        if (mulCharSymbols.length > 0) {
            throw new Error("Invalid function: " + mulCharSymbols);
        }

        return expr;
    };

    public variables = (expression: string): string[] => {
        try {
            const expr = this.parse(expression);
            return expr.variables();
        } catch (e) {
            return [];
        }
    };

    public parseMessage = (expression: string): string => {
        try {
            this.parse(expression);
            return "";
        } catch (e) {
            return String(e);
        }
    };

    public validate = (expression: string): boolean => {
        try {
            this.parse(expression);
            return true;
        } catch (e) {
            return false;
        }
    };
}
