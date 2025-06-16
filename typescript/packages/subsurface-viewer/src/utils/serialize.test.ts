import "jest";

import fs from "fs";
import path from "path";

import { loadFloat32Data } from "./serialize";

const smallPropertyFile =
    "../../../../../example-data/small_properties.float32";

// Helper to fetch and read the binary file as reference
// async function getReferenceFloat32Array(): Promise<Float32Array> {
//     // Read the binary file using fs and assign it to Float32Array
//     const filePath = path.resolve(__dirname, smallPropertyFile);
//     const buffer = fs.readFileSync(filePath);
//     return new Float32Array(
//         buffer.buffer,
//         buffer.byteOffset,
//         buffer.byteLength / Float32Array.BYTES_PER_ELEMENT
//     );

//     //return new Float32Array(smallPropertyBufferRef);
//     // const response = await fetch(smallPropertyFile);
//     // const buffer = await response.arrayBuffer();
//     // return new Float32Array(buffer);
// }

describe("loadFloat32Data", () => {
    it("returns null for null input", async () => {
        const result = await loadFloat32Data(null as unknown as string);
        expect(result).toBeNull();
    });

    it("returns the same Float32Array if input is already Float32Array", async () => {
        const arr = new Float32Array([1, 2, 3]);
        const result = await loadFloat32Data(arr);
        expect(result).toBe(arr);
    });

    it("converts number[] to Float32Array", async () => {
        const arr = [1, 2, 3];
        const result = await loadFloat32Data(arr);
        expect(result).toBeInstanceOf(Float32Array);
        expect(Array.from(result!)).toEqual(arr);
    });

    // Needs elaborated mocking of fetch
    // it("loads Float32Array from a binary file URL", async () => {
    //     const expected = await getReferenceFloat32Array();
    //     const result = await loadFloat32Data(smallPropertyFile);
    //     expect(result).toBeInstanceOf(Float32Array);
    //     expect(result!.length).toBe(expected.length);
    //     // Compare values with precision
    //     for (let i = 0; i < expected.length; i++) {
    //         expect(result![i]).toBeCloseTo(expected[i]);
    //     }
    // });
});
