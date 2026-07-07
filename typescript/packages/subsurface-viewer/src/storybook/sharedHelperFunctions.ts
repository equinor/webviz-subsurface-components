import { all, create } from "mathjs";

import { Layer } from "@deck.gl/core";

import { isNumberArray, isTypedArray } from "../utils/typedArray";

/**
 * Recursively traverses the properties of the field structure object and converts any string values
 * equal to `"undefined"` to `undefined`, and any string values equal to `"null"` to `null`.
 *
 * This function mutates the input object in place. Nested objects are also processed,
 * but arrays are not traversed.
 *
 * @note This function is useful to handle storybook controls which are doing a JSON roundtrip.
 * It allows to convert string representations of `undefined` and `null` back to their actual types.
 *
 * @param args - The object whose fields will be checked and converted.
 */
export function convertUndefNull(args: Record<string, unknown>): void {
    for (const key in args) {
        const value = args[key];
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            convertUndefNull(value as Record<string, unknown>);
        } else {
            if (value === "undefined") {
                args[key] = undefined;
            }
            if (value === "null") {
                args[key] = null;
            }
        }
    }
}

function isRecord(layer: unknown): layer is Record<string, unknown> {
    return typeof layer === "object" && !(layer instanceof Layer);
}

/**
 * Creates a MathJs instance with the given seed to allow for deterministic random number generation.
 * @param seed seed to create a MathJs instance.
 * @returns a MathJs instance with the given seed.
 */
export function createMathWithSeed(seed: string) {
    return create(all, { randomSeed: seed });
}

type StorybookHelperMemoEntry<InputType = unknown, InjectedType = unknown> = {
    input?: InputType;
    injectedData?: InjectedType;
    output?: InputType;
};

/**
 * Helper class for Storybook that manages replacement of arguments.
 *
 * Helper class to replace non-json arguments or huge data in the storybook controls. These cases
 * Storybook controls do not support non-json data or huge data: huge data can lead to freezes and editing controls
 * corrupts non-json data, leading to undefined behavior or possible crashes.
 * This this function is used to replace the possibly corrupted layers' non-json/big data controls
 * with the initial data.
 * 
 * Typical usage are:
 * - providing huge data to the layers: storybook controls are not suitable for handling large datasets,
 *   like the geometry of data (ie. points, triangles, polylines) or properties (i.e. images, seismic data).
 * - providing non json data like typed arrays (Float32Array, Uint32Array, etc.): storybook controls are
 *   subject to JSON roundtrip (convert to and from JSON), which corrupts non-json data like typed arrays.
 *
 * Uses memoization and structural sharing to optimize performance by caching and reusing
 * layer objects when their inputs haven't changed.
 *
 * @example
 * ```typescript
const typedSurfaceDataLayerId = "typedData_layer";

// Non-json data to be injected into the layers.
const injectedArgs = {
    [typedSurfaceDataLayerId]: {
        pointsData: new Float32Array(pointsDataArray),
        triangleData: new Uint32Array(trglDataArray),
        unusedData: new Uint32Array(0),
    },
};

const typedDataLayer = {
    "@@type": "TriangleLayer",
    id: typedSurfaceDataLayerId,
    "@@typedArraySupport": true,

    pointsData: injectedArgs[typedSurfaceDataLayerId].pointsData,
    triangleData: injectedArgs[typedSurfaceDataLayerId].triangleData,
}

const helper = new StorybookHelper();

export const TypedSurfaceDataStory: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "subsurface_viewer",
        layers: [typedSurfaceDataLayer, otherLayer],

    },
    render: (args) => (
        // Replace the non-json data in the layers with the initial data.
        // This is necessary because storybook controls are not typed but handled as Json data.
        // Editing the controls will corrupt typed arrays, like Float32Array or Uint32Array.
        // This function replaces the possibly corrupted layers' non-json data controls with the initial data.

        <SubsurfaceViewer {...helper.replaceNonJsonArgs(args, injectedArgs)} />
    ),
};
 * ```
 * In this example, only the values of the existing pointsData and triangleData properties of the layer(s)
 * with id "typedData_layer" are replaced with the initial data.
 * 'unusedData' value is not added to layer, as it is not a value of the layer.
 * 
 * @example
 * ```typescript
// Non-json data to be injected into the layers.
const injectedArgs = {
    [typedSurfaceDataLayerId]: {
        triangles:  [
            {
                vertices: new Float32Array(sectionZ0Vertices),
                vertexIndices: {
                    value: new Uint32Array(sectionZ0Indices),
                },
            },
        ],
    },
};

const ComplexDataLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    "@@typedArraySupport": true,
    id: typedSurfaceDataLayerId,
    valueMappedTriangles: [
        {
            topology: "triangle-strip",
            vertices: new Float32Array(sectionZ0Vertices),
            vertexIndices: {
                value: new Uint32Array(sectionZ0Indices),
                size: 4,
            },
        },
    ],
    showMesh: true,
    ZIncreasingDownwards: true,
};
 * ```
 */
