import jsc from 'jsverify';
import {
    arbitraryCell,
    arbitraryNonEmptyCell,
    arbitraryPoint,
} from './arbitraries';

describe('Cell', () => {
    jsc.property(
        'has consistent i setter/getter',
        arbitraryCell,
        jsc.nat,
        (cell, n) => {
            cell.i = n; // eslint-disable-line no-param-reassign
            return cell.i === n;
        }
    );

    jsc.property(
        'has consistent j setter/getter',
        arbitraryCell,
        jsc.nat,
        (cell, n) => {
            cell.j = n; // eslint-disable-line no-param-reassign
            return cell.j === n;
        }
    );

    jsc.property(
        'non-empty cells have non-zero jacobian determinant',
        arbitraryNonEmptyCell,
        arbitraryPoint,
        (cell, point) => Math.abs(cell.jacobian(point).determinant()) !== 0
    );
});
