import * as png from "@vivaxy/png";

import { JSONLoader, load } from "@loaders.gl/core";

import type { TConstructor, TypedArray } from "./typedArray";
import { toTypedArray } from "./typedArray";

async function safeFetch(url: string): Promise<Response> {
    try {
        return await fetch(url);
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return new Response(null, { status: 500 });
    }
}

/**
 * Loads PNG image data (with absolute float values) from a Response object
 * and decodes it into a typed array of the specified type.
 *
 * This function reads the response as a Blob, decodes the PNG image data, and converts the pixel data
 * into a typed array (e.g., Float32Array, Uint8Array) using the provided constructor.
 *
 * @template T - The type of TypedArray to return (e.g., Float32Array, Uint8Array).
 * @param response - The Response object containing the PNG image data.
 * @param type - The constructor for the desired TypedArray type.
 * @returns A promise that resolves to a typed array containing the decoded image data, or null if decoding fails.
 */
async function loadPngData<T extends TypedArray>(
    response: Response,
    type: TConstructor<T>
): Promise<T> {
    // Load as PNG with absolute float values.
    const blob = await response.blob();
    const result: T = await new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(blob);
        fileReader.onload = () => {
            const arrayBuffer = fileReader.result;
            const imgData = png.decode(arrayBuffer as ArrayBuffer);
            const data = imgData.data; // array of ints (pixel data)

            const n = data.length;
            const buffer = new ArrayBuffer(n);
            const view = new DataView(buffer);
            for (let i = 0; i < n; i++) {
                view.setUint8(i, data[i]);
            }

            const floatArray = new type(buffer);
            resolve(floatArray);
        };
    });
    return result;
}

function isPngData(headers: Headers): boolean {
    const contentType = headers.get("content-type");
    return contentType === "image/png";
}

/**
 * Loads data as a typed array from a string (URL), number array, or any typed array.
 * If the input is a URL, it loads the data from the URL. Supports binary float32 files,
 * PNG images (with absolute float values) and json files storing number arrays.
 *
 * @param data - The data to load (string URL, base 64 encoded string, number[], or any typed array like Float32Array)
 * @param type - The targeted TypedArray type (e.g., any typed array like Float32Array)
 * @returns A Promise resolving to the targeted TypedArray or null if input is invalid
 */
export async function loadDataArray<T extends TypedArray>(
    data: string | number[] | TypedArray,
    type: TConstructor<T>
): Promise<T> {
    if (!data) {
        return new type(0);
    }
    if (typeof data === "string") {
        const extension = data.split(".").pop()?.toLowerCase();
        // Data is a file name with .json extension
        if (extension === "json") {
            const stringData = await load(data, JSONLoader);
            return new type(stringData);
        }
        // It is assumed that the data is a file containing raw array of bytes.
        const response = await safeFetch(data);
        if (!response.ok) {
            return new type(0);
        }
        if (isPngData(response.headers)) {
            return await loadPngData(response, type);
        }

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        return new type(buffer);
    } else {
        return toTypedArray(data, type);
    }
    return Promise.reject("loadDataArray: unsupported type of input data");
}

/**
 * For debugging: triggers a download of a Float32Array as a binary file named 'propertiesData.bin'.
 *
 * @param data - The Float32Array to dump
 */
export function debug_dumpToBinaryFile(data: Float32Array) {
    // Write propertiesData to a binary file for debugging
    if (data instanceof Float32Array) {
        const blob = new Blob([data.buffer], {
            type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "propertiesData.bin";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
