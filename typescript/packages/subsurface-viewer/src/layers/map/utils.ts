import type { Params } from "./mapLayer";

type Vec = [number, number, number];

function getFloat32ArrayMinMax(data: Float32Array) {
    let max = -99999999;
    let min = 99999999;
    for (let i = 0; i < data.length; i++) {
        max = data[i] > max ? data[i] : max;
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
    dx: number,
    dy: number
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

    const noNormal = [0, 0, 0]; // signals a normal could not be calculated.
    if (!i0_act) {
        return noNormal;
    }

    const hh = ny - 1 - h; // Note use hh for h for getting y values.
    const p0 = [ox + w * dx,         oy + hh * dy,        i0_act ? meshData[i0] : 0]; // eslint-disable-line
    const p1 = [ ox + (w - 1) * dx,  oy + hh * dy,        i1_act ? meshData[i1] : 0]; // eslint-disable-line
    const p2 = [ ox + w * dx,        oy + (hh + 1) * dy,  i2_act ? meshData[i2] : 0]; // eslint-disable-line
    const p3 = [ ox + (w + 1) * dx,  oy + hh * dy,        i3_act ? meshData[i3] : 0]; // eslint-disable-line
    const p4 = [ ox + w * dx,        oy + (hh - 1) * dy,  i4_act ? meshData[i4] : 0]; // eslint-disable-line

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

/** Given the input data will build and return the attributes (vertices and indices for triangles and lines)
 * that is used by WebGl. Using indice, lines and triangles share common vertices to save memory.
 */
export function makeFullMesh(params: Params) {
    // Keep
    //const t0 = performance.now();

    const meshData = params.meshData;
    const propertiesData = params.propertiesData;
    const isMesh = params.isMesh;
    const frame = params.frame;
    const smoothShading = params.smoothShading;
    const gridLines = params.gridLines;

    const meshZValueRange = getFloat32ArrayMinMax(meshData);
    const propertyValueRange = getFloat32ArrayMinMax(propertiesData);

    // Dimensions.
    const ox = frame.origin[0];
    const oy = frame.origin[1];

    const dx = frame.increment[0];
    const dy = frame.increment[1];

    const nx = frame.count[0]; // number of nodes in x direction
    const ny = frame.count[1];

    const propLength = propertiesData.length;
    const isCellCenteredProperties = propLength === (nx - 1) * (ny - 1);

    if (propLength !== (nx - 1) * (ny - 1) && propLength !== nx * ny) {
        console.error(
            "There should be as many property values as nodes (nx*ny) OR as many as cells (nx - 1) * (ny - 1)."
        );
    }

    const nNodes = nx * ny;
    const nCells = (nx - 1) * (ny - 1);
    const nTriangles = nCells * 2;

    const positions = new Float32Array(
        isCellCenteredProperties ? nCells * 6 * 3 : nNodes * 3
    );
    const normals = new Int8Array(
        isCellCenteredProperties || !smoothShading ? 0 : nNodes * 3
    );
    const triangleIndices = new Uint32Array(nTriangles * 3);
    const vertexProperties = new Float32Array(
        isCellCenteredProperties ? nCells * 6 : nNodes
    );
    let nLineIndices = 0;
    if (gridLines) {
        nLineIndices = isCellCenteredProperties
            ? nTriangles * 2 * 2
            : nCells * 4 + (nx - 1) * 2 + (ny - 1) * 2;
    }
    const lineIndices = new Uint32Array(nLineIndices);

    // Note: Assumed layout of the incomming 2D array of data:
    // First coloumn corresponds to lowest x value. Last column highest x value.
    // First row corresponds to max y value. Last row corresponds to lowest y value.
    // This must be taken into account when calculating vertex x,y values and texture coordinates.

    if (!isCellCenteredProperties) {
        // PROPERTIES IS SET INTERPOLATED OVER A CELL.
        // Loop vertices.
        let i = 0;
        for (let h = 0; h < ny; h++) {
            for (let w = 0; w < nx; w++) {
                const i0 = h * nx + w;

                const x0 = ox + w * dx;
                const y0 = oy + (ny - 1 - h) * dy; // See note above.
                const z = isMesh ? meshData[i0] : 0;

                const propertyValue = propertiesData[i0];

                positions[3 * i + 0] = x0;
                positions[3 * i + 1] = y0;
                positions[3 * i + 2] = z;

                if (smoothShading) {
                    const normal = calcNormal(w, h, nx, ny, isMesh, smoothShading, meshData, ox, oy, dx, dy); // eslint-disable-line
                    normals[3 * i + 0] = normal[0] * 127; // Normalize to signed 8 bit.
                    normals[3 * i + 1] = normal[1] * 127;
                    normals[3 * i + 2] = normal[2] * 127;
                }

                vertexProperties[i] = propertyValue;
                i++;
            }
        }

        // Loop cells.
        i = 0;
        let j = 0;
        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const i0 = h * nx + w;
                const i1 = h * nx + (w + 1);
                const i2 = (h + 1) * nx + (w + 1);
                const i3 = (h + 1) * nx + w;

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
                if (gridLines) {
                    if (i0_act && i1_act) {
                        lineIndices[j++] = i0;
                        lineIndices[j++] = i1;
                    }

                    if (i0_act && i3_act) {
                        lineIndices[j++] = i0;
                        lineIndices[j++] = i3;
                    }

                    if (h == ny - 2 && i2_act && i3_act) {
                        lineIndices[j++] = i3;
                        lineIndices[j++] = i2;
                    }

                    if (w == nx - 2 && i1_act && i2_act) {
                        lineIndices[j++] = i1;
                        lineIndices[j++] = i2;
                    }

                    // diagonal
                    if ((i0_act && !i2_act) || (!i0_act && i2_act)) {
                        lineIndices[j++] = i1;
                        lineIndices[j++] = i3;
                    }

                    // diagonal
                    if ((i3_act && !i1_act) || (!i3_act && i1_act)) {
                        lineIndices[j++] = i0;
                        lineIndices[j++] = i2;
                    }
                }
            }
        }
    } else {
        // PROPERTIES IS SET CONSTANT OVER A CELL.

        // Loop cells.
        let i = 0;
        let j = 0;
        let k = 0;
        let l = 0;
        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const hh = ny - 1 - h; // See note above.

                const i0 = h * nx + w;
                const i1 = h * nx + (w + 1);
                const i2 = (h + 1) * nx + (w + 1);
                const i3 = (h + 1) * nx + w;

                const i0_act = !isMesh || isDefined(meshData[i0]); // eslint-disable-line
                const i1_act = !isMesh || isDefined(meshData[i1]); // eslint-disable-line
                const i2_act = !isMesh || isDefined(meshData[i2]); // eslint-disable-line
                const i3_act = !isMesh || isDefined(meshData[i3]); // eslint-disable-line

                const x0 = ox + w * dx;
                const y0 = oy + hh * dy;
                const z0 = isMesh ? meshData[i0] : 0;

                const x1 = ox + (w + 1) * dx;
                const y1 = oy + hh * dy;
                const z1 = isMesh ? meshData[i1] : 0;

                const x2 = ox + (w + 1) * dx;
                const y2 = oy + (hh - 1) * dy; // Note hh - 1 here.
                const z2 = isMesh ? meshData[i2] : 0;

                const x3 = ox + w * dx;
                const y3 = oy + (hh - 1) * dy; // Note hh - 1 here.
                const z3 = isMesh ? meshData[i3] : 0;

                const propertyIndex = h * (nx - 1) + w; // (nx - 1) -> the width of the property 2D array is one less than for the nodes in this case.
                const propertyValue = propertiesData[propertyIndex];

                if (!isDefined(propertyValue)) {
                    // Inactive cell, dont draw.
                    continue;
                }

                // Triangles.
                if (i1_act && i3_act) {
                    // diagonal i1, i3
                    if (i0_act) {
                        // t1 - i0 provoking index.
                        triangleIndices[i] = i;
                        const L1 = i;
                        i++;
                        positions[j++] = x1;
                        positions[j++] = y1;
                        positions[j++] = z1;

                        triangleIndices[i] = i;
                        const L2 = i;
                        i++;
                        positions[j++] = x3;
                        positions[j++] = y3;
                        positions[j++] = z3;

                        triangleIndices[i] = i;
                        const L3 = i;
                        i++;
                        positions[j++] = x0;
                        positions[j++] = y0;
                        positions[j++] = z0;

                        if (gridLines) {
                            lineIndices[l++] = L3;
                            lineIndices[l++] = L1;

                            lineIndices[l++] = L3;
                            lineIndices[l++] = L2;
                        }

                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                    }

                    if (i2_act) {
                        // t2 - i2 provoking index.
                        triangleIndices[i] = i;
                        const L1 = i;
                        i++;
                        positions[j++] = x1;
                        positions[j++] = y1;
                        positions[j++] = z1;

                        triangleIndices[i] = i;
                        const L2 = i;
                        i++;
                        positions[j++] = x3;
                        positions[j++] = y3;
                        positions[j++] = z3;

                        triangleIndices[i] = i;
                        const L3 = i;
                        i++;
                        positions[j++] = x2;
                        positions[j++] = y2;
                        positions[j++] = z2;

                        if (gridLines) {
                            lineIndices[l++] = L1;
                            lineIndices[l++] = L3;

                            lineIndices[l++] = L2;
                            lineIndices[l++] = L3;
                        }
                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                    }
                } else if (i0_act && i2_act) {
                    // diagonal i0, i2
                    if (i1_act) {
                        //t1 - i0 provoking index.
                        triangleIndices[i] = i;
                        const L1 = i;
                        i++;
                        positions[j++] = x1;
                        positions[j++] = y1;
                        positions[j++] = z1;

                        triangleIndices[i] = i;
                        const L2 = i;
                        i++;
                        positions[j++] = x2;
                        positions[j++] = y2;
                        positions[j++] = z2;

                        triangleIndices[i] = i;
                        const L3 = i;
                        i++;
                        positions[j++] = x0;
                        positions[j++] = y0;
                        positions[j++] = z0;

                        if (gridLines) {
                            lineIndices[l++] = L1;
                            lineIndices[l++] = L3;

                            lineIndices[l++] = L1;
                            lineIndices[l++] = L2;
                        }

                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                    }

                    if (i3_act) {
                        // t2 - i2 provoking index.
                        triangleIndices[i] = i;
                        const L1 = i;
                        i++;
                        positions[j++] = x3;
                        positions[j++] = y3;
                        positions[j++] = z3;

                        triangleIndices[i] = i;
                        const L2 = i;
                        i++;
                        positions[j++] = x0;
                        positions[j++] = y0;
                        positions[j++] = z0;

                        triangleIndices[i] = i;
                        const L3 = i;
                        i++;
                        positions[j++] = x2;
                        positions[j++] = y2;
                        positions[j++] = z2;

                        if (gridLines) {
                            lineIndices[l++] = L1;
                            lineIndices[l++] = L2;

                            lineIndices[l++] = L1;
                            lineIndices[l++] = L3;
                        }

                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                        vertexProperties[k++] = propertyValue;
                    }
                }
            }
        }
    }

    // Keep this.
    // const t1 = performance.now();
    // console.debug(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);

    return [
        positions,
        normals,
        triangleIndices,
        vertexProperties,
        lineIndices,
        meshZValueRange,
        propertyValueRange,
    ];
}
