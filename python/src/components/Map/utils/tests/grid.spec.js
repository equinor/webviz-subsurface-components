/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import jsc from "jsverify";
import { arbitraryGrid } from "./arbitraries";

describe("Grid", () => {
    jsc.property(
        "gives undefined cell for bad coords",
        arbitraryGrid,
        jsc.nat,
        jsc.nat,
        (grid, i, j) => {
            const cell = grid.getCell(i, j);
            if (i > grid.numRows || j > grid.numColumn(i) || i < 0 || j < 0) {
                return typeof cell === "undefined";
            }
            return true;
        }
    );
});
