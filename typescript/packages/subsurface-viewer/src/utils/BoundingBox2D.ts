/**
 * 2D bounding box defined as [xmin, ymin, xmax, ymax].
 */
export type BoundingBox2D = [number, number, number, number];

/**
 * Returns the bounding box encompassing both boxes.
 * @param box1 first box.
 * @param box2 second box.
 * @param defaultBox in case both boxes are undefined.
 * @returns the bounding box encompassing both boxes.
 */
export const boxUnion = (
    box1: BoundingBox2D | undefined,
    box2: BoundingBox2D | undefined,
    defaultBox: BoundingBox2D = [0, 0, 1, 1]
): BoundingBox2D => {
    if (box1 === undefined) {
        return box2 ?? defaultBox;
    }
    if (box2 === undefined) {
        return box1 ?? defaultBox;
    }

    const xmin = Math.min(box1[0], box2[0]);
    const ymin = Math.min(box1[1], box2[1]);

    const xmax = Math.max(box1[2], box2[2]);
    const ymax = Math.max(box1[3], box2[3]);
    return [xmin, ymin, xmax, ymax];
};

/**
 * Returns the center of the bounding box.
 * @param box1 bounding box.
 * @returns the center of the bounding box.
 */
export const boxCenter = (box: BoundingBox2D): [number, number] => {
    const xmin = box[0];
    const ymin = box[1];

    const xmax = box[2];
    const ymax = box[3];
    return [xmin + 0.5 * (xmax - xmin), ymin + 0.5 * (ymax - ymin)];
};

/**
 * Returns true if the bounding box is not empty.
 * @param box1 bounding box.
 * @returns true if the bounding box is not empty.
 */
export const isEmpty = (box: BoundingBox2D | undefined): boolean => {
    if (box == undefined) {
        return true;
    }
    const xmin = box[0];
    const ymin = box[1];

    const xmax = box[2];
    const ymax = box[3];

    return !(xmax > xmin && ymax > ymin);
};
