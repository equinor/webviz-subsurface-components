import "jest";

import { describe, expect, it, afterEach } from "@jest/globals";

import { computePrecision } from "./precisionForTests-shaders-glsl";

describe("computePrecision", () => {
    const originalProcess = (globalThis as { process?: unknown }).process;

    afterEach(() => {
        (globalThis as { process?: unknown }).process = originalProcess;
    });

    it("does not throw when process is undefined (browser-like environment)", () => {
        (globalThis as { process?: unknown }).process = undefined;
        expect(() => computePrecision()).not.toThrow();
    });

    it("selects PROD_PRECISION when process is undefined", () => {
        (globalThis as { process?: unknown }).process = undefined;
        expect(computePrecision()).toBe("");
    });

    it("selects PROD_PRECISION when no relevant env vars are set", () => {
        (globalThis as { process?: { env: Record<string, string> } }).process =
            { env: {} };
        expect(computePrecision()).toBe("");
    });

    it("selects TEST_PRECISION when NODE_ENV is not production", () => {
        (
            globalThis as {
                process?: { env: Record<string, string> };
            }
        ).process = { env: { NODE_ENV: "test" } };
        expect(computePrecision()).toContain("precision highp float");
    });

    it("selects PROD_PRECISION when NODE_ENV is production", () => {
        (
            globalThis as {
                process?: { env: Record<string, string> };
            }
        ).process = { env: { NODE_ENV: "production" } };
        expect(computePrecision()).toBe("");
    });
});
