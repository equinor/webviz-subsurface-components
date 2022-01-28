# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

from __future__ import print_function as _

import json
import os as _os
import sys as _sys
import warnings

import dash as _dash
from pkg_resources import DistributionNotFound, get_distribution

from ._imports_ import *
from ._imports_ import __all__
from .py_expression_eval import Parser
from .VectorCalculatorWrapper import (
    ExpressionInfo,
    ExternalParseData,
    VariableVectorMapInfo,
)
from .VectorCalculatorWrapper import VectorCalculatorWrapper as VectorCalculator
from .VectorDefinitions import VectorDefinition, VectorDefinitions

try:
    __version__ = get_distribution(__name__).version
except DistributionNotFound:
    # package is not installed
    pass

if not hasattr(_dash, "development"):
    print(
        "Dash was not successfully imported. "
        "Make sure you don't have a file "
        'named \n"dash.py" in your current directory.',
        file=_sys.stderr,
    )
    _sys.exit(1)

_basepath = _os.path.dirname(__file__)
_filepath = _os.path.abspath(_os.path.join(_basepath, "package.json"))
with open(_filepath, encoding="utf8") as f:
    package = json.load(f)

package_name = (
    package["name"]
    .replace(" ", "_")
    .replace("-", "_")
    .replace("/", "_")
    .replace("@", "")
)

_current_path = _os.path.dirname(_os.path.abspath(__file__))

_this_module = _sys.modules[__name__]


_js_dist = [
    {
        "relative_package_path": "webviz_subsurface_components.min.js",
        "dev_package_path": "webviz_subsurface_components.dev.js",
        "namespace": package_name,
    }
]

_css_dist = [
    {
        "relative_package_path": "webviz_subsurface_components.css",
        "namespace": package_name,
    }
]

for _component in __all__:
    setattr(locals()[_component], "_js_dist", _js_dist)
    setattr(locals()[_component], "_css_dist", _css_dist)


# Deprecate the LayeredMap component

original_init = LayeredMap.__init__


def new_init(self, *args, **kwargs):
    warnings.warn(
        "LayeredMap is deprecated and will later be removed - use LeafletMap instead",
        DeprecationWarning,
    )
    return original_init(self, *args, **kwargs)


LayeredMap.__init__ = new_init