export class StorybookHelper {
    private memo: Record<string, StorybookHelperMemoEntry> = {};

    private rootCache: StorybookHelperMemoEntry<
        unknown,
        Record<string, unknown>
    > = {};

    /**
     * Replaces non-JSON or huge fields in the provided fieldStructure by injecting fields of
     * injectedFields. Uses memoization to avoid unnecessary recalculations.
     * It also converts string representations of "undefined" and "null" back to their actual types.
     * @note This function is still mostly adapted to layers, but it can be used for any other storybook controls arguments.
     * @param fieldStructure field structure.
     * @param injectedFields field hierarchy (and layer IDs for `layers`) to be injected.
     * @returns The field structure with injected data.
     */
    injectFields<FieldStructure extends object>(
        fieldStructure: FieldStructure,
        injectedFields: Record<string, unknown>
    ): FieldStructure {
        if (
            this.rootCache.output &&
            fieldStructure === this.rootCache.input &&
            injectedFields === this.rootCache.injectedData
        ) {
            return this.rootCache.output as FieldStructure;
        }

        try {
            convertUndefNull(
                fieldStructure as unknown as Record<string, unknown>
            );
        } catch (error) {
            console.error("Error converting undefined and null values:", error);
        }

        const nextArgs = {
            ...fieldStructure,
        } as FieldStructure;
        const argsRecord = fieldStructure as unknown as Record<string, unknown>;
        const nextArgsRecord = nextArgs as unknown as Record<string, unknown>;

        let changed = false;

        const layersArg = argsRecord["layers"];
        if (Array.isArray(layersArg)) {
            let layersChanged = false;
            const nextLayers = layersArg.map((layer) => {
                if (!isRecord(layer) || layer["id"] === undefined) {
                    return layer;
                }

                const layerId = layer["id"] as string;
                const layerNonJsonProps = injectedFields[layerId];
                const memoEntry = this.memo[layerId];
                const isTypedArraySafe = layer["@@typedArraySupport"] === true;
                if (!isTypedArraySafe) {
                    if (containsTypedArray(layerNonJsonProps)) {
                        throw new Error(
                            `Storybook story injects typed arrays into ${layer["@@type"] ?? "layer"} "${layerId}" without "@@typedArraySupport" set to true.`
                        );
                    }

                    // console.warn(
                    //     `Storybook story handles ${layer["@@type"] ?? "layer"} "${layerId}" as using injected properties; the layer is missing "@@typedArraySupport" set to true.`
                    // );
                }

                if (
                    layer === memoEntry?.input &&
                    layerNonJsonProps === memoEntry?.injectedData
                ) {
                    layersChanged = layersChanged || memoEntry.output !== layer;
                    return memoEntry.output;
                }

                const nextLayer = mergeImmutableWithStructuralSharing(
                    layer,
                    layerNonJsonProps,
                    memoEntry
                );

                this.memo[layerId] = {
                    input: layer,
                    injectedData: layerNonJsonProps,
                    output: nextLayer,
                };

                layersChanged = layersChanged || nextLayer !== layer;
                return nextLayer;
            });

            if (layersChanged) {
                nextArgsRecord["layers"] = nextLayers;
                changed = true;
            }
        }

        const prevInput = isRecord(this.rootCache.input)
            ? this.rootCache.input
            : undefined;
        const prevOutput = isRecord(this.rootCache.output)
            ? this.rootCache.output
            : undefined;

        for (const key of Object.keys(argsRecord)) {
            if (key === "layers") {
                continue;
            }

            const nextValue = mergeImmutableWithStructuralSharing(
                argsRecord[key],
                injectedFields[key],
                {
                    input: prevInput?.[key],
                    injectedData: this.rootCache.injectedData?.[key],
                    output: prevOutput?.[key],
                }
            );

            if (nextValue !== argsRecord[key]) {
                nextArgsRecord[key] = nextValue;
                changed = true;
            }
        }

        const output = changed ? nextArgs : fieldStructure;

        this.rootCache = {
            input: fieldStructure,
            injectedData: injectedFields,
            output,
        };
        return output;
    }
}

