/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint no-magic-numbers: 0 */
import React, { Component } from "react";

import Map from "../lib/components/Map";

const data = require("./example-data/subsurface-map.json");

class SubsurfaceMapDemo extends Component {
    render() {
        return (
            <div>
                <Map id={"subsurface_map"} data={data} />
            </div>
        );
    }
}

export default SubsurfaceMapDemo;
