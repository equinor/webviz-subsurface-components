from typing import List, Dict, Union
from functools import wraps
import sys
import re

if sys.version_info[0] == 3 and sys.version_info[1] >= 8:
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

import numpy as np
import pandas as pd
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
    math lib functions with numpy functions.

    I.e.: Configured expression parser for vector calculator
    """

    def __init__(self):
        super(VectorCalculatorParser, self).__init__()

        self.characterBlacklist = ['"', "'"]

        # Override internal operators and functions (whitelisting)
        self.ops1 = {
            "sqrt": np.sqrt,
            "abs": np.abs,
            "-": np.negative,
        }

        self.ops2 = {
            "+": np.add,
            "-": np.subtract,
            "*": np.multiply,
            "/": np.divide,
            "^": np.power,
        }
        self.functions = {"log": np.log}


class VectorCalculatorWrapper(VectorCalculator):
    parser = VectorCalculatorParser()

    @wraps(VectorCalculator)
    def __init__(self, *args, **kwargs):
        super(VectorCalculatorWrapper, self).__init__(
            *args, **kwargs, isDashControlled=True
        )

    @staticmethod
    def parse_expression(expression: ExpressionInfo) -> ExternalParseData:
        # Set numpy error state to raise exception in local scope
        with np.errstate(all="raise"):
            try:
                # Blacklisted characters
                blacklisted_chars = [
                    elm
                    for elm in VectorCalculatorWrapper.parser.characterBlacklist
                    if expression["expression"].__contains__(elm)
                ]
                if len(blacklisted_chars) > 0:
                    message = (
                        "Invalid characters:"
                        if len(blacklisted_chars) > 1
                        else "Invalid character:"
                    )
                    raise Exception(message + f" {blacklisted_chars}")

                parsed_expr = VectorCalculatorWrapper.parser.parse(
                    expression["expression"]
                )
                variables: List[str] = parsed_expr.variables()

                # Whitelisit rules
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

                # Evaluate to ensure valid expression (not captured by parse() method)
                # - Parser allow assignment of function to variable, e.g. parse("f(x)").evaluate({"f":np.sqrt, "x":2})
                # - Assign value to variables and evaluate to ensure valid expression
                evaluation_values = np.ones(len(variables))
                evaluation_dict = dict(zip(variables, evaluation_values))
                parsed_expr.evaluate(evaluation_dict)

                return {
                    "expression": expression["expression"],
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

    @staticmethod
    def validate_expression(expression: ExpressionInfo) -> bool:
        try:
            VectorCalculatorWrapper.parser.parse(expression["expression"])
        except:
            return False
        return True

    @staticmethod
    def evaluate_expression(
        expression: str, values: Dict[str, pd.Series]
    ) -> Union[pd.Series, None]:
        result: pd.Series = pd.Series()
        for var in values:
            if var not in expression:
                raise Exception(
                    f"Variable {var} is not present in expression '{expression}'"
                )

        try:
            parsed_expr = VectorCalculatorWrapper.parser.parse(expression)
            evaluated_expr: list = parsed_expr.evaluate(values)
            result = pd.Series(evaluated_expr)
        except:
            result = None
        return result

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
