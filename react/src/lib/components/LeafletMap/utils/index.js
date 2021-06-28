/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import * as ColorScaleUtils from "./colorScale";
import * as ImageUtils from "./image";
import * as LeafletUtils from "./leaflet";

export default {
    ...ColorScaleUtils,
    ...ImageUtils,
    ...LeafletUtils,
};
