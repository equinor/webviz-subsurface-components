import "jest";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { LayerManager } from "@deck.gl/core";

import type { MapFrame } from "./typeDefs";
import MapLayer, {
    getUndefinedValueProperties,
    normalizeDiscreteProperties,
    resampleMesh,
} from "./mapLayer";

type WorkerJob = {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
};
const mockWorkerJobs: WorkerJob[] = [];

// Replaces the web worker pool with jobs that the tests settle by hand.
jest.mock("workerpool", () => ({
    __esModule: true,
    default: {
        pool: () => ({
            exec: () =>
                new Promise((resolve, reject) => {
                    mockWorkerJobs.push({ resolve, reject });
                }),
            stats: () => ({ busyWorkers: 1, pendingTasks: 0 }),
            terminate: () => undefined,
        }),
    },
}));

describe("MapLayer property input handling", () => {
    it("uses the configured sentinel for undefined discrete array values", () => {
        expect(normalizeDiscreteProperties([1, Number.NaN, 3], 999)).toEqual([
            1, 999, 3,
        ]);
    });

    it("uses 0xFFFF as the default discrete sentinel", () => {
        expect(normalizeDiscreteProperties([1, Number.NaN], 0xffff)).toEqual([
            1, 0xffff,
        ]);
        expect(getUndefinedValueProperties([1, Number.NaN], true)).toBe(0xffff);
    });

    it("keeps typed discrete input unchanged", () => {
        const properties = new Uint16Array([1, 2]);

        expect(normalizeDiscreteProperties(properties, 999)).toBe(properties);
        expect(getUndefinedValueProperties(properties, true)).toBe(0xffff);
    });

    it("uses NaN as the continuous floating-point sentinel", () => {
        expect(
            getUndefinedValueProperties(new Float32Array(), false)
        ).toBeNaN();
    });
});

describe("resampleMesh", () => {
    it("adds a row and column and averages neighboring mesh values", () => {
        const frame: MapFrame = {
            origin: [0, 0],
            increment: [1, 1],
            count: [2, 2],
        };

        // The function expands a node grid by one in each direction,
        // shifts the origin by half an increment, and averages neighboring
        // mesh values. A small 2×2 input gives a clear discriminating check
        // for both the updated frame and the resulting 3×3 values.
        const [resampledFrame, resampledMesh] = resampleMesh(
            frame,
            new Float32Array([1, 2, 3, 4])
        );

        expect(resampledFrame).toEqual({
            origin: [-0.5, -0.5],
            increment: [1, 1],
            count: [3, 3],
        });
        expect(Array.from(resampledMesh)).toEqual([
            /*eslint-disable */
            1, 1.5, 2, 2, 2.5, 3, 3, 3.5, 4,
            /*eslint-enable */
        ]);
    });
});

describe("MapLayer rebuild lifecycle", () => {
    const frame: MapFrame = {
        origin: [0, 0],
        count: [2, 2],
        increment: [1, 1],
        rotDeg: 0,
    };

    const makeData = (value: number) =>
        new Float32Array([value, value, value, value]);

    // Result of the mesh web worker, tagged in the first position value.
    const makeWorkerResult = (tag: number) => [
        new Float32Array([tag, 0, 0, 1, 0, 0, 0, 1, 0]),
        new Float32Array(9),
        new Uint32Array([0, 1, 2]),
        new Float32Array(3),
        new Uint32Array([0, 1]),
        [1, 2],
        [0, 1],
    ];

    const flushPromises = () =>
        new Promise((resolve) => setTimeout(resolve, 0));

    function setup() {
        mockWorkerJobs.length = 0;
        const reportBoundingBox = jest.fn();
        const layerManager = new LayerManager(null as never, {});

        const setProps = async (data: number, colorMapName: string) => {
            layerManager.setLayers([
                new MapLayer({
                    id: "map",
                    frame,
                    meshData: makeData(data),
                    propertiesData: makeData(data),
                    colorMapName,
                    reportBoundingBox,
                }),
            ]);
            await flushPromises();
        };

        const getSubLayerProps = () => {
            layerManager.updateLayers();
            const layer = layerManager
                .getLayers()
                .find((layer) => layer.id === "map") as MapLayer;
            return layer.getSubLayers()[0]?.props as unknown as
                | { colormapName: string; positions: Float32Array }
                | undefined;
        };

        const settlePendingJobs = async (tag: number) => {
            mockWorkerJobs
                .splice(0)
                .forEach((job) => job.resolve(makeWorkerResult(tag)));
            await flushPromises();
            // deck.gl updates the layers on each animation frame.
            layerManager.updateLayers();
        };

        return {
            reportBoundingBox,
            setProps,
            getSubLayerProps,
            settlePendingJobs,
        };
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("reports its bounding box once when mounted", async () => {
        const { reportBoundingBox, setProps, settlePendingJobs } = setup();

        await setProps(1, "A");
        await settlePendingJobs(1);

        expect(reportBoundingBox).toHaveBeenCalledTimes(1);
        expect(reportBoundingBox).toHaveBeenCalledWith({
            layerBoundingBox: [0, 0, -1, 1, 1, -2],
        });
    });

    it("swaps geometry and colormap together once the rebuild is done", async () => {
        const { setProps, getSubLayerProps, settlePendingJobs } = setup();
        await setProps(1, "A");
        expect(getSubLayerProps()).toBeUndefined();
        await settlePendingJobs(1);

        await setProps(2, "B");

        expect(getSubLayerProps()?.colormapName).toBe("A");
        expect(getSubLayerProps()?.positions[0]).toBe(1);

        await settlePendingJobs(2);

        expect(getSubLayerProps()?.colormapName).toBe("B");
        expect(getSubLayerProps()?.positions[0]).toBe(2);
    });

    it("discards the result of a superseded rebuild", async () => {
        const { setProps, getSubLayerProps, settlePendingJobs } = setup();
        await setProps(1, "A");
        await settlePendingJobs(1);

        await setProps(2, "A");
        await setProps(3, "A");
        const [supersededJob, latestJob] = mockWorkerJobs.splice(0);

        supersededJob.resolve(makeWorkerResult(2));
        await flushPromises();
        expect(getSubLayerProps()?.positions[0]).toBe(1);

        latestJob.resolve(makeWorkerResult(3));
        await flushPromises();
        expect(getSubLayerProps()?.positions[0]).toBe(3);
    });

    it("keeps applying prop changes after a failed rebuild", async () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const { setProps, getSubLayerProps, settlePendingJobs } = setup();
        await setProps(1, "A");
        await settlePendingJobs(1);

        await setProps(2, "A");
        mockWorkerJobs
            .splice(0)
            .forEach((job) => job.reject(new Error("worker failed")));
        await flushPromises();
        await setProps(2, "B");

        expect(consoleError).toHaveBeenCalled();
        expect(getSubLayerProps()?.colormapName).toBe("B");
    });
});
