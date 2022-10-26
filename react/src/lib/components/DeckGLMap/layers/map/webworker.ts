import { MeshType, MeshTypeLines } from "./privateMapLayer";
import { Params } from "./mapLayer";

export function makeFullMesh(e: { data: Params }): void {
    const params = e.data;

    // Keep
    //const t0 = performance.now();

    const meshData = params.meshData;
    const propertiesData = params.propertiesData;
    const isMesh = params.isMesh;
    const frame = params.frame;

    function getFloat32ArrayMinMax(data: Float32Array) {
        let max = -99999999;
        let min = 99999999;
        for (let i = 0; i < data.length; i++) {
            max = data[i] > max ? data[i] : max;
            min = data[i] < min ? data[i] : min;
        }
        return [min, max];
    }

    const meshZValueRange = getFloat32ArrayMinMax(meshData);
    const propertyValueRange = getFloat32ArrayMinMax(propertiesData);

    // Dimensions.
    const ox = frame.origin[0];
    const oy = frame.origin[1];

    const dx = frame.increment[0];
    const dy = frame.increment[1];

    const nx = frame.count[0];
    const ny = frame.count[1];

    const propLength = propertiesData.length;
    const isCellCenteredProperties = propLength === (nx - 1) * (ny - 1);

    if (propLength !== (nx - 1) * (ny - 1) && propLength !== nx * ny) {
        console.error(
            "There should be as many property values as nodes (nx*ny) OR as many as cells (nx - 1) * (ny - 1)."
        );
    }

    const positions: number[] = [];
    const indices: number[] = [];
    const vertexProperties: number[] = [];
    const vertexIndexs: number[] = [];
    const line_positions: number[] = [];

    // Note: Assumed layout of the incomming 2D array of data:
    // First coloumn corresponds to lowest x value. Last column highest x value.
    // First row corresponds to max y value. Last row corresponds to lowest y value.
    // This must be taken into account when calculating vertex x,y values and texture coordinates.

    if (!isCellCenteredProperties) {
        // PROPERTIES IS SET INTERPOLATED OVER A CELL.
        let i = 0;
        // Loop over nodes.
        for (let h = 0; h < ny; h++) {
            for (let w = 0; w < nx; w++) {
                const i0 = h * nx + w;

                const x0 = ox + w * dx;
                const y0 = oy + (ny - 1 - h) * dy; // See note above.
                const z = isMesh ? -meshData[i0] : 0;

                const propertyValue = propertiesData[i0];

                positions.push(x0, y0, z);

                vertexProperties.push(propertyValue);
                vertexIndexs.push(i++);
            }
        }

        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const i0 = h * nx + w;
                const i1 = h * nx + (w + 1);
                const i2 = (h + 1) * nx + (w + 1);
                const i3 = (h + 1) * nx + w;

                const i0_act = !isNaN(meshData[i0]) && !isNaN(propertiesData[i0]); // eslint-disable-line
                const i1_act = !isNaN(meshData[i1]) && !isNaN(propertiesData[i1]); // eslint-disable-line
                const i2_act = !isNaN(meshData[i2]) && !isNaN(propertiesData[i2]); // eslint-disable-line
                const i3_act = !isNaN(meshData[i3]) && !isNaN(propertiesData[i3]); // eslint-disable-line

                const hh = ny - h - 1; // See note above.

                const x0 = ox + w * dx;
                const y0 = oy + hh * dy;
                const z0 = isMesh ? -meshData[i0] : 0;

                const x1 = ox + (w + 1) * dx;
                const y1 = oy + hh * dy;
                const z1 = isMesh ? -meshData[i1] : 0;

                const x2 = ox + (w + 1) * dx;
                const y2 = oy + (hh - 1) * dy;
                const z2 = isMesh ? -meshData[i2] : 0;

                const x3 = ox + w * dx;
                const y3 = oy + (hh - 1) * dy;
                const z3 = isMesh ? -meshData[i3] : 0;

                //   i0---------i1
                //   |          |
                //   |          |
                //   i3---------i2

                if (i1_act && i3_act) {
                    // diagonal i1, i3
                    if (i0_act) {
                        indices.push(i1, i3, i0); // t1 - i0 provoking index.

                        line_positions.push(x0, y0, z0);
                        line_positions.push(x3, y3, z3);

                        line_positions.push(x0, y0, z0);
                        line_positions.push(x1, y1, z1);
                    }

                    if (i2_act) {
                        indices.push(i1, i3, i2); // t2 - i2 provoking index.

                        line_positions.push(x2, y2, z2);
                        line_positions.push(x3, y3, z3);

                        line_positions.push(x2, y2, z2);
                        line_positions.push(x1, y1, z1);
                    }

                    // diagonal
                    if ((i0_act && !i2_act) || (!i0_act && i2_act)) {
                        line_positions.push(x1, y1, z1);
                        line_positions.push(x3, y3, z3);
                    }
                } else if (i0_act && i2_act) {
                    // diagonal i0, i2
                    if (i1_act) {
                        indices.push(i1, i2, i0); // t1 - i0 provoking index.
                    }

                    if (i3_act) {
                        indices.push(i3, i0, i2); // t2 - i2 provoking index.
                    }

                    // diagonal
                    if ((i3_act && !i1_act) || (!i3_act && i1_act)) {
                        line_positions.push(x0, y0, z0);
                        line_positions.push(x2, y2, z2);
                    }
                }
            }
        }
    } else {
        // PROPERTIES IS SET CONSTANT OVER A CELL.
        let i_indices = 0;
        let i_vertices = 0;
        // Loop over cells.
        for (let h = 0; h < ny - 1; h++) {
            for (let w = 0; w < nx - 1; w++) {
                const hh = ny - 1 - h; // See note above.

                const i0 = h * nx + w;
                const i1 = h * nx + (w + 1);
                const i2 = (h + 1) * nx + (w + 1);
                const i3 = (h + 1) * nx + w;

                const i0_act = !isNaN(meshData[i0]); // eslint-disable-line
                const i1_act = !isNaN(meshData[i1]); // eslint-disable-line
                const i2_act = !isNaN(meshData[i2]); // eslint-disable-line
                const i3_act = !isNaN(meshData[i3]); // eslint-disable-line

                const x0 = ox + w * dx;
                const y0 = oy + hh * dy;
                const z0 = isMesh ? -meshData[i0] : 0;

                const x1 = ox + (w + 1) * dx;
                const y1 = oy + hh * dy;
                const z1 = isMesh ? -meshData[i1] : 0;

                const x2 = ox + (w + 1) * dx;
                const y2 = oy + (hh - 1) * dy; // Note hh - 1 here.
                const z2 = isMesh ? -meshData[i2] : 0;

                const x3 = ox + w * dx;
                const y3 = oy + (hh - 1) * dy; // Note hh - 1 here.
                const z3 = isMesh ? -meshData[i3] : 0;

                const propertyIndex = h * (nx - 1) + w; // (nx - 1) -> the width of the property 2D array is one less than for the nodes in this case.
                const propertyValue = propertiesData[propertyIndex];

                if (isNaN(propertyValue)) {
                    // Inactive cell, dont draw.
                    continue;
                }

                if (i1_act && i3_act) {
                    // diagonal i1, i3
                    if (i0_act) {
                        // t1 - i0 provoking index.
                        positions.push(x1, y1, z1);
                        positions.push(x3, y3, z3);
                        positions.push(x0, y0, z0);

                        vertexIndexs.push(
                            i_vertices++,
                            i_vertices++,
                            i_vertices++
                        );

                        indices.push(i_indices++, i_indices++, i_indices++);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);

                        line_positions.push(x0, y0, z0);
                        line_positions.push(x3, y3, z3);

                        line_positions.push(x0, y0, z0);
                        line_positions.push(x1, y1, z1);
                    }

                    if (i2_act) {
                        // t2 - i2 provoking index.
                        positions.push(x1, y1, z1);
                        positions.push(x3, y3, z3);
                        positions.push(x2, y2, z2);

                        vertexIndexs.push(
                            i_vertices++,
                            i_vertices++,
                            i_vertices++
                        );

                        indices.push(i_indices++, i_indices++, i_indices++);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);

                        line_positions.push(x2, y2, z2);
                        line_positions.push(x3, y3, z3);

                        line_positions.push(x2, y2, z2);
                        line_positions.push(x1, y1, z1);
                    }

                    // diagonal
                    if ((i0_act && !i2_act) || (!i0_act && i2_act)) {
                        line_positions.push(x1, y1, z1);
                        line_positions.push(x3, y3, z3);
                    }
                } else if (i0_act && i2_act) {
                    // diagonal i0, i2
                    if (i1_act) {
                        // t1 - i0 provoking index.
                        positions.push(x1, y1, z1);
                        positions.push(x2, y2, z2);
                        positions.push(x0, y0, z0);

                        vertexIndexs.push(
                            i_vertices++,
                            i_vertices++,
                            i_vertices++
                        );

                        indices.push(i_indices++, i_indices++, i_indices++);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);

                        line_positions.push(x1, y1, z1);
                        line_positions.push(x0, y0, z0);

                        line_positions.push(x1, y1, z1);
                        line_positions.push(x2, y2, z2);
                    }

                    if (i3_act) {
                        // t2 - i2 provoking index.
                        positions.push(x0, y0, z0);
                        positions.push(x3, y3, z3);
                        positions.push(x2, y2, z2);

                        vertexIndexs.push(
                            i_vertices++,
                            i_vertices++,
                            i_vertices++
                        );

                        indices.push(i_indices++, i_indices++, i_indices++);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);
                        vertexProperties.push(propertyValue);

                        line_positions.push(x3, y3, z3);
                        line_positions.push(x0, y0, z0);

                        line_positions.push(x3, y3, z3);
                        line_positions.push(x2, y2, z2);
                    }

                    // diagonal
                    if ((i3_act && !i1_act) || (!i3_act && i1_act)) {
                        line_positions.push(x0, y0, z0);
                        line_positions.push(x2, y2, z2);
                    }
                }
            }
        }
    }

    const mesh: MeshType = {
        drawMode: 4, // corresponds to GL.TRIANGLES,
        attributes: {
            positions: { value: new Float32Array(positions), size: 3 },
            properties: { value: new Float32Array(vertexProperties), size: 1 },
            vertex_indexs: { value: new Int32Array(vertexIndexs), size: 1 },
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

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);

    // Note: typescript gives this error "error TS2554: Expected 2-3 arguments, but got 1."
    // Disabling this for now as the second argument should be optional.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postMessage([mesh, mesh_lines, meshZValueRange, propertyValueRange]);
}
