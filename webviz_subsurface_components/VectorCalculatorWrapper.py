from typing import List, Dict, Union
from functools import wraps
import sys
import re
import warnings

if sys.version_info[0] == 3 and sys.version_info[1] >= 8:
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

import numpy as np
from py_expression_eval import Parser

from .VectorCalculator import VectorCalculator


class VariableVectorMapInfo(TypedDict):
    variableName: str
    vectorName: List[str]


class ExpressionInfo(TypedDict):
    name: str
    expression: str
    id: str
    variableVectorMap: List[VariableVectorMapInfo]
    isValid: bool
    isDeletable: bool


class ExternalParseData(TypedDict):
    expression: str
    id: str
    variables: List[str]
    isValid: bool
    message: str


class VectorCalculatorParser(Parser):
    """Creates expression parser configured to handle vector variables

    Overrides operators and functions to provide whitelist for parsing. Note that the overrides also replace
    math lib functions with numpy functions for handling array data.

    I.e.: Configured expression parser for vector calculator
    """

    def __init__(self) -> None:
        super(VectorCalculatorParser, self).__init__()

        self.characterBlacklist = ['"', "'"]

        # Whitelist with numpy operators
        self.ops1 = {
            "sqrt": np.sqrt,
            "abs": np.abs,
            "-": np.negative,
        }
        # Whitelist with numpy operators
        self.ops2 = {
            "+": np.add,
            "-": np.subtract,
            "*": np.multiply,
            "/": np.divide,
            "^": np.power,
        }
        # Whitelist with numpy functions
        self.functions = {
            "ln": np.log,  # Natural logarithm
            "log10": np.log10,  # Base-10 logarithm
        }


