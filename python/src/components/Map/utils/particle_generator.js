/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import Particle from "./particle";
/**
 * Generates particles in the given field.
 */
export default class ParticleGenerator {
    constructor(field) {
        this.field = field;
    }

    /**
     * @returns a randomly generated particle.
     */
    generate() {
        const { grid } = this.field;
        let cell;
        while (!cell) {
            const i = Math.floor(Math.random() * grid.numRows);
            const j = Math.floor(Math.random() * grid.maxColumn);
            cell = grid.getCell(i, j);
        }
        return new Particle([Math.random(), Math.random()], cell, this.field);
    }
}
