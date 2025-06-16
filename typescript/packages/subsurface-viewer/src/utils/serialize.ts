import * as png from "@vivaxy/png";

/**
 * Loads data from a URL as a Float32Array. Supports both PNG images (with absolute float values)
 * and binary float32 files. If the content type is 'image/png', the PNG is decoded and its pixel
 * data is returned as a Float32Array. Otherwise, the file is loaded as a binary array of floats.
 *
 * @param url - The URL to load data from
 * @returns A Promise resolving to a Float32Array with the data, or null if loading fails
 */
export async function loadURLData(url: string): Promise<Float32Array | null> {
    let res: Float32Array | null = null;
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Could not load ", url);
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

                const floatArray = new Float32Array(buffer);
                resolve(floatArray);
            };
        });
    } else {
        // Load as binary array of floats.
        const buffer = await blob.arrayBuffer();
        res = new Float32Array(buffer);
    }
    return res;
}

/**
 * Loads data as a Float32Array from a string (URL), number array, or Float32Array.
 * If the input is a URL, it loads the data from the URL. If it's an array, it converts it.
 *
 * @param data - The data to load (string URL, number[], or Float32Array)
 * @returns A Promise resolving to a Float32Array or null if input is invalid
 */
export async function loadFloat32Data(
    data: string | number[] | Float32Array
): Promise<Float32Array | null> {
    if (!data) {
        return null;
    }
    if (ArrayBuffer.isView(data)) {
        // Input data is typed array.
        return data;
    } else if (Array.isArray(data)) {
        // Input data is native javascript array.
        return new Float32Array(data);
    } else {
        // Input data is an URL.
        return await loadURLData(data);
    }
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
