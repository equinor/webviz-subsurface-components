import pytest
import numpy as np
from webviz_subsurface_components import py_expression_eval

from webviz_subsurface_components.py_expression_eval import ParserError

VALID_OPERATORS = ["x-y/100", "x^y", "a %b", "x/(y-z)", "x*y", "a**2", "a+d"]
VALID_FUNCTIONS = ["ln(a)-b", "log10(a-b)", "x-abs(y)", "sqrt(a-b^2)", "-y^2"]
VALID_CONSTANTS = ["E^2", "2*PI"]
VALID_EXPRESSIONS = VALID_OPERATORS + VALID_FUNCTIONS + VALID_CONSTANTS

INVALID_FUNCTIONS = ["a(b)", "log(x)", "sin(ab)", "floor(a)", "min(a)", "pyt(a,b)"]
INVALID_STRINGS = ["'a'-'b'", '"a"-"b"']
INVALID_COMMA = ["x,y", "ln(a,b)"]
INVALID_OPERATORS = ["x||y", "a==b", "x <= y", "a in ab"]
INVALID_EXPRESSIONS = (
    INVALID_FUNCTIONS + INVALID_STRINGS + INVALID_COMMA + INVALID_OPERATORS
)


def test_valid_parsing():
    parser = py_expression_eval.Parser()

    for expression in VALID_EXPRESSIONS:
        # Expect no ParserError when parsing
        try:
            parser.parse(expression)
        except ParserError as err:
            pytest.fail(
                f"Expected successful parse for valid expression: {expression}. Exception: {err}"
            )


def test_invalid_parsing():
    parser = py_expression_eval.Parser()

    for expression in INVALID_EXPRESSIONS:
        # Expect ParserError on each parse
        with pytest.raises(ParserError):
            parser.parse(expression)
            pytest.fail(
                f"Expected unsuccessful parsing and Exception raise for invalid expression: "
                f"{expression}"
            )


def test_variables():
    parser = py_expression_eval.Parser()

    assert parser.parse("ln(a)+ln(b)").variables() == ["a", "b"]
    assert parser.parse("log10(x)+sqrt(y)").variables() == ["x", "y"]
    assert parser.parse("xy^2-(a+sqrt(b))").variables() == ["xy", "a", "b"]


def test_evaluate_non_list_values():
    parser = py_expression_eval.Parser()

    # Evaluate
    assert parser.parse("1").evaluate({}) == 1
    assert parser.parse("a").evaluate({"a": 2}) == 2
    assert parser.parse("2 * 3").evaluate({}) == 6
    assert parser.parse("2 ^ x").evaluate({"x": 3}) == 8
    assert parser.parse("2 ** x").evaluate({"x": 3}) == 8
    assert parser.parse("-1.E2 ** x + 2.0E2").evaluate({"x": 1}) == 100.0
    assert parser.parse("2 + 3 * x").evaluate({"x": 4}) == 14
    assert parser.parse("-3^x").evaluate({"x": 4}) == -81
    assert parser.parse("(-3)^x").evaluate({"x": 4}) == 81
    assert parser.parse("x/(x+y)").evaluate({"x": 2, "y": 3}) == 0.4


def test_evaluate_numpy_array_values():
    parser = py_expression_eval.Parser()

    # Evaluate
    assert np.array_equal(
        parser.parse("a").evaluate({"a": np.array([2, 3, 4])}), np.array([2, 3, 4])
    )
    assert np.array_equal(
        parser.parse("a * 3").evaluate({"a": np.array([2, 3, 4])}), np.array([6, 9, 12])
    )
    assert np.array_equal(
        parser.parse("2 ^ x").evaluate({"x": [3, 5, 8]}), np.array([8, 32, 256])
    )
    assert np.array_equal(
        parser.parse("2 + 3 * x").evaluate({"x": np.array([2, 4, 5])}),
        np.array([8, 14, 17]),
    )
    assert np.array_equal(
        parser.parse("log10(x)").evaluate({"x": np.array([10, 100, 1000])}),
        np.array([1, 2, 3]),
    )
    assert np.array_equal(
        parser.parse("ln(E^x)").evaluate({"x": np.array([10, 20, 30])}),
        np.array([10, 20, 30]),
    )
    assert np.array_equal(
        parser.parse("x/(x+y)").evaluate(
            {"x": np.array([6, 7, 10]), "y": np.array([2, 3, 6])}
        ),
        np.array([0.75, 0.7, 0.625]),
    )
    assert np.array_equal(
        parser.parse("abs(x)").evaluate({"x": np.array([-3.1, -1.2, 2.3])}),
        np.array([3.1, 1.2, 2.3]),
    )
    assert np.array_equal(
        parser.parse("sqrt(x)").evaluate({"x": np.array([4, 25, 81])}),
        np.array([2, 5, 9]),
    )


def test_evaluate_logarithm():
    parser = py_expression_eval.Parser()

    # Logarithm with base-10 og natural log
    assert parser.parse("log10(100)").evaluate({}) == 2.0
    assert parser.parse("log10(1E4)").evaluate({}) == 4.0
    assert parser.parse("ln(E^100)").evaluate({}) == 100.0
    assert parser.parse("ln(E**25)").evaluate({}) == 25.0
