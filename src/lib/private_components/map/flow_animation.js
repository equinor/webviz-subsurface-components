import * as d3 from 'd3';

function distance([x1, y1], [x2, y2]) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/**
 *  Visualises flow by simulating particles being moved by the flow.
 */
export default class FlowAnimation {
    /**
     *  Constructor
     *  @param {object} canvas - The html canvas to use for drawing.
     *  @param {number} minflow - The minimum length of travel between
     *      steps in the simulation by any particle.
     *  @param {number} maxflow - The maximum length of travel between
     *      steps in the simulation by any particle.
     *  @param {ParticleGenerator} particleGenerator
     *  @param {number} numParticles - number of particles the be showed in
     *      the canvas at any given time.
     */
    constructor(
        canvas,
        minflow,
        maxflow,
        particleGenerator,
        numParticles,
        pixelScale
    ) {
        if (typeof canvas === 'string') {
            this._canvas = d3.select(canvas).node();
        } else {
            this._canvas = canvas;
        }

        this._bounds = this._canvas.getBoundingClientRect();

        this._colors = d3
            .range(85, 255, 10)
            .map(j => `rgba(${j}, ${j}, ${j}, 1.0)`);
        const incr = (maxflow - minflow) / this._colors.length;
        this._colorScale = d3
            .scaleThreshold()
            .domain(this._colors.map((_, i) => incr * i + minflow))
            .range(this._colors);

        this._particleGenerator = particleGenerator;
        this._particles = [];
        this._numParticles = numParticles;
        this._context = this._canvas.getContext('2d');
        const fps = 30;
        this._fpsInterval = 1000 / fps;
        this._particles = Array(this._numParticles);
        for (let i = 0; i < this._numParticles; i += 1) {
            this._particles[i] = this._particleGenerator.generate();
        }

        this._pixelScale = pixelScale;
        this._resetDrawStyle();

        this._drawBuckets = new Map();
    }

    get particleGenerator() {
        return this._particleGenerator;
    }

    set particleGenerator(val) {
        this._particleGenerator = val;
    }

    /**
     * Resets fill and line styles.
     */
    _resetDrawStyle() {
        // fillStyle used for fading particles
        this._context.fillStyle = 'rgba(0, 0, 0, 0.96)';
        // width of particle trails
        this._context.lineWidth = 1;
    }

    /**
     * Goes through all particles and simulates their movement.
     * If any of the particles are dead, they are replaced.
     */
    _stepParticles() {
        const {field} = this._particleGenerator;
        this._particles.forEach((d, i) => {
            if (d.dead) {
                this._particles[i] = this._particleGenerator.generate();
            }
            if (!d.abandoned) {
                const [newCell, newNormalPosition] = field.simulate(
                    d.cell,
                    d.normalPosition
                );
                if (
                    newNormalPosition &&
                    distance(newNormalPosition, d.normalPosition) < 0.001
                ) {
                    d.abandon();
                }
                if (!newCell) {
                    d.abandon();
                } else {
                    d.cell = newCell; // eslint-disable-line no-param-reassign
                    d.normalPosition = newNormalPosition; // eslint-disable-line no-param-reassign
                }
            }
            d.decay();
        });
    }

    get pixelScale() {
        return this._pixelScale;
    }

    /**
     * Loops simulating particles and drawing, called by
     * window.requestAnimationFrame. The method requests new animation frames
     * until this._stop. particles are animated when time elapsed matches the
     * fpsInterval.
     */
    _animate() {
        if (this._stop) {
            return;
        }
        if (this._requestStep) {
            this._stepParticles();
            this._requestStep = false;
        }
        if (this._requestFillBuckets) {
            this._fillDrawBuckets();
            this._requestFillBuckets = false;
        }
        const now = Date.now();
        const elapsed = now - this._then;

        this._animationId = window.requestAnimationFrame(
            this._animate.bind(this)
        );

        if (elapsed > this._fpsInterval) {
            this._then = now - (elapsed % this._fpsInterval);
            this._draw();
            this._requestStep = true;
            this._requestFillBuckets = true;
        }
    }

    /**
     * Fades the trail of particles
     */
    _fadeTrails() {
        if (this._context) {
            const prev = this._context.globalCompositeOperation;
            this._context.globalCompositeOperation = 'destination-in';
            this._context.fillRect(
                0,
                0,
                this._bounds.width,
                this._bounds.height
            );
            this._context.globalCompositeOperation = prev;
        }
    }

    /**
     * Adds new lines to be drawn into this._drawBuckets which
     * is indexed by the color to draw the line.
     */
    _fillDrawBuckets() {
        this._drawBuckets = new Map();
        this._particles.forEach(d => {
            const pos = d.position;
            const prevPos = d.previousPosition;
            const dist = distance(prevPos, pos);
            const color = this._colorScale(dist);
            if (!this._drawBuckets.has(color)) {
                this._drawBuckets.set(color, []);
            }
            const scaledFrom = prevPos.scalarMultiply(this.pixelScale);
            const scaledTo = pos.scalarMultiply(this.pixelScale);
            this._drawBuckets.get(color).push([scaledFrom, scaledTo]);
        });
    }

    /**
     * Draw all particle lines in this._drawBuckets.
     */
    _drawParticleLines() {
        this._drawBuckets.forEach((lines, color) => {
            if (lines.length > 0) {
                this._context.strokeStyle = color;
                this._context.beginPath();
                lines.forEach(([from, to]) => {
                    this._context.moveTo(...from);
                    this._context.lineTo(...to);
                });
                this._context.stroke();
            }
        });
    }

    _drawClear() {
        this._context.clearRect(0, 0, this._bounds.width, this._bounds.height);
        this._resetDrawStyle();
    }

    /**
     * Clear the screen if a clear has been requested,
     * fade the previous particle trails and draw new lines.
     */
    _draw() {
        if (this._requestClear) {
            this._drawClear();
            this._requestClear = false;
        }
        this._fadeTrails();
        this._drawParticleLines();
    }

    /**
     * Starts the animation.
     */
    start() {
        this.stop();
        this._then = Date.now();
        this._stop = false;
        this._animationId = window.requestAnimationFrame(
            this._animate.bind(this)
        );
    }

    /**
     * Clear the canvas of all lines.
     */
    clear() {
        this._requestClear = true;
    }

    /**
     *  Sets the transform of the animation inside the canvas.
     *  See canvas.getContext('2d').setTransform.
     *
     * @param {number} x - Number of pixels to translate to the right from origin
     * @param {number} y - Number of pixels to translate downwards from origin
     * @param {number} k - Scaling parameter
     * @param {number} kInit - Initial scaling
     * @param {number} angle - Number of degrees to rotate the canvas
     * @param {[x, y]} rotationCenter - Point in untranslated, unscaled canvas to rotate around
     *
     */
    setTransform(x, y, k, kInit, angle, rotationCenter) {
        this._context.resetTransform();
        this._context.translate(x + rotationCenter[0], y + rotationCenter[1]);
        this._context.rotate((angle * Math.PI) / 180);
        this._context.translate(-rotationCenter[0], -rotationCenter[1]);
        this._context.scale(k / kInit, k / kInit);
    }

    /**
     * Stops the animation.
     */
    stop() {
        this._stop = true;
        if (this._animationId) {
            window.cancelAnimationFrame(this._animationId);
        }
    }
}
