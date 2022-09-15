import json
import pathlib
import sys
from typing import Dict, TypedDict


class VectorDefinition(TypedDict):

    description: str
    type: str


VectorDefinitions: Dict[str, VectorDefinition] = json.loads(
    (pathlib.Path(__file__).parent / "VectorDefinitions.json").read_text()
)
