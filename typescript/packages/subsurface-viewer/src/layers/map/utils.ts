// Rotate x,y around x0, y0 rad radians
export function rotate(
    x: number,
    y: number,
    x0: number,
    y0: number,
    rad: number
): [number, number] {
    const xRot = Math.cos(rad) * (x - x0) - Math.sin(rad) * (y - y0) + x0; // eslint-disable-line
    const yRot = Math.sin(rad) * (x - x0) + Math.cos(rad) * (y - y0) + y0; // eslint-disable-line
    return [xRot, yRot];
}
