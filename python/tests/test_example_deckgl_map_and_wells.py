# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import time
import sys
import pytest

sys.path.append("examples")


from example_deckgl_map_and_wells import app


@pytest.mark.parametrize("dev_tools_serve_dev_bundles", [False, True])
def test_render_deckgl_map_and_wells(dev_tools_serve_dev_bundles, dash_duo) -> None:
    dash_duo.start_server(app)
    time.sleep(5)
    assert dash_duo.get_logs() == []  # Console should have no errors
