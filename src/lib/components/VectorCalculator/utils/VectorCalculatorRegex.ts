export const parseExpressionName = (name: string): boolean => {
    const regex = new RegExp(
        /^(?=.{1,50}$)[A-Za-z]{1}([:_]?[A-Za-z0-9]+){0,}$/
    );
    return regex.test(name);
};

export const parseExpression = (expression: string): boolean => {
    /// Regex parsing equations
    const regex = new RegExp(
        /^\-?(\((\-?[a-zA-Z]{1}|[\d\.]{1,})([\+\*\/\-\^]{1}([a-zA-Z]{1}|[\d\.]{1,})){0,}\)|([a-zA-Z]{1}|[\d\.]{1,})){1}(([\+\*\/\-\^]{1}\(([a-zA-Z]{1}|[\d\.]{1,})([\+\*\/\-\^]{1}([a-zA-Z]{1}|[\d\.]{1,})){0,}\))|([\+\*\/\-\^]{1}([a-zA-Z]{1}|[\d\.]{1,}))){0,}$/
    );
    return regex.test(expression);
};

export const retrieveVariablesFromExpression = (
    expression: string
): string[] => {
    if (!parseExpression(expression)) {
        return [];
    }

    const res: string[] = [];

    // Retreive list of variables for parsed expression
    const regex = /[a-zA-Z]/g;
    const variables = expression.match(regex);
    if (variables === null) {
        return res;
    }

    // Ensure only one occurence of each variable
    for (const variable of variables) {
        if (!res.includes(variable)) {
            res.push(variable);
        }
    }
    return res;
};
