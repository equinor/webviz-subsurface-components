import "jest";

import fs from "fs";
import path from "path";

import { loadDataArray } from "./serialize";

const exampleDataDir = "../../../../../example-data";
const smallPropertyFile = "small_properties.float32";

globalThis.fetch = jest.fn(async (url: string | URL | RequestInfo) => {
    if (typeof url === "string") {
        const filePath = path.resolve(__dirname, exampleDataDir, url);
        const buffer = fs.readFileSync(filePath);
        return {
            async blob() {
                return {
                    async arrayBuffer() {
                        return buffer.buffer.slice(
                            buffer.byteOffset,
                            buffer.byteOffset + buffer.byteLength
                        );
                    },
                };
            },
            headers: new Headers(),
            ok: true,
            status: 200,
        } as Response;
    }
    return {
        ok: false,
        status: 500,
    } as Response;
});

// Helper to fetch and read the binary file as reference
async function getReferenceFloat32Array(): Promise<Float32Array> {
    // Read the binary file using fs and assign it to Float32Array
    const filePath = path.resolve(__dirname, exampleDataDir, smallPropertyFile);
    const buffer = fs.readFileSync(filePath);
    return new Float32Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength / Float32Array.BYTES_PER_ELEMENT
    );

    //return new Float32Array(smallPropertyBufferRef);
    // const response = await fetch(smallPropertyFile);
    // const buffer = await response.arrayBuffer();
    // return new Float32Array(buffer);
}

describe("loadDataArray for Float32Array", () => {
    it("returns null for null input", async () => {
        const result = await loadDataArray(
            null as unknown as string,
            Float32Array
        );
        expect(result).toBeNull();
    });

    it("returns the same Float32Array if input is already Float32Array", async () => {
        const arr = new Float32Array([1, 2, 3]);
        const result = await loadDataArray(arr, Float32Array);
        expect(result).toBe(arr);
    });

    it("converts Float64Array to Float32Array", async () => {
        const arr = new Float64Array([1, 2, 3]);
        const result = await loadDataArray(arr, Float32Array);
        expect(result!.length).toBe(arr.length);
        // Compare values with precision
        for (let i = 0; i < arr.length; i++) {
            expect(result![i]).toBeCloseTo(arr[i]);
        }
    });

    it("converts number[] to Float32Array", async () => {
        const arr = [1, 2, 3];
        const result = await loadDataArray(arr, Float32Array);
        expect(result).toBeInstanceOf(Float32Array);
        expect(Array.from(result!)).toEqual(arr);
    });

    it("loads Float32Array from a binary file URL", async () => {
        const expected = await getReferenceFloat32Array();
        const result = await loadDataArray(smallPropertyFile, Float32Array);
        expect(result).toBeInstanceOf(Float32Array);
        expect(result!.length).toBe(expected.length);
        // Compare values with precision
        for (let i = 0; i < expected.length; i++) {
            expect(result![i]).toBeCloseTo(expected[i]);
        }
    });
});
