/* eslint-disable prettier/prettier */
import { MeshType, MeshTypeLines } from "./privateLayer";
import { WebWorkerParams } from "./grid3dLayer";

export function makeFullMesh(e: { data: WebWorkerParams }): void {
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
    }

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
    const triangFunc = Function(
        params.triangulateParamName,
        params.triangulateFunc
    );

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
            getLineSegment (j, j + 1, line_positions);            
        }
        getLineSegment (i + 1, i + n, line_positions);            

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
        const triangles : number[] = triangFunc(flatPoly);

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
