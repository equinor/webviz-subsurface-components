"""
This _specific file/module_ is licensed under the MIT license.

Copyright (c) 2015 Matthew Crumley
Copyright (c) 2015 AxioCore
Copyright (c) 2021 Equinor ASA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This is a modification of `py-expression-eval` created by AxiaCore.
Moifications are done to obtain simplified functionality for intended usage.

Thanks to AxiaCore!

`py-expression-eval:`

Author: AxiaCore S.A.S. http://axiacore.com
GitHub: https://github.com/AxiaCore/py-expression-eval/

Based on js-expression-eval, by Matthew Crumley
https://github.com/silentmatt/js-expression-eval
"""
import re

import numpy as np

TNUMBER = 0
TOP1 = 1
TOP2 = 2
TVAR = 3
TFUNCALL = 4


class ParserError(Exception):
    pass


# pylint: disable=too-few-public-methods
class Token:
    def __init__(self, type_, index_, prio_, number_):
        self.type_ = type_
        self.index_ = index_ or 0
        self.prio_ = prio_ or 0
        self.number_ = number_ if number_ is not None else 0

    def to_string(self):
        if self.type_ == TNUMBER:
            return self.number_
        if self.type_ in (TOP1, TOP2, TVAR):
            return self.index_
        if self.type_ == TFUNCALL:
            return "CALL"
        return "Invalid Token"


class Expression:
    """
    Expression based on Expression in py_expression_eval, modifications are done.

    `Adjustments:`
    Removed unused functionality as simplify, substitute and toString conversion.

    Removed possibility to assign functions to variables during evaluate(). Thereby variables
    function is simplified as well.

    `Removed functions:`

    - simplify()
    - substitute()
    - toString()
    - symbols()

    `Adjusted functions:`

    - variables() - As functions does not exist, previous symbols function is equal variables
    """

    def __init__(self, tokens, ops1, ops2):
        self.tokens = tokens
        self.ops1 = ops1
        self.ops2 = ops2

    # pylint: disable=too-many-branches
    def evaluate(self, values):
        values = values or {}
        nstack = []
        for item in self.tokens:
            type_ = item.type_
            if type_ == TNUMBER:
                nstack.append(item.number_)
            elif type_ == TOP2:
                n_2 = nstack.pop()
                n_1 = nstack.pop()
                func = self.ops2[item.index_]
                nstack.append(func(n_1, n_2))
            elif type_ == TVAR:
                if item.index_ in values:
                    nstack.append(values[item.index_])
                else:
                    raise ParserError(f"undefined variable: {item.index_}")
            elif type_ == TOP1:
                n_1 = nstack.pop()
                func = self.ops1[item.index_]
                nstack.append(func(n_1))
            elif type_ == TFUNCALL:
                n_1 = nstack.pop()
                func = nstack.pop()
                if callable(func):
                    if isinstance(n_1, list):
                        nstack.append(func(*n_1))
                    else:
                        nstack.append(func(n_1))
                else:
                    raise ParserError(f"{func} is not a function")
            else:
                raise ParserError("invalid Expression")
        if len(nstack) > 1:
            raise ParserError("invalid Expression (parity)")
        return nstack[0]

    def variables(self):
        variables = []
        for item in self.tokens:
            if item.type_ == TVAR and not item.index_ in variables:
                variables.append(item.index_)
        return variables


