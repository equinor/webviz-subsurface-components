import json
import pathlib
import sys
from typing import Dict

if sys.version_info >= (3, 8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict


class VectorDefinition(TypedDict):
    
    description: str
    type: str


VectorDefinitions: Dict[str, VectorDefinition] = {}
with open(
    pathlib.Path(__file__).parent.joinpath("VectorDefinitions.json").absolute(), "rt"
) as file:
    VectorDefinitions = json.load(file)