function mergeImmutableWithStructuralSharing(
    currentValue: unknown,
    sourceValue: unknown,
    previousValue?: StorybookHelperMemoEntry
): unknown {
    if (
        previousValue?.input !== undefined &&
        currentValue === previousValue.input &&
        sourceValue === previousValue.injectedData
    ) {
        return previousValue.output;
    }

    if (sourceValue === null) {
        return currentValue;
    }

    if (ArrayBuffer.isView(sourceValue) || isNumberArray(sourceValue)) {
        return sourceValue;
    }

    if (!isMergeableNode(currentValue)) {
        return sourceValue ?? currentValue;
    }

    if (Array.isArray(currentValue)) {
        return mergeArrayImmutable(currentValue, sourceValue, previousValue);
    }

    return mergeObjectImmutable(currentValue, sourceValue, previousValue);
}

function mergeArrayImmutable(
    currentArray: unknown[],
    sourceArray: unknown,
    previousArray?: StorybookHelperMemoEntry
): unknown[] {
    if (!Array.isArray(sourceArray)) {
        return currentArray;
    }

    const prevInput = Array.isArray(previousArray?.input)
        ? previousArray.input
        : undefined;
    const prevSource = Array.isArray(previousArray?.injectedData)
        ? previousArray.injectedData
        : undefined;
    const prevOutput = Array.isArray(previousArray?.output)
        ? previousArray.output
        : undefined;

    const nextArray = new Array(currentArray.length);
    let changed = false;

    for (let index = 0; index < currentArray.length; index++) {
        const nextValue = mergeImmutableWithStructuralSharing(
            currentArray[index],
            sourceArray[index],
            {
                input: prevInput?.[index],
                injectedData: prevSource?.[index],
                output: prevOutput?.[index],
            }
        );
        nextArray[index] = nextValue;
        changed = changed || nextValue !== currentArray[index];
    }

    return changed ? nextArray : currentArray;
}

function mergeObjectImmutable(
    currentObject: Record<string, unknown>,
    sourceObject: unknown,
    previousObject?: StorybookHelperMemoEntry
): Record<string, unknown> {
    if (!isRecord(sourceObject)) {
        return currentObject;
    }

    const prevInput = isRecord(previousObject?.input)
        ? previousObject.input
        : undefined;
    const prevSource = isRecord(previousObject?.injectedData)
        ? previousObject.injectedData
        : undefined;
    const prevOutput = isRecord(previousObject?.output)
        ? previousObject.output
        : undefined;

    const nextObject: Record<string, unknown> = {};
    const keys = Object.keys(currentObject);
    // do not grow the object with new keys from sourceObject, only replace existing keys
    // new Set([...Object.keys(currentObject), ...Object.keys(sourceObject),]);
    let changed = false;

    for (const key of keys) {
        const nextValue = mergeImmutableWithStructuralSharing(
            currentObject[key],
            sourceObject[key],
            {
                input: prevInput?.[key],
                injectedData: prevSource?.[key],
                output: prevOutput?.[key],
            }
        );
        nextObject[key] = nextValue;
        changed = changed || nextValue !== currentObject[key];
    }

    return changed ? nextObject : currentObject;
}

function isMergeableNode(
    value: unknown
): value is Record<string, unknown> | unknown[] {
    return (
        typeof value === "object" &&
        value !== null &&
        !ArrayBuffer.isView(value)
    );
}

function containsTypedArray(value: unknown): boolean {
    if (isTypedArray(value)) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some((item) => containsTypedArray(item));
    }

    if (typeof value === "object" && value !== null) {
        return Object.values(value).some((item) => containsTypedArray(item));
    }

    return false;
}
