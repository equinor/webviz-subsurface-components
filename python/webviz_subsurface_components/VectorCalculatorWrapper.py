import re
import warnings
from functools import wraps
from typing import Dict, List, TypedDict, Union

import numpy as np

from .py_expression_eval import Parser, ParserError
from .VectorCalculator import VectorCalculator


class VariableVectorMapInfo(TypedDict):
    """
    Variable vector map pair

    `Description`:
    Dictionary with pair of varible name and mapped vector name

    `Required keys`:
    * variableName: str, variable name
    * vectorName: List[str], vector name
    """

    variableName: str
    vectorName: List[str]


class ExpressionInfoBase(TypedDict):
    """
    Base dict for expression info type

    `Description`:
    Dictionary with all required items for an expression

    `Required keys`:
    * name: str, expression name
    * expression: str, mathematical expression
    * id: str, identifier string
    * variableVectorMap: List[VariableVectorMapInfo], List of variable- and vector name pairs
    * isValid: bool, valid state for expression
    * isDeletable: bool, True if expression can be deleted, False otherwise
    """

    name: str
    expression: str
    id: str
    variableVectorMap: List[VariableVectorMapInfo]
    isValid: bool
    isDeletable: bool


class ExpressionInfo(ExpressionInfoBase, total=False):
    """
    Expression info dict for expression info, with required and non-required keys.

    `Description`:\n
    Dictionary with all possible items for an expression.
    All keys of ExpressionInfoBase are required keys, appended keys in ExpressionInfo are non-required.

    `Non-required keys`:
    * description: str, description of mathematical expression

    `Required keys`:
    * name: str, expression name
    * expression: str, mathematical expression
    * id: str, identifier string
    * variableVectorMap: List[VariableVectorMapInfo], List of variable- and vector name pairs
    * isValid: bool, valid state for expression
    * isDeletable: bool, True if expression can be deleted, False otherwise

    `Doc`: https://mypy.readthedocs.io/en/latest/more_types.html#mixing-required-and-non-required-items
    """

    description: str


class ExternalParseData(TypedDict):
    """
    Expression parse data type

    `Description`:\n
    Dictionary with all required items for external parsing status of expression

    `Required keys`:
    * expression: str, mathematical expression
    * id: str, identifier string
    * variables: List[str], list of all variables
    * isValid: bool, parsing state for expression
    * message: str, parsing message
    """

    expression: str
    id: str
    variables: List[str]
    isValid: bool
    message: str


class VectorCalculatorWrapper(VectorCalculator):
    parser = Parser()
    max_description_length = 50

    @wraps(VectorCalculator)
    def __init__(self, *args, **kwargs) -> None:
        super(VectorCalculatorWrapper, self).__init__(
            *args,
            **kwargs,
            isDashControlled=True,
            maxExpressionDescriptionLength=self.max_description_length,
        )

    @staticmethod
    def parse_expression(expression: str) -> str:
        VectorCalculatorWrapper.parser.parse(expression)
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
        except ParserError as e:
            return {
                "expression": expression["expression"],
                "id": expression["id"],
                "variables": [],
                "isValid": False,
                "message": "" if len(expression["expression"]) == 0 else str(e),
            }

    def validate_expression(expression: ExpressionInfo) -> bool:
        try:
            VectorCalculatorWrapper.parse_expression(expression["expression"])
        except ParserError as e:
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
        except ParserError as e:
            return None

    @staticmethod
    def detailed_expression(expression: ExpressionInfo) -> str:
        """Get detailed expression

        Return expression where variable name is replaced with vector name
        """
        expr: str = expression["expression"]
        var_vec_dict = VectorCalculatorWrapper.variable_vector_dict(
            expression["variableVectorMap"]
        )

        # Split if positive lookahead or positive lookbehind character is not character a-zA-Z0-9
        # to keep string split separator.
        # Doc: https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
        #
        # Note: re.split() usage requires Python version >= 3.7 due to pattern that could match an
        # empty string.
        # Doc: https://docs.python.org/3/library/re.html#re.split
        expr_split: List[str] = re.split("(?=[^a-zA-Z0-9])|(?<=[^a-zA-Z0-9])", expr)

        detailed_expr: List[str] = []
        for elm in expr_split:
            if elm in var_vec_dict.keys():
                detailed_expr.append(var_vec_dict[elm])
                continue
            detailed_expr.append(elm)
        return "".join(detailed_expr)

    @staticmethod
    def variable_vector_dict(
        var_vec_map: List[VariableVectorMapInfo],
    ) -> Dict[str, str]:
        var_vec_dict: dict = {}
        for elm in var_vec_map:
            var_vec_dict[elm["variableName"]] = elm["vectorName"][0]
        return var_vec_dict
