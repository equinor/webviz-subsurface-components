import json
import random
from datetime import datetime

# note this file must be updated to new latest input format used by GroupTree.


def create_node(depth, child_no):
    is_inactive = random.randint(0, 10)
    return {
        "name": "{}_{}".format(depth, child_no),
        "children": [],
        "pressure": random.randint(8, 16) * is_inactive,
        "oilrate": random.randint(1, 200) * is_inactive,
        "waterrate": random.randint(1, 20) * is_inactive,
        "gasrate": random.randint(1, 20) * is_inactive,
        "grupnet": grupnetchars[random.randint(0, len(grupnetchars) - 1)]
        if is_inactive == 0
        else random.randint(1, 60) * is_inactive,
    }


def grow_tree(root, depth, max_width):
    depth -= 1
    if depth > 0 and random.randint(0, 10) > 1:
        for c in range(0, random.randint(1, max_width)):
            child = grow_tree(create_node(depth, c), depth, max_width)
            root["children"].append(child)
            #add up children rates
            root["oilrate"]+=child["oilrate"]
            root["waterrate"]+=child["waterrate"]
            root["gasrate"]+=child["gasrate"]

    return root


iteration_names = ["Iter_{}".format(i) for i in range(0, 5)]
iteration_names.append("pred")

grupnetchars = ["Z", "M", "F"]

iterations = {
    n: {
        "trees": {
            datetime(2000 + d, 1, 1).strftime("%m/%d/%Y"): grow_tree(
                create_node(4, 0), 4, 5
            )
            for d in range(0, random.randint(3, 12))
        }
    }
    for n in iteration_names
}

data = {"iterations": iterations}
# more human friendly output:
with open("group-tree.json", "w") as outfile:
    json.dump(data, outfile, indent=2)
