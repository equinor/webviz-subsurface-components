import lodash from "lodash";
import { all, create } from "mathjs";

import type {
    SubsurfaceViewerProps,
    TLayerDefinition,
} from "../SubsurfaceViewer";
//import SubsurfaceViewer from "../../SubsurfaceViewer";

/**
 * Helper function to replace non-json arguments in the layers of the SubsurfaceViewerProps.
 * Storybook controls do not support non-json data: when editing controls, the non-json data
 * gets corrupted, leading to undefined behavior or possible crashes.
 * This this function is used to replace the possibly corrupted layers' non-json data controls
 * with the initial data.
 *
 * @example
 * ```typescript
const typedDataLayerId = "typedData_layer";

// Non-json data to be injected into the layers.
const nonJsonLayerArgs = {
    [typedDataLayerId]: {
        pointsData: new Float32Array(pointsDataArray),
        triangleData: new Uint32Array(trglDataArray),
        unusedData: new Uint32Array(0),
    },
};

const typedDataLayer = {
    "@@type": "TriangleLayer",
    id: typedDataLayerId,
    "@@typedArraySupport": true,

    pointsData: nonJsonLayerArgs[typedDataSurfaceLayerId].pointsData,
    triangleData: nonJsonLayerArgs[typedDataSurfaceLayerId].triangleData,
}

export const TypedDataStory: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "subsurface_viewer",
        layers: [typedDataLayer, otherLayer],

    },
    render: (args) => (
        // Replace the non-json data in the layers with the initial data.
        // This is necessary because storybook controls are not typed but handled as Json data.
        // Editing the controls will corrupt typed arrays, like Float32Array or Uint32Array.
        // This function replaces the possibly corrupted layers' non-json data controls with the initial data.
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
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
const nonJsonLayerArgs = {
    [typedDataLayerId]: {
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
    id: njTextureLayerId,
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
 * This function does also support nested objects and handles arrays of objects.
 * In this example, only the first entry of the "triangles" array is handled and gets
 * 'vertices' and 'vertexIndices.value' values replaced with the initial data.
 * The remaining values are untouched.
 *
 * @note For the first rendering, storybook does use the initial, non-corrupted data.
 *       The data corruption does only happen after editing the controls.
 * 
 * @param args storybook controls arguments.
 * @param nonJsonLayerProps structure storing non json data to inject into the layers.
 *        The top level keys are the layer ids.
 * @returns the initial and updated storybook controls arguments.
 */
export function replaceNonJsonArgs(
    args: SubsurfaceViewerProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nonJsonLayerProps: Record<string, any>
) {
    args.layers?.forEach((layer: TLayerDefinition) => {
        if (layer && layer?.id !== undefined) {
            const layerNonJsonProps = nonJsonLayerProps[layer.id as string];
            if (layerNonJsonProps) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((layer as any)["@@typedArraySupport"] !== true) {
                    console.error(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        `Storybook story handles ${(layer as any)["@@type"] ?? "layer"} "${layer.id}" as using non-json properties; the layer is missing "@@typedArraySupport" set to true.`
                    );
                }
                lodash.mergeWith(layer, layerNonJsonProps, customizer);
            }
        }
    });
    return args;
}

/**
 * Recursively traverses the properties of the given object and converts any string values
 * equal to `"undefined"` to `undefined`, and any string values equal to `"null"` to `null`.
 *
 * This function mutates the input object in place. Nested objects are also processed,
 * but arrays are not traversed.
 *
 * @note This function is useful to handle storybook controls which are doing a JSON roundtrip.
 * It allows to convert string representations of `undefined` and `null` back to their actual types.
 *
 * @param layers - The object whose properties will be checked and converted.
 */
export function convertUndefNull(layers: Record<string, unknown>) {
    for (const key in layers) {
        const value = layers[key];
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            convertUndefNull(value as Record<string, unknown>);
        } else {
            if (value === "undefined") {
                layers[key] = undefined;
            }
            if (value === "null") {
                layers[key] = null;
            }
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customizer(objValue: any, srcValue: any): any {
    if (lodash.isUndefined(objValue) || lodash.isNull(srcValue)) {
        return objValue;
    }

    // Check if srcValue is a typed array
    if (ArrayBuffer.isView(srcValue)) {
        return srcValue;
    }

    if (Array.isArray(srcValue) && Array.isArray(objValue)) {
        for (let i = 0; i < srcValue.length && i < objValue.length; i++) {
            objValue[i] = lodash.mergeWith(
                objValue[i],
                srcValue[i],
                customizer
            );
        }
        return objValue;
    }

    return lodash.mergeWith(objValue, srcValue, customizer);
}

/**
 * Creates a MathJs instance with the given seed to allow for deterministic random number generation.
 * @param seed seed to create a MathJs instance.
 * @returns a MathJs instance with the given seed.
 */
export function createMathWithSeed(seed: string) {
    return create(all, { randomSeed: seed });
}
