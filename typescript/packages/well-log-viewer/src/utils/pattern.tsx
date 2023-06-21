import React, { ReactNode } from "react";

export interface PatternsTable {
    patternSize: number;
    patternImages: string[];
    patternNames?: string[];
}

export function patternId(uid: number, index: number): string {
    return "pattern" + uid + "_" + index;
}

export function createPattern(
    uid: number,
    index: number,
    patternsTable: PatternsTable
): ReactNode {
    const patternSize = patternsTable.patternSize;
    const patternImage = patternsTable.patternImages[index];
    const id = patternId(uid, index);
    return (
        <pattern
            key={id}
            id={id}
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
        >
            <image
                width={patternSize}
                height={patternSize}
                href={patternImage}
            />
        </pattern>
    );
}

export function createDefs(
    uid: number,
    patternsTable?: PatternsTable
): ReactNode {
    if (!patternsTable) return null;
    return (
        <defs key="defs">
            {patternsTable.patternImages.map((_value: string, index: number) =>
                createPattern(uid, index, patternsTable)
            )}
        </defs>
    );
}