class VectorCalculatorWrapper(VectorCalculator):
    parser = VectorCalculatorParser()

    @wraps(VectorCalculator)
    def __init__(self, *args, **kwargs) -> None:
        super(VectorCalculatorWrapper, self).__init__(
            *args, **kwargs, isDashControlled=True
        )

    @staticmethod
    def parse_expression(expression: str) -> str:
        # Set numpy error state to raise exception in local scope
        with np.errstate(all="raise"):
            # Blacklisted characters
            blacklisted_chars = [
                elm
                for elm in VectorCalculatorWrapper.parser.characterBlacklist
                if expression.__contains__(elm)
            ]
            if len(blacklisted_chars) > 0:
                message = (
                    "Invalid characters:"
                    if len(blacklisted_chars) > 1
                    else "Invalid character:"
                )
                raise Exception(message + f" {blacklisted_chars}")

            parsed_expr = VectorCalculatorWrapper.parser.parse(expression)
            variables: List[str] = parsed_expr.variables()

            # Whitelist rules
            mul_char_vars = [elm for elm in variables if len(elm) > 1]
            if len(mul_char_vars) > 0:
                raise Exception(
                    f"Not allowed with multi character variables: {mul_char_vars}"
                )

            invalid_var_chars = [
                elm for elm in variables if not re.search("[a-zA-Z]{1}", elm)
            ]
            if len(invalid_var_chars) > 0:
                message = (
                    "Invalid variable characters:"
                    if len(invalid_var_chars) > 1
                    else "Invalid variable character:"
                )
                raise Exception(message + f" {invalid_var_chars}")

            # Ensure expression contains no invalid function call
            VectorCalculatorWrapper._raise_exception_on_invalid_function_call(
                expression
            )

            return expression

    @staticmethod
    def external_parse_data(expression: ExpressionInfo) -> ExternalParseData:
        try:
            expression_string = VectorCalculatorWrapper.parse_expression(
                expression["expression"]
            )
            variables = VectorCalculatorWrapper.parser.parse(
                expression_string
            ).variables()

            return {
                "expression": expression_string,
                "id": expression["id"],
                "variables": variables,
                "isValid": True,
                "message": "",
            }
        except Exception as e:
            return {
                "expression": expression["expression"],
                "id": expression["id"],
                "variables": [],
                "isValid": False,
                "message": "" if len(expression["expression"]) <= 0 else str(e),
            }

    def validate_expression(expression: ExpressionInfo) -> bool:
        try:
            VectorCalculatorWrapper.parse_expression(expression["expression"])
        except:
            return False
        return True

    @staticmethod
    def evaluate_expression(
        expression: str, values: Dict[str, np.ndarray]
    ) -> Union[np.ndarray, None]:
        # Ensure variables in expression
        invalid_variables = [var for var in values if var not in expression]
        if len(invalid_variables) > 0:
            warnings.warn(
                f"Variables {invalid_variables} is not present in expression '{expression}'"
            )
            return None
        try:
            expression = VectorCalculatorWrapper.parse_expression(expression)
            parsed_expr = VectorCalculatorWrapper.parser.parse(expression)
            return parsed_expr.evaluate(values)
        except ValueError as e:
            return None

    @staticmethod
    def detailed_expression(expression: ExpressionInfo) -> str:
        """Get detailed expression

        Return expression where variable name is replaced with vector name
        """
        detailed_expr: str = expression["expression"]
        var_vec_map: List[VariableVectorMapInfo] = expression["variableVectorMap"]
        for elm in var_vec_map:
            detailed_expr = detailed_expr.replace(
                elm["variableName"], elm["vectorName"][0]
            )
        return detailed_expr

    @staticmethod
    def variable_vector_dict(
        var_vec_map: List[VariableVectorMapInfo],
    ) -> Dict[str, str]:
        var_vec_dict: dict = {}
        for elm in var_vec_map:
            var_vec_dict[elm["variableName"]] = elm["vectorName"][0]
        return var_vec_dict

    @staticmethod
    def _raise_exception_on_invalid_function_call(expression: str) -> None:
        """
        Raise exception when detecting invalid function call missed by parser function.

        Parser allow assignment of function to variable, e.g. parse("f(x)").evaluate({"f":np.sqrt, "x":2}),
        and "f(x)" will thereby be successfully parsed. However, when assigning vector to "f" and "x", the
        evaluation will fail. For consistence between parsing and evaulation, this corner case is handled.

        Solution:
        - Split string at character not a-z,A-Z or 0-9 and keep all characters i split array.
        - To obtain this use positive lookahead and positive lookbehind: (?=[^a-zA-Z0-9])|(?<=[^a-zA-Z0-9])
        - Ensure character in front of "(" is whitelisted operator or function.
        - Example: "log10(x)+f(y)" -> ['log10', '(', 'x', ')', '+', 'f', '(', 'y', ')', '']
        - Doc: https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
        """

        expression_split: List[str] = VectorCalculatorWrapper._str_split(
            "(?=[^a-zA-Z0-9])|(?<=[^a-zA-Z0-9])", expression
        )

        # Remove the empty strings and whitespace.
        # - If first or last character meets split condition - emtpy string is added in front or back
        expression_split = [
            elm for elm in expression_split if not elm == "" and not elm.isspace()
        ]

        # Ensure "(" can only come after valid functions or operators, unless "(" is first character
        operators_and_functions: List[str] = (
            list(VectorCalculatorWrapper.parser.ops1.keys())
            + list(VectorCalculatorWrapper.parser.ops2.keys())
            + list(VectorCalculatorWrapper.parser.functions.keys())
        )
        for i, elm in enumerate(expression_split):
            if i == 0:
                continue

            prev_elm = expression_split[i - 1]
            if elm == "(" and not prev_elm in operators_and_functions:
                message = 'Invalid function call with "' + prev_elm + '"'
                raise Exception(message)

    def _str_split(pattern: str, string: str) -> List[str]:
        """
        String split function.

        Define split function as re.split() in Python version <= 3.6 requires non-empty
        pattern match - use separate implementation for these python versions.

        Doc: https://docs.python.org/3/library/re.html#re.split
        """
        if sys.version_info[0] == 3 and sys.version_info[1] >= 7:
            return re.split(pattern, string)
        else:
            splits = list((el.start(), el.end()) for el in re.finditer(pattern, string))
            starts = [0] + [i[1] for i in splits]
            ends = [i[0] for i in splits] + [len(string)]
            return [string[start:end] for start, end in zip(starts, ends)]