# pylint: disable= too-many-instance-attributes
class Parser:
    """
    Expression parser based on py_expression_eval, modifications are done.

    `Adjustments:`
    The set of self.ops1 and self.ops2 is adjusted - reduced number of operators and assigned
    numpy-functions to handle array values for variables in Expression.evaluate().

    Removed handling of comma, string input and logical operators.

    Removed self.functions dict, as the keys were handled as variables during expression parsing.
    All functions are placed in self.ops1.

    Removed self.LPAREN "(" as expected next character for isVar()-check in parse() function. This
    is to prevent expressions as "a(b)" which fails when evaluating with vector data for a and b.
    Thereby consistency between Parser.parse() and Expression.evaluate() is kept.

    `Removed functions:`

    - isComma()
    - isString()  - including unescape() function
    - isLogicalNot()

    `Adjusted functions:`

    - isOperator() - reduced number of operators according to self.ops2 items
    - functions moved into ops2 as members of self.functions are handled as variables
    and will be assigned during evaluate()

    """

    PRIMARY = 1
    OPERATOR = 2
    FUNCTION = 4
    LPAREN = 8
    RPAREN = 16
    SIGN = 32
    CALL = 64
    NULLARY_CALL = 128

    def __init__(self, string_literal_quotes=("'", '"')):
        self.string_literal_quotes = string_literal_quotes

        self.success = False
        self.errormsg = ""
        self.expression = ""

        self.pos = 0

        self.tokennumber = 0
        self.tokenprio = 0
        self.tokenindex = 0
        self.tmpprio = 0

        # Note: All functions should be in self.ops1 as items are handled as functions
        self.ops1 = {
            "sqrt": np.sqrt,
            "abs": np.abs,
            "-": np.negative,
            "ln": np.log,  # Natural logarithm
            "log10": np.log10,  # Base-10 logarithm
        }

        self.ops2 = {
            "+": np.add,
            "-": np.subtract,
            "*": np.multiply,
            "/": np.divide,
            "%": np.mod,
            "^": np.power,
            "**": np.power,
        }

        self.consts = {
            "E": np.e,
            "PI": np.pi,
        }

    # pylint: disable = too-many-branches, too-many-statements
    def parse(self, expr):
        self.errormsg = ""
        self.success = True
        operstack = []
        tokenstack = []
        self.tmpprio = 0
        expected = self.PRIMARY | self.LPAREN | self.FUNCTION | self.SIGN
        noperators = 0
        self.expression = expr
        self.pos = 0

        while self.pos < len(self.expression):
            if self.is_operator():
                if self.is_sign() and expected & self.SIGN:
                    if self.is_negative_sign():
                        self.tokenprio = 5
                        self.tokenindex = "-"
                        noperators += 1
                        self.addfunc(tokenstack, operstack, TOP1)
                    expected = self.PRIMARY | self.LPAREN | self.FUNCTION | self.SIGN
                else:
                    if expected and self.OPERATOR == 0:
                        self.error_parsing(self.pos, "unexpected operator")
                    noperators += 2
                    self.addfunc(tokenstack, operstack, TOP2)
                    expected = self.PRIMARY | self.LPAREN | self.FUNCTION | self.SIGN
            elif self.is_number():
                if expected and self.PRIMARY == 0:
                    self.error_parsing(self.pos, "unexpected number")
                token = Token(TNUMBER, 0, 0, self.tokennumber)
                tokenstack.append(token)
                expected = self.OPERATOR | self.RPAREN
            elif self.is_left_parenth():
                if (expected & self.LPAREN) == 0:
                    self.error_parsing(self.pos, 'unexpected "("')
                if expected & self.CALL:
                    noperators += 2
                    self.tokenprio = -2
                    self.tokenindex = -1
                    self.addfunc(tokenstack, operstack, TFUNCALL)
                expected = (
                    self.PRIMARY
                    | self.LPAREN
                    | self.FUNCTION
                    | self.SIGN
                    | self.NULLARY_CALL
                )
            elif self.is_right_parenth():
                if expected & self.NULLARY_CALL:
                    token = Token(TNUMBER, 0, 0, [])
                    tokenstack.append(token)
                elif (expected & self.RPAREN) == 0:
                    self.error_parsing(self.pos, 'unexpected ")"')
                expected = self.OPERATOR | self.RPAREN | self.LPAREN | self.CALL
            elif self.is_const():
                if (expected & self.PRIMARY) == 0:
                    self.error_parsing(self.pos, "unexpected constant")
                consttoken = Token(TNUMBER, 0, 0, self.tokennumber)
                tokenstack.append(consttoken)
                expected = self.OPERATOR | self.RPAREN
            elif self.is_op2():
                if (expected & self.FUNCTION) == 0:
                    self.error_parsing(self.pos, "unexpected function")
                self.addfunc(tokenstack, operstack, TOP2)
                noperators += 2
                expected = self.LPAREN
            elif self.is_op1():
                if (expected & self.FUNCTION) == 0:
                    self.error_parsing(self.pos, "unexpected function")
                self.addfunc(tokenstack, operstack, TOP1)
                noperators += 1
                expected = self.LPAREN
            elif self.is_var():
                if (expected & self.PRIMARY) == 0:
                    self.error_parsing(self.pos, "unexpected variable")
                vartoken = Token(TVAR, self.tokenindex, 0, 0)
                tokenstack.append(vartoken)
                expected = self.OPERATOR | self.RPAREN | self.CALL
            elif self.is_white():
                pass
            else:
                if self.errormsg == "":
                    self.error_parsing(self.pos, "unknown character")
                else:
                    self.error_parsing(self.pos, self.errormsg)
        if self.tmpprio < 0 or self.tmpprio >= 10:
            self.error_parsing(self.pos, 'unmatched "()"')
        while len(operstack) > 0:
            tmp = operstack.pop()
            tokenstack.append(tmp)
        if (noperators + 1) != len(tokenstack):
            self.error_parsing(self.pos, "parity")

        return Expression(tokenstack, self.ops1, self.ops2)

    def evaluate(self, expr, variables):
        return self.parse(expr).evaluate(variables)

    def error_parsing(self, column, msg):
        self.success = False
        self.errormsg = (
            f"parse error [column {column}]: {msg}, expression: {self.expression}"
        )
        raise ParserError(self.errormsg)

    def addfunc(self, tokenstack, operstack, type_):
        operator = Token(
            type_,
            self.tokenindex,
            self.tokenprio + self.tmpprio,
            0,
        )
        while len(operstack) > 0:
            if operator.prio_ <= operstack[len(operstack) - 1].prio_:
                tokenstack.append(operstack.pop())
            else:
                break
        operstack.append(operator)

    def is_number(self):
        res = False

        if self.expression[self.pos] == "E":
            return False

        # number in scientific notation
        pattern = r"([-+]?([0-9]*\.?[0-9]*)[eE][-+]?[0-9]+).*"
        match = re.match(pattern, self.expression[self.pos :])
        if match:
            self.pos += len(match.group(1))
            self.tokennumber = float(match.group(1))
            return True

        # number in decimal
        _str = ""
        while self.pos < len(self.expression):
            code = self.expression[self.pos]
            if "0" <= code <= "9" or code == ".":
                if len(_str) == 0 and code == ".":
                    _str = "0"
                _str += code
                self.pos += 1
                try:
                    self.tokennumber = int(_str)
                except ValueError:
                    self.tokennumber = float(_str)
                res = True
            else:
                break
        return res

    def is_const(self):
        for constant_name, constant_value in self.consts.items():
            _len = len(constant_name)
            _str = self.expression[self.pos : self.pos + _len]
            if constant_name == _str:
                if len(self.expression) <= self.pos + _len:
                    self.tokennumber = constant_value
                    self.pos += _len
                    return True
                if (
                    not self.expression[self.pos + _len].isalnum()
                    and self.expression[self.pos + _len] != "_"
                ):
                    self.tokennumber = constant_value
                    self.pos += _len
                    return True
        return False

    def is_operator(self):
        ops = (
            ("**", 8, "**"),
            ("^", 8, "^"),
            ("%", 6, "%"),
            ("/", 6, "/"),
            ("\u2219", 5, "*"),  # bullet operator
            ("\u2022", 5, "*"),  # black small circle
            ("*", 5, "*"),
            ("+", 4, "+"),
            ("-", 4, "-"),
        )
        for token, priority, index in ops:
            if self.expression.startswith(token, self.pos):
                self.tokenprio = priority
                self.tokenindex = index
                self.pos += len(token)
                return True
        return False

    def is_sign(self):
        code = self.expression[self.pos - 1]
        return code in ("+", "-")

    def is_positive_sign(self):
        code = self.expression[self.pos - 1]
        return code == "+"

    def is_negative_sign(self):
        code = self.expression[self.pos - 1]
        return code == "-"

    def is_left_parenth(self):
        code = self.expression[self.pos]
        if code == "(":
            self.pos += 1
            self.tmpprio += 10
            return True
        return False

    def is_right_parenth(self):
        code = self.expression[self.pos]
        if code == ")":
            self.pos += 1
            self.tmpprio -= 10
            return True
        return False

    def is_white(self):
        code = self.expression[self.pos]
        if code.isspace():
            self.pos += 1
            return True
        return False

    def is_op1(self):
        _str = ""
        for i in range(self.pos, len(self.expression)):
            char = self.expression[i]
            if char.upper() == char.lower():
                if i == self.pos or (char != "_" and (char < "0" or char > "9")):
                    break
            _str += char
        if len(_str) > 0 and _str in self.ops1:
            self.tokenindex = _str
            self.tokenprio = 9
            self.pos += len(_str)
            return True
        return False

    def is_op2(self):
        _str = ""
        for i in range(self.pos, len(self.expression)):
            char = self.expression[i]
            if char.upper() == char.lower():
                if i == self.pos or (char != "_" and (char < "0" or char > "9")):
                    break
            _str += char
        if len(_str) > 0 and (_str in self.ops2):
            self.tokenindex = _str
            self.tokenprio = 9
            self.pos += len(_str)
            return True
        return False

    def is_var(self):
        _str = ""
        for i in range(self.pos, len(self.expression)):
            char = self.expression[i]
            if (
                char.lower() == char.upper()
                and not (char in "_.")
                and (char < "0" or char > "9")
            ):
                break
            _str += char
        if _str:
            self.tokenindex = _str
            self.tokenprio = 6
            self.pos += len(_str)
            return True
        return False
