/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */
import jsc from "jsverify";
import { affineIndependent, Vector, Matrix } from "../linear_algebra";
import { Cell } from "../cell";
import Grid from "../grid";
import Field from "../field";
import Particle from "../particle";

export const arbitrarySizedArray = (arb, size) =>
    jsc.tuple(new Array(size).fill(0).map(() => arb));

export const arbitraryCell = arbitrarySizedArray(jsc.number, 14).smap(
    ([c1, c2, c3, c4, c5, c6, c7, c8, i, j, fx0, fx1, fy0, fy1]) =>
        new Cell(
            [
                [c1, c2],
                [c3, c4],
                [c5, c6],
                [c7, c8],
            ],
            i,
            j,
            fx0,
            fy0,
            fx1,
            fy1
        ),
    (c) => c.corners.values().concat([c.i, c.j]).concat(c.flux.values())
);

export const arbitraryPoint = arbitrarySizedArray(jsc.number(0, 1), 2).smap(
    (l) => new Vector(l),
    (v) => Array.from(v)
);

export const arbitraryNonEmptyCell = jsc.suchthat(arbitraryCell, (c) => {
    const [c1, c2, c3, c4] = c.corners;
    const cornerCombos = [
        [c1, c2, c3],
        [c1, c2, c4],
        [c2, c3, c4],
        [c1, c3, c4],
    ];
    return cornerCombos.some(affineIndependent);
});

function arbitraryMatrixArray(maxn, maxm) {
    return jsc.bless({
        generator(size) {
            const rowsize = jsc.random(0, maxn ? Math.min(size, maxn) : size);
            let colsize = jsc.random(
                0,
                rowsize ? Math.ceil(size / rowsize) : size
            );
            if (maxm) {
                colsize = Math.min(colsize, maxm);
            }
            const arr = new Array(colsize);
            for (let i = 0; i < colsize; i += 1) {
                arr[i] = new Array(rowsize);
                for (let j = 0; j < rowsize; j += 1) {
                    arr[i][j] = jsc.random(0, size);
                }
            }
            return arr;
        },
        shrink: jsc.array.shrink,
    });
}

export const arbitraryVector = jsc.array(jsc.number).smap(
    (l) => new Vector(l),
    (v) => Array.from(v)
);

export function arbitraryMatrix(maxm, maxn) {
    return arbitraryMatrixArray(maxm, maxn).smap(
        (l) => new Matrix(l),
        (m) => Array.from(m).map((d) => Array.from(d))
    );
}

export function arbitrarySquareMatrix(maxm, maxn) {
    return jsc.suchthat(
        arbitraryMatrix(maxm, maxn),
        jsc.bool,
        (l) => l.length === l.rowLength
    );
}

function distinctIndecies(cells) {
    const newCells = [...cells];
    const rows = Math.ceil(Math.sqrt(cells.length));
    let i = 0;
    let j = 0;
    for (let k = 0; k < cells.length; k += 1) {
        newCells[k].i = i;
        newCells[k].j = j;
        i += 1;
        if (i > rows) {
            j += 1;
            i = 0;
        }
    }
    return newCells;
}

export const arbitraryGrid = jsc.array(arbitraryNonEmptyCell).smap(
    (l) => new Grid(distinctIndecies(l)),
    (g) => g.getCells()
);

export const arbitraryField = arbitraryGrid.smap(
    (g) => new Field(g),
    (f) => f.grid
);

export const arbitraryParticle = jsc
    .tuple([arbitraryPoint, arbitraryField])
    .smap(
        ([p, f]) => new Particle(p, f.grid.getCell(0, 0), f),
        (p) => [p.normalPosition, p.field]
    );
