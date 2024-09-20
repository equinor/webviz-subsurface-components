/**
 * 3D bounding box defined as [xmin, ymin, zmin, xmax, ymax, zmax].
 */
export type BoundingBox3D = [number, number, number, number, number, number];

/**
 * Returns the bounding box encompassing both boxes.
 * @param box1 first box.
 * @param box2 second box.
 * @param defaultBox in case both boxes are undefined.
 * @returns the bounding box encompassing both boxes.
 */
export const boxUnion = (
    box1: BoundingBox3D | undefined,
    box2: BoundingBox3D | undefined,
    defaultBox: BoundingBox3D = [0, 0, 0, 1, 1, 1]
): BoundingBox3D => {
    if (box1 === undefined) {
        return box2 ?? defaultBox;
    }
    if (box2 === undefined) {
        return box1 ?? defaultBox;
    }

    const xmin = Math.min(box1[0], box2[0]);
    const ymin = Math.min(box1[1], box2[1]);
    const zmin = Math.min(box1[2], box2[2]);

    const xmax = Math.max(box1[3], box2[3]);
    const ymax = Math.max(box1[4], box2[4]);
    const zmax = Math.max(box1[5], box2[5]);
    return [xmin, ymin, zmin, xmax, ymax, zmax];
};

/**
 * 3D point defined as [x, y, z].
 */
export type Point3D = [number, number, number];

/**
 * Returns the center of the bounding box.
 * @param box1 bounding box.
 * @returns the center of the bounding box.
 */
export const boxCenter = (box: BoundingBox3D): Point3D => {
    const xmin = box[0];
    const ymin = box[1];
    const zmin = box[2];

    const xmax = box[3];
    const ymax = box[4];
    const zmax = box[5];
    return [
        xmin + 0.5 * (xmax - xmin),
        ymin + 0.5 * (ymax - ymin),
        zmin + 0.5 * (zmax - zmin),
    ];
};

/**
 * Returns true if the bounding box is not empty.
 * @param box1 bounding box.
 * @returns true if the bounding box is not empty.
 */
export const isEmpty = (box: BoundingBox3D | undefined): boolean => {
    if (box == undefined) {
        return true;
    }
    const xmin = box[0];
    const ymin = box[1];
    const zmin = box[2];

    const xmax = box[3];
    const ymax = box[4];
    const zmax = box[5];

    // the box can be bottom-up in some cases, thus the zmax != zmin
    return !(xmax > xmin && ymax > ymin && zmax != zmin);
};
