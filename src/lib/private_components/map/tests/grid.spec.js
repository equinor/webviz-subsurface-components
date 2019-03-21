import jsc from 'jsverify';
import {arbitraryGrid} from './arbitraries';

describe('Grid', () => {
    jsc.property(
        'gives undefined cell for bad coords',
        arbitraryGrid,
        jsc.nat,
        jsc.nat,
        (grid, i, j) => {
            const cell = grid.getCell(i, j);
            if (i > grid.numRows || j > grid.numColumn(i) || i < 0 || j < 0) {
                return cell === undefined;
            }
            return true;
        }
    );
});
