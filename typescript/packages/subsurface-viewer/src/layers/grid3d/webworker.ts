import type { MeshType, MeshTypeLines } from "./privateLayer";
import type { WebWorkerParams } from "./grid3dLayer";

export function makeFullMesh(e: { data: WebWorkerParams }): void {
    class Node {
        i: number;
        x: number;
        y: number;
        z: number;
        steiner: boolean;
        prev: Node;
        next: Node;
        prevZ: Node | null | undefined;
        nextZ: Node | null | undefined;
        constructor(i: number, x: number, y: number) {
            // vertex index in coordinates array
            this.i = i;

            // vertex coordinates
            this.x = x;
            this.y = y;

            // previous and next vertex nodes in a polygon ring
            this.prev = this;
            this.next = this;

            // z-order curve value
            this.z = 0;

            // previous and next nodes in z-order
            this.prevZ = this;
            this.nextZ = this;

            // indicates whether this is a steiner point
            this.steiner = false;
        }
    }
    /**
     * The fastest and smallest JavaScript polygon triangulation library for your WebGL apps.
     * https://github.com/mapbox/earcut
     * The library is used as source code because of issues with imports in webworkers.
     */
    function earcut(data: number[], dim: number) {
        dim = dim || 2;

        const outerLen = data.length;
        const outerNode = linkedList(data, 0, outerLen, dim, true);
        const triangles: number[] = [];

        if (!outerNode || outerNode.next === outerNode.prev) return triangles;

        let minX = Number.POSITIVE_INFINITY,
            minY = Number.POSITIVE_INFINITY,
            maxX = Number.NEGATIVE_INFINITY,
            maxY = Number.NEGATIVE_INFINITY,
            x,
            y,
            invSize = 0;

        // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
        if (data.length > 80 * dim) {
            minX = maxX = data[0];
            minY = maxY = data[1];

            for (let i = dim; i < outerLen; i += dim) {
                x = data[i];
                y = data[i + 1];
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }

            // minX, minY and invSize are later used to transform coords into integers for z-order calculation
            invSize = Math.max(maxX - minX, maxY - minY);
            invSize = invSize !== 0 ? 32767 / invSize : 0;
        }

        earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);

        return triangles;

        // create a circular doubly linked list from polygon points in the specified winding order
        function linkedList(
            data: number[],
            start: number,
            end: number,
            dim: number,
            clockwise: boolean
        ) {
            let i: number;
            let last: Node | null = null;

            if (clockwise === signedArea(data, start, end, dim) > 0) {
                for (i = start; i < end; i += dim)
                    last = insertNode(i, data[i], data[i + 1], last);
            } else {
                for (i = end - dim; i >= start; i -= dim)
                    last = insertNode(i, data[i], data[i + 1], last);
            }

            if (last && equals(last, last.next)) {
                removeNode(last);
                last = last.next;
            }

            return last;
        }

        // eliminate colinear or duplicate points
        function filterPoints(start: Node | null, end?: Node) {
            if (!start) return start;
            if (!end) end = start;

            let p = start,
                again;
            do {
                again = false;

                if (
                    !p.steiner &&
                    (equals(p, p.next) || area(p.prev, p, p.next) === 0)
                ) {
                    removeNode(p);
                    p = end = p.prev;
                    if (p === p.next) break;
                    again = true;
                } else {
                    p = p.next;
                }
            } while (again || p !== end);

            return end;
        }

        // main ear slicing loop which triangulates a polygon (given as a linked list)
        function earcutLinked(
            ear: Node | null | undefined,
            triangles: number[],
            dim: number,
            minX: number,
            minY: number,
            invSize: number,
            pass: number
        ) {
            if (!ear) return;

            // interlink polygon nodes in z-order
            if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

            let stop = ear,
                prev,
                next;

            // iterate through ears, slicing them one by one
            while (ear.prev !== ear.next) {
                prev = ear.prev;
                next = ear.next;

                if (
                    invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)
                ) {
                    // cut off the triangle
                    triangles.push((prev.i / dim) | 0);
                    triangles.push((ear.i / dim) | 0);
                    triangles.push((next.i / dim) | 0);

                    removeNode(ear);

                    // skipping the next vertex leads to less sliver triangles
                    ear = next.next;
                    stop = next.next;

                    continue;
                }

                ear = next;

                // if we looped through the whole remaining polygon and can't find any more ears
                if (ear === stop) {
                    // try filtering points and slicing again
                    if (!pass) {
                        earcutLinked(
                            filterPoints(ear),
                            triangles,
                            dim,
                            minX,
                            minY,
                            invSize,
                            1
                        );

                        // if this didn't work, try curing all small self-intersections locally
                    } else if (pass === 1) {
                        ear = cureLocalIntersections(
                            filterPoints(ear) as Node,
                            triangles,
                            dim
                        );
                        earcutLinked(
                            ear,
                            triangles,
                            dim,
                            minX,
                            minY,
                            invSize,
                            2
                        );

                        // as a last resort, try splitting the remaining polygon into two
                    } else if (pass === 2) {
                        splitEarcut(ear, triangles, dim, minX, minY, invSize);
                    }

                    break;
                }
            }
        }

        //min & max are calculated like this for speed
        function getMin(a: number, b: number, c: number): number {
            if (a < b) {
                if (a < c) {
                    return a;
                }
                return c;
            }
            if (b < c) {
                return b;
            }
            return c;
        }

        function getMax(a: number, b: number, c: number): number {
            if (a > b) {
                if (a > c) {
                    return a;
                }
                return c;
            }
            if (b > c) {
                return b;
            }
            return c;
        }

        function triangleBBox(
            ax: number,
            bx: number,
            cx: number,
            ay: number,
            by: number,
            cy: number
        ): [number, number, number, number] {
            const x0 = getMin(ax, bx, cx);
            const y0 = getMin(ay, by, cy);
            const x1 = getMax(ax, bx, cx);
            const y1 = getMax(ay, by, cy);
            return [x0, y0, x1, y1];
        }

        // check whether a polygon node forms a valid ear with adjacent nodes
        function isEar(ear: Node) {
            const a = ear.prev,
                b = ear,
                c = ear.next;

            if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

            // now make sure we don't have other points inside the potential ear
            const ax = a.x,
                bx = b.x,
                cx = c.x,
                ay = a.y,
                by = b.y,
                cy = c.y;

            const [x0, y0, x1, y1] = triangleBBox(ax, bx, cx, ay, by, cy);

            let p = c.next;
            while (p !== a) {
                if (
                    p.x >= x0 &&
                    p.x <= x1 &&
                    p.y >= y0 &&
                    p.y <= y1 &&
                    pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
                    area(p.prev, p, p.next) >= 0
                )
                    return false;
                p = p.next;
            }

            return true;
        }

        function isEarHashed(
            ear: Node,
            minX: number,
            minY: number,
            invSize: number
        ) {
            const a = ear.prev,
                b = ear,
                c = ear.next;

            if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

            const ax = a.x,
                bx = b.x,
                cx = c.x,
                ay = a.y,
                by = b.y,
                cy = c.y;

            const [x0, y0, x1, y1] = triangleBBox(ax, bx, cx, ay, by, cy);

            // z-order range for the current triangle bbox;
            const minZ = zOrder(x0, y0, minX, minY, invSize),
                maxZ = zOrder(x1, y1, minX, minY, invSize);

            let p = ear.prevZ;
            let n = ear.nextZ;

            // look for points inside the triangle in both directions
            while (p && p.z >= minZ && n && n.z <= maxZ) {
                if (
                    p.x >= x0 &&
                    p.x <= x1 &&
                    p.y >= y0 &&
                    p.y <= y1 &&
                    p !== a &&
                    p !== c &&
                    pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
                    area(p.prev, p, p.next) >= 0
                )
                    return false;
                p = p.prevZ;

                if (
                    n.x >= x0 &&
                    n.x <= x1 &&
                    n.y >= y0 &&
                    n.y <= y1 &&
                    n !== a &&
                    n !== c &&
                    pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) &&
                    area(n.prev, n, n.next) >= 0
                )
                    return false;
                n = n.nextZ;
            }

            // look for remaining points in decreasing z-order
            while (p && p.z >= minZ) {
                if (
                    p.x >= x0 &&
                    p.x <= x1 &&
                    p.y >= y0 &&
                    p.y <= y1 &&
                    p !== a &&
                    p !== c &&
                    pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
                    area(p.prev, p, p.next) >= 0
                )
                    return false;
                p = p.prevZ;
            }

            // look for remaining points in increasing z-order
            while (n && n.z <= maxZ) {
                if (
                    n.x >= x0 &&
                    n.x <= x1 &&
                    n.y >= y0 &&
                    n.y <= y1 &&
                    n !== a &&
                    n !== c &&
                    pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) &&
                    area(n.prev, n, n.next) >= 0
                )
                    return false;
                n = n.nextZ;
            }

            return true;
        }

        // go through all polygon nodes and cure small local self-intersections
        function cureLocalIntersections(
            start: Node,
            triangles: number[],
            dim: number
        ) {
            let p = start;
            do {
                const a = p.prev,
                    b = p.next.next;

                if (
                    !equals(a, b) &&
                    intersects(a, p, p.next, b) &&
                    locallyInside(a, b) &&
                    locallyInside(b, a)
                ) {
                    triangles.push((a.i / dim) | 0);
                    triangles.push((p.i / dim) | 0);
                    triangles.push((b.i / dim) | 0);

                    // remove two nodes involved
                    removeNode(p);
                    removeNode(p.next);

                    p = start = b;
                }
                p = p.next;
            } while (p !== start);

            return filterPoints(p);
        }

        // try splitting polygon into two and triangulate them independently
        function splitEarcut(
            start: Node,
            triangles: number[],
            dim: number,
            minX: number,
            minY: number,
            invSize: number
        ) {
            // look for a valid diagonal that divides the polygon into two
            let a: Node | null = start;
            do {
                let b = a.next.next;
                while (b !== a.prev) {
                    if (a.i !== b.i && isValidDiagonal(a, b)) {
                        // split the polygon in two by the diagonal
                        let c: Node | null = splitPolygon(a, b);

                        // filter colinear points around the cuts
                        a = filterPoints(a, a.next);
                        c = filterPoints(c, c.next);

                        // run earcut on each half
                        earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
                        earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
                        return;
                    }
                    b = b.next;
                }
                a = a.next;
            } while (a !== start);
        }

        // interlink polygon nodes in z-order
        function indexCurve(
            start: Node,
            minX: number,
            minY: number,
            invSize: number
        ) {
            let p = start;
            do {
                if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
                p.prevZ = p.prev;
                p.nextZ = p.next;
                p = p.next;
            } while (p !== start);
            if (p.prevZ) {
                p.prevZ.nextZ = null;
            }
            p.prevZ = null;

            sortLinked(p);
        }

        // Simon Tatham's linked list merge sort algorithm
        // http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
        function sortLinked(list: Node | null | undefined) {
            let i,
                p,
                q,
                e,
                tail,
                numMerges,
                pSize,
                qSize,
                inSize = 1;

            do {
                p = list;
                list = null;
                tail = null;
                numMerges = 0;

                while (p) {
                    numMerges++;
                    q = p;
                    pSize = 0;
                    for (i = 0; i < inSize; i++) {
                        pSize++;
                        q = q.nextZ;
                        if (!q) break;
                    }
                    qSize = inSize;

                    while (pSize > 0 || (qSize > 0 && q)) {
                        if (
                            p &&
                            pSize !== 0 &&
                            (qSize === 0 || !q || p.z <= q.z)
                        ) {
                            e = p;
                            p = p?.nextZ;
                            pSize--;
                        } else {
                            e = q;
                            q = q?.nextZ;
                            qSize--;
                        }

                        if (tail) tail.nextZ = e;
                        else list = e;
                        if (e?.prevZ) e.prevZ = tail;
                        tail = e;
                    }

                    p = q;
                }
                if (tail) tail.nextZ = null;
                inSize *= 2;
            } while (numMerges > 1);

            return list;
        }

        // z-order of a point given coords and inverse of the longer side of data bbox
        function zOrder(
            x: number,
            y: number,
            minX: number,
            minY: number,
            invSize: number
        ) {
            // coords are transformed into non-negative 15-bit integer range
            x = ((x - minX) * invSize) | 0;
            y = ((y - minY) * invSize) | 0;

            x = (x | (x << 8)) & 0x00ff00ff;
            x = (x | (x << 4)) & 0x0f0f0f0f;
            x = (x | (x << 2)) & 0x33333333;
            x = (x | (x << 1)) & 0x55555555;

            y = (y | (y << 8)) & 0x00ff00ff;
            y = (y | (y << 4)) & 0x0f0f0f0f;
            y = (y | (y << 2)) & 0x33333333;
            y = (y | (y << 1)) & 0x55555555;

            return x | (y << 1);
        }

        // check if a point lies within a convex triangle
        function pointInTriangle(
            ax: number,
            ay: number,
            bx: number,
            by: number,
            cx: number,
            cy: number,
            px: number,
            py: number
        ) {
            return (
                (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
                (ax - px) * (by - py) >= (bx - px) * (ay - py) &&
                (bx - px) * (cy - py) >= (cx - px) * (by - py)
            );
        }

        // check if a diagonal between two polygon nodes is valid (lies in polygon interior)
        function isValidDiagonal(a: Node, b: Node) {
            return (
                a.next.i !== b.i &&
                a.prev.i !== b.i &&
                !intersectsPolygon(a, b) && // dones't intersect other edges
                ((locallyInside(a, b) &&
                    locallyInside(b, a) &&
                    middleInside(a, b) && // locally visible
                    (area(a.prev, a, b.prev) || area(a, b.prev, b))) || // does not create opposite-facing sectors
                    (equals(a, b) &&
                        area(a.prev, a, a.next) > 0 &&
                        area(b.prev, b, b.next) > 0))
            ); // special zero-length case
        }

        // signed area of a triangle
        function area(p: Node, q: Node, r: Node) {
            return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        }

        // check if two points are equal
        function equals(p1: Node, p2: Node) {
            return p1.x === p2.x && p1.y === p2.y;
        }

        // check if two segments intersect
        function intersects(p1: Node, q1: Node, p2: Node, q2: Node) {
            const o1 = sign(area(p1, q1, p2));
            const o2 = sign(area(p1, q1, q2));
            const o3 = sign(area(p2, q2, p1));
            const o4 = sign(area(p2, q2, q1));

            if (o1 !== o2 && o3 !== o4) return true; // general case

            if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
            if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
            if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
            if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

            return false;
        }

        // for collinear points p, q, r, check if point q lies on segment pr
        function onSegment(p: Node, q: Node, r: Node) {
            return (
                q.x <= Math.max(p.x, r.x) &&
                q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) &&
                q.y >= Math.min(p.y, r.y)
            );
        }

        function sign(num: number) {
            if (num > 0) {
                return 1;
            }
            if (num < 0) {
                return -1;
            }
            return 0;
        }

        // check if a polygon diagonal intersects any polygon segments
        function intersectsPolygon(a: Node, b: Node) {
            let p = a;
            do {
                if (
                    p.i !== a.i &&
                    p.next.i !== a.i &&
                    p.i !== b.i &&
                    p.next.i !== b.i &&
                    intersects(p, p.next, a, b)
                )
                    return true;
                p = p.next;
            } while (p !== a);

            return false;
        }

        // check if a polygon diagonal is locally inside the polygon
        function locallyInside(a: Node, b: Node) {
            return area(a.prev, a, a.next) < 0
                ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0
                : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
        }

        // check if the middle point of a polygon diagonal is inside the polygon
        function middleInside(a: Node, b: Node) {
            const px = (a.x + b.x) / 2;
            const py = (a.y + b.y) / 2;
            let p = a;
            let inside = false;
            do {
                if (
                    p.y > py !== p.next.y > py &&
                    p.next.y !== p.y &&
                    px <
                        ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x
                )
                    inside = !inside;
                p = p.next;
            } while (p !== a);

            return inside;
        }

        // link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
        // if one belongs to the outer ring and another to a hole, it merges it into a single ring
        function splitPolygon(a: Node, b: Node) {
            const a2 = new Node(a.i, a.x, a.y),
                b2 = new Node(b.i, b.x, b.y),
                an = a.next,
                bp = b.prev;

            a.next = b;
            b.prev = a;

            a2.next = an;
            an.prev = a2;

            b2.next = a2;
            a2.prev = b2;

            bp.next = b2;
            b2.prev = bp;

            return b2;
        }

        // create a node and optionally link it with previous one (in a circular doubly linked list)
        function insertNode(
            i: number,
            x: number,
            y: number,
            last: Node | null
        ) {
            const p = new Node(i, x, y);

            if (!last) {
                p.prev = p;
                p.next = p;
            } else {
                p.next = last.next;
                p.prev = last;
                last.next.prev = p;
                last.next = p;
            }
            return p;
        }

        function removeNode(p: Node) {
            p.next.prev = p.prev;
            p.prev.next = p.next;

            if (p.prevZ) p.prevZ.nextZ = p.nextZ;
            if (p.nextZ) p.nextZ.prevZ = p.prevZ;
        }

        function signedArea(
            data: number[],
            start: number,
            end: number,
            dim: number
        ) {
            let sum = 0;
            for (let i = start, j = end - dim; i < end; i += dim) {
                sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
                j = i;
            }
            return sum;
        }
    }

    const get3DPoint = (points: number[], index: number): number[] => {
        return points.slice(index * 3, (index + 1) * 3);
    };

    const substractPoints = (a: number[], b: number[]): number[] => {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    };

    const crossProduct = (a: number[], b: number[]): number[] => {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    };

    const dotProduct = (a: number[], b: number[]): number => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };

    const normalize = (a: number[]): number[] => {
        const len = Math.sqrt(dotProduct(a, a));
        return [a[0] / len, a[1] / len, a[2] / len];
    };

    /**
     * Projects a 3D point to the coordinate system of the plane formed by two 3D orthogonal unit vectors u and v.
     * @param u the first vector
     * @param v the second vector
     * @param p the point to be projected as [x, y, z] triplet.
     * @returns projected point as [x, y] triplet.
     */
    const projectPoint = (u: number[], v: number[], p: number[]): number[] => {
        const a = dotProduct(p, u);
        const b = dotProduct(p, v);
        return [a, b];
    };

    /**
     * Projects a polygon on the plane passing throught its points.
     * Assumes the polygon to be flat, i.e. all the points lie on the same plane.
     * @param points Polygon to be projected.
     * @returns Projected polygon in the 2D coordinate system of the plane.
     */
    const projectPolygon = (points: number[]): number[] => {
        const p0 = get3DPoint(points, 0);
        const p1 = get3DPoint(points, 1);
        const p2 = get3DPoint(points, 2);
        const v1 = substractPoints(p1, p0);
        const v2 = substractPoints(p2, p0);
        const normal = normalize(crossProduct(v1, v2));
        const u = normalize(v1);
        const v = normalize(crossProduct(normal, u));
        const res: number[] = [];
        const count = points.length / 3;
        for (let i = 0; i < count; ++i) {
            const p = get3DPoint(points, i);
            const fp = projectPoint(u, v, p);
            res.push(...fp);
        }
        return res;
    };

    const getLineSegment = (index0: number, index1: number, out: number[]) => {
        const i1 = polys[index0];
        const i2 = polys[index1];

        const p1 = get3DPoint(params.points, i1);
        const p2 = get3DPoint(params.points, i2);

        p1[2] *= z_sign;
        p2[2] *= z_sign;

        out.push(...p1);
        out.push(...p2);
    };

    // Keep
    const t0 = performance.now();

    const params = e.data;

    const polys = params.polys;
    const properties = params.properties;
    const isZIncreasingDownwards = params.isZIncreasingDownwards;

    const positions: number[] = [];
    const indices: number[] = [];
    const vertexProperties: number[] = [];
    const line_positions: number[] = [];

    let propertyValueRangeMin = +99999999;
    let propertyValueRangeMax = -99999999;

    const z_sign = isZIncreasingDownwards ? -1 : 1;

    let pn = 0;
    let i = 0;
    let vertexIndex = 0;

    while (i < polys.length) {
        const n = polys[i];
        const propertyValue = properties[pn++];

        if (propertyValue !== null) {
            // For some reason propertyValue happens to be null.
            propertyValueRangeMin =
                propertyValue < propertyValueRangeMin
                    ? propertyValue
                    : propertyValueRangeMin;
            propertyValueRangeMax =
                propertyValue > propertyValueRangeMax
                    ? propertyValue
                    : propertyValueRangeMax;
        }

        // Lines.
        for (let j = i + 1; j < i + n; ++j) {
            getLineSegment(j, j + 1, line_positions);
        }
        getLineSegment(i + 1, i + n, line_positions);

        const polygon: number[] = [];
        const vertexIndices: number[] = [];
        for (let p = 1; p <= n; ++p) {
            const i0 = polys[i + p];
            const point = get3DPoint(params.points, i0);
            point[2] *= z_sign;
            vertexIndices.push(i0);
            polygon.push(...point);
        }
        // As the triangulation algorythm works in 2D space
        // the polygon should be projected on the plane passing through its points.
        const flatPoly = projectPolygon(polygon);
        const triangles: number[] = earcut(flatPoly, 2);

        for (const t of triangles) {
            positions.push(...get3DPoint(polygon, t));
            vertexProperties.push(propertyValue);
            indices.push(vertexIndex++);
        }
        i = i + n + 1;
    }

    console.log("Number of polygons: ", pn);

    const mesh: MeshType = {
        drawMode: 4, // corresponds to GL.TRIANGLES,
        attributes: {
            positions: { value: new Float32Array(positions), size: 3 },
            properties: { value: new Float32Array(vertexProperties), size: 1 },
            vertex_indexs: { value: new Int32Array(indices), size: 1 },
        },
        vertexCount: indices.length,
        indices: { value: new Uint32Array(indices), size: 1 },
    };

    const mesh_lines: MeshTypeLines = {
        drawMode: 1, // corresponds to GL.LINES,
        attributes: {
            positions: { value: new Float32Array(line_positions), size: 3 },
        },
        vertexCount: line_positions.length / 3,
    };

    const t1 = performance.now();
    //Keep this.
    console.log(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);

    // Note: typescript gives this error "error TS2554: Expected 2-3 arguments, but got 1."
    // Disabling this for now as the second argument should be optional.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postMessage([
        mesh,
        mesh_lines,
        [propertyValueRangeMin, propertyValueRangeMax],
    ]);
}
