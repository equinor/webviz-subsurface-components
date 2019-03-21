import {range} from './util';
/**
 * Two dimensional grid of Cells.
 */
export default class Grid {
    /**
     * Constructor
     * @parameter {[Cell]} cells - Array of the cells, must
     * have only one cell for each i and j coordinates.
     * @throws Error - If two cells have the same i and j coordinates.
     */
    constructor(cells) {
        this._data = [];
        cells.forEach(c => {
            if (!this._data[c.i]) {
                this._data[c.i] = [];
            }
            if (this._data[c.i][c.j]) {
                throw Error(`Two cells given position (${c.i}, ${c.j})`);
            }
            this._data[c.i][c.j] = c;
        });
    }

    /**
     * @param {number} i
     * @param {number} j
     * @returns {Cell} The cell with given i,j-coordinate.
     */
    getCell(i, j) {
        if (this._data[i] === undefined) {
            return undefined;
        }
        return this._data[i][j];
    }

    getCells() {
        return this._data.reduce((a, b) => a.concat(b), []);
    }

    get numRows() {
        return this._data.length;
    }

    get maxColumn() {
        return Math.max(...range(this.numRows).map(this.numColumn.bind(this)));
    }

    numColumn(i) {
        if (this._data[i] === undefined) {
            return 0;
        }
        return this._data[i].length;
    }
}
