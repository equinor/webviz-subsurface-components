import type { MeshType, MeshTypeLines } from "./privateMapLayer";
import type { WebWorkerParams } from "./mapLayer";

type Vec = [number, number, number];

export function makeFullMesh(e: { data: WebWorkerParams }): void {
    const params = e.data;

    // Keep
    //const t0 = performance.now();

    const meshData = params.meshData;
    const propertiesData = params.propertiesData;
    const isMesh = params.isMesh;
    const frame = params.frame;
    const smoothShading = params.smoothShading;
    const ZIncreasingDownwards = params.ZIncreasingDownwards;

    // XXX foklar trengs forr aa ikke endre -- men vent.. hvis de blir transferred vil dataene ugyldigjøres i main treadden og endre inputten .. ikke bra..
    //   .. hva med heller aa gjøre returverdiene transferable
    const multZ = ZIncreasingDownwards ? 1 : -1;


    function getFloat32ArrayMinMax(data: Float32Array) {
        let max = -99999999;
        let min = 99999999;
        for (let i = 0; i < data.length; i++) {
            max = data[i] > max ? data[i] : max;  // XXX optimaliser dette... gane med multZ overalt??
            min = data[i] < min ? data[i] : min;
        }
        return [min, max];
    }

    function crossProduct(a: Vec, b: Vec): Vec {
        const c = [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
        return c as Vec;
    }

    // Check if a number exists and has a defined value.
    function isDefined(x: unknown): boolean {
        return typeof x === "number" && !isNaN(x);
    }

    function normalize(a: Vec): void {
        const L = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        a[0] /= L;
        a[1] /= L;
        a[2] /= L;
    }

    function calcNormal(
        w: number,
        h: number,
        nx: number,
        ny: number,
        isMesh: boolean,
        smoothShading: boolean,
        meshData: Float32Array,
        ox: number,
        oy: number,
        multZ: number
    ) {
        if (!smoothShading) {
            return [1, 1, 1];
        }

        if (!isMesh) {
            return [0, 0, 1];
        }


        const i0 = h * nx + w;
        const i1 = h * nx + (w - 1);
        const i2 = (h + 1) * nx + w;
        const i3 = h * nx + (w + 1);
        const i4 = (h - 1) * nx + w;

        const i0_act =                 isDefined(meshData[i0]); // eslint-disable-line
        const i1_act = (w - 1) >= 0 && isDefined(meshData[i1]); // eslint-disable-line
        const i2_act = (h + 1) < ny && isDefined(meshData[i2]); // eslint-disable-line
        const i3_act = (w + 1) < nx && isDefined(meshData[i3]); // eslint-disable-line
        const i4_act = (h - 1) >= 0 && isDefined(meshData[i4]); // eslint-disable-line

        const noNormal = [0, 0, 1]; // signals a normal could not be calculated.
        if (!i0_act) {
            return noNormal;
        }

        const hh = ny - 1 - h; // Note use hh for h for getting y values.
        const p0 = [ox + w * dx,         oy + hh * dy,        i0_act ? -meshData[i0] * multZ : 0]; // eslint-disable-line
        const p1 = [ ox + (w - 1) * dx,  oy + hh * dy,        i1_act ? -meshData[i1] * multZ : 0]; // eslint-disable-line
        const p2 = [ ox + w * dx,        oy + (hh + 1) * dy,  i2_act ? -meshData[i2] * multZ : 0]; // eslint-disable-line
        const p3 = [ ox + (w + 1) * dx,  oy + hh * dy,        i3_act ? -meshData[i3] * multZ : 0]; // eslint-disable-line
        const p4 = [ ox + w * dx,        oy + (hh - 1) * dy,  i4_act ? -meshData[i4] * multZ : 0]; // eslint-disable-line

        const v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]] as Vec;
        const v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]] as Vec;
        const v3 = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]] as Vec;
        const v4 = [p4[0] - p0[0], p4[1] - p0[1], p4[2] - p0[2]] as Vec;

        // Estimating a normal vector at p0:
        // Take cross product of vectors v1, v2,
        // Do this for all 4 quadrants.
        // The resulting normal will be the mean of these four normals.
        //        p2
        //         |
        //   p1 - p0 - p3
        //         |
        //        p4

        const normals: Vec[] = [];
        if (i1_act && i2_act) {
            const normal = crossProduct(v2, v1);
            normals.push(normal);
        }

        if (i2_act && i3_act) {
            const normal = crossProduct(v3, v2);
            normals.push(normal);
        }

        if (i3_act && i4_act) {
            const normal = crossProduct(v4, v3);
            normals.push(normal);
        }

        if (i4_act && i1_act) {
            const normal = crossProduct(v1, v4);
            normals.push(normal);
        }

        if (normals.length === 0) {
            return noNormal;
        }

        const mean = normals[0];
        for (let i = 1; i < normals.length; i++) {
            mean[0] += normals[i][0];
            mean[1] += normals[i][1];
            mean[2] += normals[i][2];
        }

        normalize(mean);
        return mean;
    }

    const meshZValueRange = getFloat32ArrayMinMax(meshData);
    const propertyValueRange = getFloat32ArrayMinMax(propertiesData);

    // Dimensions.
    const ox = frame.origin[0];
    const oy = frame.origin[1];

    const dx = frame.increment[0];
    const dy = frame.increment[1];

    const nNodesX = frame.count[0];
    const nNodesY = frame.count[1];

    const propLength = propertiesData.length;
    const isCellCenteredProperties = propLength === (nNodesX - 1) * (nNodesY - 1);

    if (
        propLength !== (nNodesX - 1) * (nNodesY - 1) &&
        propLength !== nNodesX * nNodesY
    ) {
        console.error(
            "There should be as many property values as nodes (nx*ny) OR as many as cells (nx - 1) * (ny - 1)."
        );
    }

    const nNodes = nNodesX * nNodesY;
    const nCells = (nNodesX - 1) * (nNodesY - 1);
    const nTriangles = nCells * 2;
    //const nBytes = 4; // Number of bytes in float32

    // const positions_buffer = new ArrayBuffer(nBytes * nNodes * 3,  { maxByteLength: nBytes * nNodes * 3 });
    // const normals_buffer = new ArrayBuffer(nBytes * nNodes * 3,  { maxByteLength: nBytes * nNodes * 3 });

    // const indices_buffer = new ArrayBuffer(nBytes * nTriangles * 3,  { maxByteLength: nBytes * nTriangles * 3 });  // XXX TIL INTEGER?? 3 indicies pr triangle.
    // const vertexProperties_buffer = new ArrayBuffer(nBytes * nNodes,  { maxByteLength: nBytes * nNodes});
    // const vertexIndexs_buffer = new ArrayBuffer(nBytes * nNodes,  { maxByteLength: nBytes * nNodes });

    // const line_positions_buffer = new ArrayBuffer(nBytes * nTriangles * 6,  { maxByteLength: nBytes * nTriangles * 6 });  // XXX ikke brukt na sett riktig størrelse senere


    // XXX RENAME THESE TO something with arrays...
    // const positions = new Float32Array(positions_buffer);
    // const normals = new Float32Array(normals_buffer);
    // const indices = new Float32Array(indices_buffer);   // XXX bor ikke denne og fler gjøres til Int array??
    // const vertexProperties = new Float32Array(vertexProperties_buffer);
    // const vertexIndexs = new Float32Array(vertexIndexs_buffer);   // XXX blir brukt av meg i fragment shader for readout..

    // const line_positions = new Float32Array(line_positions_buffer);

    //  NON RESIZABLE
    const positions = new Float32Array(nNodes * 3);
    const normals = new Float32Array(nNodes * 3);
    const triangleIndices = new Uint32Array(nTriangles * 3);
    const vertexProperties = new Float32Array(nNodes);
    const vertexIndexs = new Int32Array(nNodes);   // XXX blir brukt av meg i fragment shader for readout..  

    const lineIndices = new Uint32Array((nCells) * 4 + (nNodesX-1) * 2 + (nNodesY-1) * 2);  // XXX FIX SJEKK:.. DER DISISE ZISTE RIKTIG STORRELSE????

    let noActiceIndices = 0; // XXX FJERN


    // Note: Assumed layout of the incomming 2D array of data:
    // First coloumn corresponds to lowest x value. Last column highest x value.
    // First row corresponds to max y value. Last row corresponds to lowest y value.
    // This must be taken into account when calculating vertex x,y values and texture coordinates.

    if (!isCellCenteredProperties) {
        // PROPERTIES IS SET INTERPOLATED OVER A CELL.
        console.log("PROPERTIES IS SET INTERPOLATED OVER A CELL.")

        // Loop over nodes.
        let i = 0; // XX rename to index???   node_index
        for (let h = 0; h < nNodesY; h++) {
            for (let w = 0; w < nNodesX; w++) {
                const i0 = h * nNodesX + w;

                const x0 = ox + w * dx;
                const y0 = oy + (nNodesY - 1 - h) * dy; // See note above.
                const z = isMesh ? -meshData[i0] * multZ : 0;

                const propertyValue = propertiesData[i0];

                positions[3 * i + 0] = x0;
                positions[3 * i + 1] = y0;
                positions[3 * i + 2] = z;

                const normal = calcNormal(w, h, nNodesX, nNodesY, isMesh, smoothShading, meshData, ox, oy, multZ); // eslint-disable-line
                normals[3 * i + 0] = normal[0];
                normals[3 * i + 1] = normal[1];
                normals[3 * i + 2] = normal[2];

                vertexProperties[i] = propertyValue;
                vertexIndexs[i] = i;

                i++;
            }
        }

        i = 0;
        let j = 0;
        for (let h = 0; h < nNodesY - 1; h++) {
            for (let w = 0; w < nNodesX - 1; w++) {
                const i0 = h * nNodesX + w;
                const i1 = h * nNodesX + (w + 1);
                const i2 = (h + 1) * nNodesX + (w + 1);
                const i3 = (h + 1) * nNodesX + w;

                const i0_act = !isMesh || (isDefined(meshData[i0]) && isDefined(propertiesData[i0])); // eslint-disable-line
                const i1_act = !isMesh || (isDefined(meshData[i1]) && isDefined(propertiesData[i1])); // eslint-disable-line
                const i2_act = !isMesh || (isDefined(meshData[i2]) && isDefined(propertiesData[i2])); // eslint-disable-line
                const i3_act = !isMesh || (isDefined(meshData[i3]) && isDefined(propertiesData[i3])); // eslint-disable-line

                // Triangles.
                if (i1_act && i3_act) {
                    // diagonal i1, i3
                    if (i0_act) {
                        // t1 - i0 provoking index.
                        triangleIndices[i++] = i1;
                        triangleIndices[i++] = i3;
                        triangleIndices[i++] = i0;
                    }

                    if (i2_act) {
                        // t2 - i2 provoking index.
                        triangleIndices[i++] = i1;
                        triangleIndices[i++] = i3;
                        triangleIndices[i++] = i2;
                    }
                } else if (i0_act && i2_act) {
                    // diagonal i0, i2
                    if (i1_act) {
                        // t1 - i0 provoking index.
                        triangleIndices[i++] = i1;
                        triangleIndices[i++] = i2;
                        triangleIndices[i++] = i0;
                    }

                    if (i3_act) {
                        // t2 - i2 provoking index.
                        triangleIndices[i++] = i3;
                        triangleIndices[i++] = i0;
                        triangleIndices[i++] = i2;
                    }
                }

                // Lines.
                if (i0_act && i1_act) {
                    lineIndices[j++] = i0;
                    lineIndices[j++] = i1;
                }

                if (i0_act && i3_act) {
                    lineIndices[j++] = i0;
                    lineIndices[j++] = i3;
                }

                if (h == nNodesY - 2 && i2_act && i3_act) {
                    lineIndices[j++] = i3;
                    lineIndices[j++] = i2;
                }

                if (w == nNodesX - 2 && i1_act && i2_act) {
                    lineIndices[j++] = i1;
                    lineIndices[j++] = i2;
                }
            }
        }

        // noActiceIndices = i;  // XXX denne trrenges ikke... 
        // console.log("noActiceIndices, i, indices.length: ", noActiceIndices, i, triangleIndices.length)
        //console.log("positions.length: ", positions.length)
        // console.log("indices size before resize: ", indices.length, i)
        // indices_buffer.resize(i * nBytes); // resize from nNodes to potentially fever due to inactive nodes.
        // console.log("indices size after resize: ", indices.length)


    } else {
    //     // PROPERTIES IS SET CONSTANT OVER A CELL.
    //     let i_indices = 0;
    //     let i_vertices = 0;
    //     // Loop over cells.
    //     for (let h = 0; h < ny - 1; h++) {
    //         for (let w = 0; w < nx - 1; w++) {
    //             const hh = ny - 1 - h; // See note above.

    //             const i0 = h * nx + w;
    //             const i1 = h * nx + (w + 1);
    //             const i2 = (h + 1) * nx + (w + 1);
    //             const i3 = (h + 1) * nx + w;

    //             const normal0 = calcNormal(w, h, nx, ny, isMesh, smoothShading, meshData, ox, oy, multZ);         // eslint-disable-line
    //             const normal1 = calcNormal(w + 1, h, nx, ny, isMesh, smoothShading, meshData, ox, oy, multZ);     // eslint-disable-line
    //             const normal2 = calcNormal(w + 1, h + 1, nx, ny, isMesh, smoothShading, meshData, ox, oy, multZ); // eslint-disable-line
    //             const normal3 = calcNormal(w, h + 1, nx, ny, isMesh, smoothShading, meshData, ox, oy, multZ);     // eslint-disable-line

    //             const i0_act = !isMesh || isDefined(meshData[i0]); // eslint-disable-line
    //             const i1_act = !isMesh || isDefined(meshData[i1]); // eslint-disable-line
    //             const i2_act = !isMesh || isDefined(meshData[i2]); // eslint-disable-line
    //             const i3_act = !isMesh || isDefined(meshData[i3]); // eslint-disable-line

    //             const x0 = ox + w * dx;
    //             const y0 = oy + hh * dy;
    //             const z0 = isMesh ? -meshData[i0] * multZ : 0;

    //             const x1 = ox + (w + 1) * dx;
    //             const y1 = oy + hh * dy;
    //             const z1 = isMesh ? -meshData[i1] * multZ : 0;

    //             const x2 = ox + (w + 1) * dx;
    //             const y2 = oy + (hh - 1) * dy; // Note hh - 1 here.
    //             const z2 = isMesh ? -meshData[i2] * multZ : 0;

    //             const x3 = ox + w * dx;
    //             const y3 = oy + (hh - 1) * dy; // Note hh - 1 here.
    //             const z3 = isMesh ? -meshData[i3] * multZ : 0;

    //             const propertyIndex = h * (nx - 1) + w; // (nx - 1) -> the width of the property 2D array is one less than for the nodes in this case.
    //             const propertyValue = propertiesData[propertyIndex];

    //             if (!isDefined(propertyValue)) {
    //                 // Inactive cell, dont draw.
    //                 continue;
    //             }

    //             if (i1_act && i3_act) {
    //                 // diagonal i1, i3
    //                 if (i0_act) {
    //                     // t1 - i0 provoking index.
    //                     positions.push(x1, y1, z1);
    //                     positions.push(x3, y3, z3);
    //                     positions.push(x0, y0, z0);

    //                     normals.push(normal1[0], normal1[1], normal1[2]);
    //                     normals.push(normal3[0], normal3[1], normal3[2]);
    //                     normals.push(normal0[0], normal0[1], normal0[2]);

    //                     vertexIndexs.push(
    //                         i_vertices++,
    //                         i_vertices++,
    //                         i_vertices++
    //                     );

    //                     indices.push(i_indices++, i_indices++, i_indices++);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);

    //                     line_positions.push(x0, y0, z0);
    //                     line_positions.push(x3, y3, z3);

    //                     line_positions.push(x0, y0, z0);
    //                     line_positions.push(x1, y1, z1);
    //                 }

    //                 if (i2_act) {
    //                     // t2 - i2 provoking index.
    //                     positions.push(x1, y1, z1);
    //                     positions.push(x3, y3, z3);
    //                     positions.push(x2, y2, z2);

    //                     normals.push(normal1[0], normal1[1], normal1[2]);
    //                     normals.push(normal3[0], normal3[1], normal3[2]);
    //                     normals.push(normal2[0], normal2[1], normal2[2]);

    //                     vertexIndexs.push(
    //                         i_vertices++,
    //                         i_vertices++,
    //                         i_vertices++
    //                     );

    //                     indices.push(i_indices++, i_indices++, i_indices++);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);

    //                     line_positions.push(x2, y2, z2);
    //                     line_positions.push(x3, y3, z3);

    //                     line_positions.push(x2, y2, z2);
    //                     line_positions.push(x1, y1, z1);
    //                 }

    //                 // diagonal
    //                 if ((i0_act && !i2_act) || (!i0_act && i2_act)) {
    //                     line_positions.push(x1, y1, z1);
    //                     line_positions.push(x3, y3, z3);
    //                 }
    //             } else if (i0_act && i2_act) {
    //                 // diagonal i0, i2
    //                 if (i1_act) {
    //                     // t1 - i0 provoking index.
    //                     positions.push(x1, y1, z1);
    //                     positions.push(x2, y2, z2);
    //                     positions.push(x0, y0, z0);

    //                     normals.push(normal1[0], normal1[1], normal1[2]);
    //                     normals.push(normal2[0], normal2[1], normal2[2]);
    //                     normals.push(normal0[0], normal0[1], normal0[2]);

    //                     vertexIndexs.push(
    //                         i_vertices++,
    //                         i_vertices++,
    //                         i_vertices++
    //                     );

    //                     indices.push(i_indices++, i_indices++, i_indices++);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);

    //                     line_positions.push(x1, y1, z1);
    //                     line_positions.push(x0, y0, z0);

    //                     line_positions.push(x1, y1, z1);
    //                     line_positions.push(x2, y2, z2);
    //                 }

    //                 if (i3_act) {
    //                     // t2 - i2 provoking index.
    //                     positions.push(x0, y0, z0);
    //                     positions.push(x3, y3, z3);
    //                     positions.push(x2, y2, z2);

    //                     normals.push(normal0[0], normal0[1], normal0[2]);
    //                     normals.push(normal3[0], normal3[1], normal3[2]);
    //                     normals.push(normal2[0], normal2[1], normal2[2]);

    //                     vertexIndexs.push(
    //                         i_vertices++,
    //                         i_vertices++,
    //                         i_vertices++
    //                     );

    //                     indices.push(i_indices++, i_indices++, i_indices++);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);
    //                     vertexProperties.push(propertyValue);

    //                     line_positions.push(x3, y3, z3);
    //                     line_positions.push(x0, y0, z0);

    //                     line_positions.push(x3, y3, z3);
    //                     line_positions.push(x2, y2, z2);
    //                 }

    //                 // diagonal
    //                 if ((i3_act && !i1_act) || (!i3_act && i1_act)) {
    //                     line_positions.push(x0, y0, z0);
    //                     line_positions.push(x2, y2, z2);
    //                 }
    //             }
        //     }
        // }
    }

    const mesh: MeshType = {
        drawMode: 4, // corresponds to GL.TRIANGLES,
        attributes: {
            positions: { value: positions, size: 3 },  // XXX sende directr typearrays her..
            normals: { value: normals, size: 3 },
            properties: { value: vertexProperties, size: 1 },
            vertex_indexs: { value: vertexIndexs, size: 1 },
        },
        indices: { value: triangleIndices, size: 1 },
    };

    const mesh_lines: MeshTypeLines = {
        drawMode: 1, // corresponds to GL.LINES,
        attributes: {
            positions: { value: positions, size: 3 },
        },
        indices: { value: lineIndices, size: 1 },
    };

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);

    // Note: typescript gives this error "error TS2554: Expected 2-3 arguments, but got 1."
    // Disabling this for now as the second argument should be optional.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postMessage([mesh, mesh_lines, meshZValueRange, propertyValueRange]);  // XXX returner heller arrrayenen og lag meshet på utsiden..
}
