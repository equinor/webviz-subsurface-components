from functools import wraps
import sys

from typing import List, Dict, Union

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


class VectorCalculatorParser(Parser):
    """Creates expression parser configured to handle vector variables

    Overrides operators to handle vectors by replacing math lib functions with numpy functions

    I.e.: Configured expression parser for vector calculator
    """

    def __init__(self):
        super(VectorCalculatorParser, self).__init__()
        self.ops2["^"] = np.power
        self.functions["log"] = np.log


class VectorCalculatorWrapper(VectorCalculator):
    parser = VectorCalculatorParser()

    @wraps(VectorCalculator)
    def __init__(self, *args, **kwargs):
        super(VectorCalculatorWrapper, self).__init__(
            *args, **kwargs, isDashControlled=True
        )

    @staticmethod
    def validate_expression(expression: ExpressionInfo) -> bool:
        try:
            VectorCalculatorWrapper.parser.parse(expression["expression"])
        except:
            return False
        return True

    @staticmethod
    def parse_expression(
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
    def get_var_vec_dict(
        var_vec_map: List[VariableVectorMapInfo],
    ) -> Dict[str, str]:
        var_vec_dict: dict = {}
        for elm in var_vec_map:
            var_vec_dict[elm["variableName"]] = elm["vectorName"][0]
        return var_vec_dict
