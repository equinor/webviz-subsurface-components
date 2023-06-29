import { MeshType, MeshTypeLines } from "./privateLayer";
import { WebWorkerParams } from "./grid3dLayer";

export function makeFullMesh(e: { data: WebWorkerParams }): void {
    // Keep
    const t0 = performance.now();

    const params = e.data;

    const points = params.points;
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
    let indice = 0;
    let i = 0;
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
        for (let j = i + 1; j < i + n; j++) {
            const i1 = polys[j];
            const i2 = polys[j + 1];

            const x0 = points[3 * i1 + 0];
            const y0 = points[3 * i1 + 1];
            const z0 = points[3 * i1 + 2] * z_sign;

            const x1 = points[3 * i2 + 0];
            const y1 = points[3 * i2 + 1];
            const z1 = points[3 * i2 + 2] * z_sign;

            line_positions.push(x0, y0, z0);
            line_positions.push(x1, y1, z1);
        }

        // Triangles.
        if (n == 4) {
            const i1 = polys[i + 1];
            const i2 = polys[i + 2];
            const i3 = polys[i + 3];
            const i4 = polys[i + 4];

            const x1 = points[3 * i1 + 0];
            const y1 = points[3 * i1 + 1];
            const z1 = points[3 * i1 + 2] * z_sign;

            const x2 = points[3 * i2 + 0];
            const y2 = points[3 * i2 + 1];
            const z2 = points[3 * i2 + 2] * z_sign;

            const x3 = points[3 * i3 + 0];
            const y3 = points[3 * i3 + 1];
            const z3 = points[3 * i3 + 2] * z_sign;

            const x4 = points[3 * i4 + 0];
            const y4 = points[3 * i4 + 1];
            const z4 = points[3 * i4 + 2] * z_sign;

            // t1
            indices.push(indice++, indice++, indice++);

            positions.push(x1, y1, z1);
            positions.push(x2, y2, z2);
            positions.push(x3, y3, z3);

            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);

            // t2
            indices.push(indice++, indice++, indice++);

            positions.push(x1, y1, z1);
            positions.push(x3, y3, z3);
            positions.push(x4, y4, z4);

            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);
        } else if (n == 3) {
            // Refactor this n == 3 && n == 4.
            const i1 = polys[i + 1];
            const i2 = polys[i + 2];
            const i3 = polys[i + 3];

            const x1 = points[3 * i1 + 0];
            const y1 = points[3 * i1 + 1];
            const z1 = points[3 * i1 + 2] * z_sign;

            const x2 = points[3 * i2 + 0];
            const y2 = points[3 * i2 + 1];
            const z2 = points[3 * i2 + 2] * z_sign;

            const x3 = points[3 * i3 + 0];
            const y3 = points[3 * i3 + 1];
            const z3 = points[3 * i3 + 2] * z_sign;

            // t1
            indices.push(indice++, indice++, indice++);

            positions.push(x1, y1, z1);
            positions.push(x2, y2, z2);
            positions.push(x3, y3, z3);

            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);
            vertexProperties.push(propertyValue);
        } else {
            if (params.triangulate) {
                const trianFunc = Function("points", params.triangulate);
                //const earcut = trianFunc.earcut;
                const test = trianFunc([10, 0, 0, 50, 60, 60, 70, 10]);
                console.log("Triangulated poly: ", test);
            }
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
