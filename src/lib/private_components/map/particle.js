import {Vector} from './linear_algebra';

/**
 * A particle in a given flow field. The particle decays until it
 * is dead.
 */
export default class Particle {
    /**
     * @param {number} normalX - The normalized quadrilateral x-coordinate
     *      of the particle.
     * @param {number} normalY - The normalized quadrilateral y-coordinate
     *      of the particle.
     * @param {Cell} cell - the cell the particle is in.
     * @param {Field} field - The flow field of the particle.
     */
    constructor([normalX, normalY], cell, field) {
        this._field = field;
        this._normalPosition = new Vector([normalX, normalY]);
        this._liveness = 300.0 * (0.8 + 0.4 * Math.random());
        this._decayRate = 1;
        this._abandonDecayMult = 0.1;
        this._deadThreshold = 0.1;
        if (cell) {
            this._cell = cell;
            this._position = this._cell.denormalize(this._normalPosition);
        } else {
            this._abandoned = true;
        }
    }

    /**
     * Real coordinates of the particle.
     */
    get position() {
        return this._position;
    }

    get normalPosition() {
        return this._normalPosition;
    }

    set normalPosition(normalPosition) {
        this._previousPosition = this.position;
        this._normalPosition = normalPosition;
        this._position = this._cell.denormalize(this._normalPosition);
    }

    set cell(cell) {
        this._cell = cell;
    }

    abandon() {
        this._abandoned = true;
    }

    get cell() {
        return this._cell;
    }

    get field() {
        return this._field;
    }

    /**
     * If the particle has been simulated, the position of the particle
     * before the simulation was performed.
     */
    get previousPosition() {
        if (!this._previousPosition) {
            return this.position;
        }
        return this._previousPosition;
    }

    /**
     * Whether the particle is abandoned, i.e. not belonging to a cell.
     */
    get abandoned() {
        return this._abandoned;
    }

    /**
     * Whether the particle is dead, i.e. should not be showed anymore.
     */
    get dead() {
        return this._liveness < this._deadThreshold;
    }

    decay() {
        if (this.abandoned) {
            this._liveness *= this._abandonDecayMult;
            return;
        }
        this._liveness -= this._decayRate;
    }
}
