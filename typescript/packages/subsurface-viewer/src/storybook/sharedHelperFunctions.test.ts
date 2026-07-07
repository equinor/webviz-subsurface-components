import "jest";
import { describe, expect, it } from "@jest/globals";

import lodash from "lodash";

import type { SubsurfaceViewerProps } from "../SubsurfaceViewer";
import { StorybookHelper } from "./sharedHelperFunctions";

function makeArgs(): SubsurfaceViewerProps {
    return {
        id: "storybook-test",
        layers: [
            {
                id: "layer-a",
                "@@type": "TriangleLayer",
                "@@typedArraySupport": true,
                pointsData: [0, 1, 2],
                nested: {
                    triangles: [
                        {
                            vertexIndices: {
                                value: [0, 1, 2],
                                size: 3,
                            },
                        },
                        {
                            vertexIndices: {
                                value: [100, 101, 102],
                                size: 3,
                            },
                        },
                    ],
                },
                bounds: [1000, 1001, 1002, 1003],
            },
            {
                id: "layer-b",
                "@@type": "PointsLayer",
                color: [255, 0, 0],
                bounds: [2000, 2001, 2002, 2003],
            },
        ],
    } as unknown as SubsurfaceViewerProps;
}

function makeInjectedProps() {
    return {
        "layer-a": {
            pointsData: new Float32Array([10, 11, 12]),
            nested: {
                triangles: [
                    {
                        vertexIndices: {
                            value: [100, 101, 102, 103, 104],
                        },
                    },
                    {
                        vertexIndices: {
                            value: new Uint32Array([200, 201, 202, 203, 204]),
                        },
                    },
                ],
            },
            unusedData: new Uint32Array([9, 9, 9]),
        },
    };
}

type TTriangle = {
    vertexIndices: {
        value: number[] | Uint32Array;
        size?: number;
    };
};

function getLayer(
    props: SubsurfaceViewerProps,
    index: number
): Record<string, unknown> {
    return props.layers?.[index] as Record<string, unknown>;
}
function getBounds(props: SubsurfaceViewerProps, index: number): number[] {
    return getLayer(props, index)["bounds"] as number[];
}
function getColor(props: SubsurfaceViewerProps, index: number): number[] {
    return getLayer(props, index)["color"] as number[];
}
function getTriangles(
    props: SubsurfaceViewerProps,
    index: number
): TTriangle[] {
    return (getLayer(props, index)["nested"] as Record<string, unknown>)[
        "triangles"
    ] as TTriangle[];
}

