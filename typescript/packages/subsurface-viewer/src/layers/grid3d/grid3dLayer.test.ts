import "jest";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { LayerManager } from "@deck.gl/core";
import type { CompositeLayer, Layer } from "@deck.gl/core";

import Grid3DLayer from "./grid3dLayer";

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

describe("Grid3DLayer rebuild lifecycle", () => {
    const workerResult = [
        {
            attributes: {
                positions: { value: new Float32Array(9), size: 3 },
            },
            vertexCount: 3,
        },
        { attributes: {}, vertexCount: 0 },
        [0, 1],
    ];

    const flushPromises = () =>
        new Promise((resolve) => setTimeout(resolve, 0));

    function setup() {
        mockWorkerJobs.length = 0;
        const reportBoundingBox = jest.fn();
        const layerManager = new LayerManager(null as never, {});

        const setProps = async (z: number, colorMapName: string) => {
            const layer = new Grid3DLayer({
                id: "grid",
                pointsData: new Float32Array([0, 0, z, 1, 0, z, 0, 2, z]),
                polysData: new Uint32Array([3, 0, 1, 2]),
                propertiesData: new Float32Array([1]),
                colorMapName,
                reportBoundingBox,
            });
            layerManager.setLayers([layer as unknown as Layer]);
            await flushPromises();
        };

        const getSubLayerProps = () => {
            layerManager.updateLayers();
            const layer = layerManager
                .getLayers()
                .find((layer) => layer.id === "grid") as CompositeLayer;
            return layer.getSubLayers()[0]?.props as unknown as
                | { colormapName: string }
                | undefined;
        };

        const settlePendingJobs = async () => {
            mockWorkerJobs
                .splice(0)
                .forEach((job) => job.resolve(workerResult));
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

        await setProps(5, "A");
        await settlePendingJobs();

        expect(reportBoundingBox).toHaveBeenCalledTimes(1);
        expect(reportBoundingBox).toHaveBeenCalledWith({
            layerBoundingBox: [0, 0, 5, 1, 2, 5],
        });
    });

    it("does not draw a first mesh that was superseded before it was drawn", async () => {
        const { setProps, getSubLayerProps, settlePendingJobs } = setup();
        await setProps(5, "A");
        // The rebuild completes, but deck.gl has not updated the layers yet.
        mockWorkerJobs.splice(0).forEach((job) => job.resolve(workerResult));
        await flushPromises();

        await setProps(6, "B");
        expect(getSubLayerProps()).toBeUndefined();

        await settlePendingJobs();
        expect(getSubLayerProps()?.colormapName).toBe("B");
    });

    it("keeps applying prop changes after a failed rebuild", async () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const { setProps, getSubLayerProps, settlePendingJobs } = setup();
        await setProps(5, "A");
        await settlePendingJobs();

        await setProps(6, "A");
        mockWorkerJobs
            .splice(0)
            .forEach((job) => job.reject(new Error("worker failed")));
        await flushPromises();
        await setProps(6, "B");

        expect(consoleError).toHaveBeenCalled();
        expect(getSubLayerProps()?.colormapName).toBe("B");
    });
});
