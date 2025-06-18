import * as png from "@vivaxy/png";

import { JSONLoader, load } from "@loaders.gl/core";

import type { TConstructor, TypedArray } from "./typedArray";
import { toTypedArray } from "./typedArray";

async function safeFetch(url: string): Promise<Response> {
    try {
        return await fetch(url);
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return new Response(null, { status: 404 });
    }
}

/**
 * Loads data from a URL as a Float32Array. Supports both PNG images (with absolute float values)
 * and binary float32 files. If the content type is 'image/png', the PNG is decoded and its pixel
 * data is returned as a Float32Array. Otherwise, the file is loaded as a binary array of floats.
 *
 * @param url - The URL to load data from
 * @returns A Promise resolving to a Float32Array with the data, or null if loading fails
 */
export async function loadURLData<T extends TypedArray>(
    url: string,
    type: TConstructor<T>
): Promise<T | null> {
    let res: T | null = null;
    const response = await safeFetch(url);
    if (!response.ok) {
        return null;
    }
    const blob = await response.blob();
    const contentType = response.headers.get("content-type");
    const isPng = contentType === "image/png";
    if (isPng) {
        // Load as PNG with absolute float values.
        res = await new Promise((resolve) => {
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
    } else {
        // Load as binary array of floats.
        const buffer = await blob.arrayBuffer();
        res = new type(buffer);
    }
    return res;
}

/**
 * Loads data as a typed array from a string (URL), number array, or any typed array.
 * If the input is a URL, it loads the data from the URL. If it's an array, it converts it.
 *
 * @param data - The data to load (string URL, base 64 encoded string, number[], or any typed array like Float32Array)
 * @param type - The targeted TypedArray type (e.g., any typed array like Float32Array)
 * @returns A Promise resolving to the targeted TypedArray or null if input is invalid
 */
export async function loadDataArray<T extends TypedArray>(
    data: string | number[] | TypedArray,
    type: TConstructor<T>
): Promise<T | null> {
    if (!data) {
        return null;
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
        if (response.ok) {
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();
            return new type(buffer);
        }
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
