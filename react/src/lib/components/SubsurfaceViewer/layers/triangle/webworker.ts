import { GeometryTriangles, GeometryLines } from "./privateTriangleLayer";
import { Params } from "./triangleLayer";

type Vec = [number, number, number];

export function makeFullMesh(e: { data: Params }): void {
    const params = e.data;

    // Keep
    //const t0 = performance.now();

    function crossProduct(a: Vec, b: Vec): Vec {
        const c = [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
        return c as Vec;
    }

    function normalize(a: Vec): void {
        const L = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        a[0] /= L;
        a[1] /= L;
        a[2] /= L;
    }

    const line_positions: number[] = [];

    const vertexArray = params.vertexArray;
    const indexArray = params.indexArray;

    const ntriangles = indexArray.length / 3;
    const nvertices = vertexArray.length / 3;
    const trianglesNormals = Array(ntriangles * 3).fill(0);
    const vertexsNormals = Array(vertexArray.length).fill(0);

    // Generate lines around each triangle and one normal for each triangle.
    for (let t_no = 0; t_no < ntriangles; t_no++) {
        let indx = indexArray[3 * t_no + 0];
        const x0 = vertexArray[3 * indx + 0];
        const y0 = vertexArray[3 * indx + 1];
        const z0 = vertexArray[3 * indx + 2];

        indx = indexArray[3 * t_no + 1];
        const x1 = vertexArray[3 * indx + 0];
        const y1 = vertexArray[3 * indx + 1];
        const z1 = vertexArray[3 * indx + 2];

        indx = indexArray[3 * t_no + 2];
        const x2 = vertexArray[3 * indx + 0];
        const y2 = vertexArray[3 * indx + 1];
        const z2 = vertexArray[3 * indx + 2];

        // Triangle lines.
        line_positions.push(x0, y0, z0);
        line_positions.push(x1, y1, z1);

        line_positions.push(x0, y0, z0);
        line_positions.push(x2, y2, z2);

        line_positions.push(x1, y1, z1);
        line_positions.push(x2, y2, z2);

        // Normal.
        const v1 = [x2 - x0, y2 - y0, z2 - z0] as Vec;
        const v2 = [x2 - x1, y2 - y1, z2 - z1] as Vec;
        const normal = crossProduct(v2, v1);

        trianglesNormals[3 * t_no + 0] = normal[0];
        trianglesNormals[3 * t_no + 1] = normal[1];
        trianglesNormals[3 * t_no + 2] = normal[2];
    }

    // For each vertex keep a list of which triangles it is part of.
    const vertexTrianglesArray = Array(vertexArray.length / 3);
    for (let i = 0; i < vertexTrianglesArray.length; i++) {
        vertexTrianglesArray[i] = new Array(0);
    }

    for (let t_no = 0; t_no < ntriangles; t_no++) {
        const v1_idx = indexArray[3 * t_no + 0];
        vertexTrianglesArray[v1_idx].push(t_no);

        const v2_idx = indexArray[3 * t_no + 1];
        vertexTrianglesArray[v2_idx].push(t_no);

        const v3_idx = indexArray[3 * t_no + 2];
        vertexTrianglesArray[v3_idx].push(t_no);
    }

    // The normal for each vertex is the mean of the normals belonging to the triangles that
    // share this vertex.
    for (let vertex_no = 0; vertex_no < nvertices; vertex_no++) {
        const n_triangles = vertexTrianglesArray[vertex_no].length; // No triangles this vertex is part of. Will be at leat 1.
        const t0 = vertexTrianglesArray[vertex_no][0]; // first triangle
        const normal_mean = [
            trianglesNormals[3 * t0 + 0],
            trianglesNormals[3 * t0 + 1],
            trianglesNormals[3 * t0 + 2],
        ];
        // possible rest of triangles
        for (let t_no = 1; t_no < n_triangles; t_no++) {
            const t = vertexTrianglesArray[vertex_no][t_no];
            const normal = [
                trianglesNormals[3 * t + 0],
                trianglesNormals[3 * t + 1],
                trianglesNormals[3 * t + 2],
            ];

            normal_mean[0] += normal[0];
            normal_mean[1] += normal[1];
            normal_mean[2] += normal[2];
        }

        normalize(normal_mean as Vec);

        vertexsNormals[3 * vertex_no + 0] = normal_mean[0];
        vertexsNormals[3 * vertex_no + 1] = normal_mean[1];
        vertexsNormals[3 * vertex_no + 2] = normal_mean[2];

        // KEEP!
        // DEBUG SHOW NORMALS ////////////////////////////////
        // const x0 = vertexArray[3 * vertex_no + 0];
        // const y0 = vertexArray[3 * vertex_no + 1];
        // const z0 = vertexArray[3 * vertex_no + 2];

        // const scale = 5;
        // const x1 = x0 + normal_mean[0] * scale;
        // const y1 = y0 + normal_mean[1] * scale;
        // const z1 = z0 + normal_mean[2] * scale;

        // line_positions.push(x0, y0, z0);
        // line_positions.push(x1, y1, z1);
        ///////////////////////////////////////////////////////
    }

    const geometryTriangles: GeometryTriangles = {
        drawMode: 4, // corresponds to GL.TRIANGLES,
        attributes: {
            positions: { value: new Float32Array(vertexArray), size: 3 },
            normals: { value: new Float32Array(vertexsNormals), size: 3 },
            vertex_indexs: { value: new Int32Array(indexArray), size: 1 },
        },
        vertexCount: indexArray.length,
        indices: { value: new Uint32Array(indexArray), size: 1 },
    };

    const geometryLines: GeometryLines = {
        drawMode: 1, // corresponds to GL.LINES,
        attributes: {
            positions: { value: new Float32Array(line_positions), size: 3 },
        },
        vertexCount: line_positions.length / 3,
    };

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);

    // Note: typescript gives this error "error TS2554: Expected 2-3 arguments, but got 1."
    // Disabling this for now as the second argument should be optional.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postMessage([geometryTriangles, geometryLines]);
}
