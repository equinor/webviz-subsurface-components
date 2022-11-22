# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright (C) 2020 - Equinor ASA.

import time


from example_deckgl_3dgrid import app


def test_render_deckgl_3dgrid(dash_duo) -> None:
    dash_duo.start_server(app)
    time.sleep(5)
    assert dash_duo.get_logs() == []  # Console should have no errors