describe("sharedHelperFunctions", () => {
    describe("StorybookHelper.replaceNonJsonArgs", () => {
        it("validate injected data", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            const injectedProps = makeInjectedProps();

            const result1 = helper.injectFields(args1, injectedProps);

            // Layer 0 has replaced fields: the resulting layer 0 is a different object than input layer 0
            // Layer 0.bounds has *no* replaced fields: the resulting layer 0.bounds is the same object than input layer 0.bounds
            // Layer 1 has *no* replaced fields: the resulting layer 1 is the same object as input layer 1
            expect(result1.layers).not.toBe(args1.layers);
            expect(getLayer(result1, 0)).not.toBe(getLayer(args1, 0));
            expect(getLayer(result1, 1)).toBe(getLayer(args1, 1));
            expect(getBounds(result1, 0)[0]).toBe(getBounds(args1, 0)[0]);

            const argsPointsData = getLayer(args1, 0)["pointsData"] as number[];
            expect(argsPointsData).toEqual([0, 1, 2]);
            const resultPointsData = getLayer(result1, 0)[
                "pointsData"
            ] as Float32Array;
            expect(resultPointsData).toBe(injectedProps["layer-a"].pointsData);
            expect(resultPointsData).toEqual(new Float32Array([10, 11, 12]));

            // validate nested data
            const argsTriangles = getTriangles(args1, 0);
            const resultTriangles = getTriangles(result1, 0);
            const nonJsonTriangles = injectedProps["layer-a"].nested.triangles;

            expect(resultTriangles).not.toBe(argsTriangles);
            expect(resultTriangles[0].vertexIndices.value).toBe(
                nonJsonTriangles[0].vertexIndices.value
            );
            expect(resultTriangles[1].vertexIndices.value).toBe(
                nonJsonTriangles[1].vertexIndices.value
            );
        });

        it("throws when typed arrays are injected into a layer without typedArraySupport", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            const injectedProps = makeInjectedProps();

            (args1.layers as Record<string, unknown>[])[0][
                "@@typedArraySupport"
            ] = false;

            expect(() => helper.injectFields(args1, injectedProps)).toThrow(
                /typed arrays/i
            );
        });

        // it("warns when a layer without typedArraySupport only uses JSON-safe data", () => {
        //     const helper = new StorybookHelper();
        //     const args1 = makeArgs();
        //     const injectedProps = makeInjectedProps();
        //     const warnSpy = jest
        //         .spyOn(console, "warn")
        //         .mockImplementation(() => undefined);

        //     helper.injectFields(args1, injectedProps);

        //     expect(warnSpy).toHaveBeenCalledTimes(1);
        //     warnSpy.mockRestore();
        // });

        it("inverted layer order is reflected at layer level", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            const injectedProps = makeInjectedProps();

            const result1 = helper.injectFields(args1, injectedProps);

            const invertedArgs = {
                ...args1,
                layers: [
                    ...(args1.layers as Record<string, unknown>[]).reverse(),
                ],
            } as SubsurfaceViewerProps;
            const result2 = helper.injectFields(invertedArgs, injectedProps);
            expect(result2.layers?.[0]).toBe(result1.layers?.[1]);
            expect(result2.layers?.[1]).toBe(result1.layers?.[0]);

            // ensure it also works with a new instance of StorybookHelper (to test memoization)
            const helper2 = new StorybookHelper();
            const result22 = helper2.injectFields(invertedArgs, injectedProps);
            expect(result22.layers?.[0]).toEqual(result1.layers?.[1]);
            expect(result22.layers?.[1]).toEqual(result1.layers?.[0]);
        });

        it("does not inject unused data", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            const injectedProps = makeInjectedProps();

            const result1 = helper.injectFields(args1, injectedProps);

            expect(getLayer(result1, 0)["unusedData"]).toBe(undefined);
        });

        it("does not grow arrays", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            // work on clone to avoid modifying the original injectedProps
            const injectedProps = lodash.cloneDeep(makeInjectedProps());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newTriangles: any = {
                vertexIndices: {
                    value: [200, 201, 202] as number[] | Uint32Array,
                },
            };
            injectedProps["layer-a"].nested.triangles.push(newTriangles);

            const result1 = helper.injectFields(args1, injectedProps);

            const result1Triangles = getTriangles(result1, 0);
            const args1Triangles = getTriangles(args1, 0);
            expect(result1Triangles.length).toBe(args1Triangles.length);
            expect(result1Triangles.length).toBe(2);
        });

        it("does not shrink arrays", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            // work on clone to avoid modifying the original injectedProps
            const injectedProps = lodash.cloneDeep(makeInjectedProps());

            injectedProps["layer-a"].nested.triangles.pop();

            const result1 = helper.injectFields(args1, injectedProps);

            const result1Triangles = getTriangles(result1, 0);
            const args1Triangles = getTriangles(args1, 0);
            expect(result1Triangles.length).toBe(args1Triangles.length);
        });

        it("returns the exact same output object when called again with unchanged inputs", () => {
            const helper = new StorybookHelper();
            const args = makeArgs();
            const injectedProps = makeInjectedProps();

            const result1 = helper.injectFields(args, injectedProps);
            const result2 = helper.injectFields(args, injectedProps);

            expect(result2).toBe(result1);
            expect(result2.layers).toBe(result1.layers);
            expect(result2.layers?.[0]).toBe(result1.layers?.[0]);
            expect(result2.layers?.[1]).toBe(result1.layers?.[1]);
        });

        it("only changes output nodes for layers whose input nodes changed", () => {
            const helper = new StorybookHelper();
            const injectedProps = makeInjectedProps();
            const args1 = makeArgs();
            const result1 = helper.injectFields(args1, injectedProps);

            // Layer 0 has replaced fields: the resulting layer 0 is a different object than input layer 0
            // Layer 0.bounds has *no* replaced fields: the resulting layer 0.bounds is the same object than input layer 0.bounds
            // Layer 1 has *no* replaced fields: the resulting layer 1 is the same object as input layer 1
            expect(result1.layers).not.toBe(args1.layers);
            expect(getLayer(result1, 0)).not.toBe(getLayer(args1, 0));
            expect(getLayer(result1, 1)).toBe(getLayer(args1, 1));
            expect(getBounds(result1, 0)[0]).toBe(getBounds(args1, 0)[0]);

            const args2 = {
                ...args1,
                layers: [
                    args1.layers?.[0],
                    {
                        ...(args1.layers?.[1] as Record<string, unknown>),
                        color: [0, 255, 0],
                        //bounds: [1010, 1011, 1012, 1013],
                    },
                ],
            } as SubsurfaceViewerProps;

            const result2 = helper.injectFields(args2, injectedProps);

            // changes between args2 and args1 must be reflected
            expect(args2).not.toBe(args1);
            expect(result2).not.toBe(result1);
            expect(args2.layers).not.toBe(args1.layers);
            expect(result2.layers).not.toBe(result1.layers);
            // layer 0 was not modified
            expect(getLayer(args2, 0)).toBe(getLayer(args1, 0));
            expect(getLayer(result2, 0)).toBe(getLayer(result1, 0));
            // layer 1 was modified
            expect(getLayer(args2, 1)).not.toBe(getLayer(args1, 1));
            expect(getLayer(result2, 1)).not.toBe(getLayer(result1, 1));
            // layer 1 color was modified
            expect(getColor(args2, 1)).not.toBe(getColor(args1, 1));
            expect(getColor(result2, 1)).not.toBe(getColor(result1, 1));
            // layer 1 bounds was not modified
            expect(getBounds(args2, 1)).toBe(getBounds(args1, 1));
            expect(getBounds(result2, 1)).toBe(getBounds(result1, 1));
        });

        it("does not reuse output nodes for deep-equal but new input references", () => {
            const helper = new StorybookHelper();
            const args1 = makeArgs();
            const injectedProps = makeInjectedProps();

            const result1 = helper.injectFields(args1, injectedProps);
            const args2 = lodash.cloneDeep(args1) as SubsurfaceViewerProps;

            const result2 = helper.injectFields(args2, injectedProps);

            expect(result2).not.toBe(result1);
            expect(result2.layers).not.toBe(result1.layers);
            expect(result2.layers?.[0]).not.toBe(result1.layers?.[0]);
            expect(result2.layers?.[1]).not.toBe(result1.layers?.[1]);
        });

        it("applies replacements for non-layer args", () => {
            const helper = new StorybookHelper();
            const args = {
                id: "storybook-test",
                config: {
                    points: [0, 1, 2],
                    options: {
                        mode: "default",
                        value: [5, 6, 7],
                    },
                },
            };
            const nonJsonArgs = {
                config: {
                    points: new Float32Array([10, 11, 12]),
                    options: {
                        value: new Uint32Array([20, 21, 22]),
                    },
                },
            };

            const result = helper.injectFields(args, nonJsonArgs);
            const resultConfig = result.config as Record<string, unknown>;
            const resultOptions = resultConfig["options"] as Record<
                string,
                unknown
            >;

            expect(result).not.toBe(args);
            expect(resultConfig["points"]).toBe(nonJsonArgs.config["points"]);
            expect(resultOptions["value"]).toBe(
                nonJsonArgs.config["options"]["value"]
            );
            expect(resultOptions["mode"]).toBe("default");
        });
    });
});
