import "jest";
import type { AccessorContext, ChangeFlags } from "@deck.gl/core";

import { getFromAccessor, hasUpdateTriggerChanged } from "./layerTools";

describe("layerTools", () => {
    describe("getFromAccessor", () => {
        const mockData = { name: "Foo", value: 100 };
        const mockContext = { index: 0 } as AccessorContext<typeof mockData>;

        it("should return static value when accessor is not a function", () => {
            const staticAccessor = 42;

            const result = getFromAccessor(
                staticAccessor,
                mockData,
                mockContext
            );

            expect(result).toBe(42);
        });

        it("should call accessor function with data and objectInfo", () => {
            const accessorFn = jest.fn((data: typeof mockData) => {
                return data.value * 2;
            });

            const result = getFromAccessor(accessorFn, mockData, mockContext);

            expect(accessorFn).toHaveBeenCalledWith(mockData, mockContext);
            expect(result).toBe(200);
        });
    });

    describe("hasUpdateTriggerChanged", () => {
        it("should return false when updateTriggersChanged is undefined", () => {
            // @ts-expect-error -- mock for testing
            const changeFlags: ChangeFlags = {};
            const result = hasUpdateTriggerChanged(changeFlags, "myTrigger");
            expect(result).toBe(false);
        });

        it("should return false when updateTriggersChanged is false", () => {
            // @ts-expect-error -- mock for testing
            const changeFlags: ChangeFlags = {
                updateTriggersChanged: false,
            };

            const result = hasUpdateTriggerChanged(changeFlags, "myTrigger");

            expect(result).toBe(false);
        });

        it("should return false when trigger is not in updateTriggersChanged", () => {
            // @ts-expect-error -- mock for testing
            const changeFlags: ChangeFlags = {
                updateTriggersChanged: {
                    otherTrigger: true,
                },
            };

            const result = hasUpdateTriggerChanged(changeFlags, "myTrigger");

            expect(result).toBe(false);
        });

        it("should return true when trigger is flagged as changed", () => {
            // @ts-expect-error -- mock for testing
            const changeFlags: ChangeFlags = {
                updateTriggersChanged: {
                    myTrigger: true,
                },
            };

            const result = hasUpdateTriggerChanged(changeFlags, "myTrigger");

            expect(result).toBe(true);
        });

        it("should handle multiple triggers correctly", () => {
            // @ts-expect-error -- mock for testing
            const changeFlags: ChangeFlags = {
                updateTriggersChanged: {
                    trigger1: true,
                    trigger3: true,
                },
            };

            expect(hasUpdateTriggerChanged(changeFlags, "trigger1")).toBe(true);
            expect(hasUpdateTriggerChanged(changeFlags, "trigger2")).toBe(
                false
            );
            expect(hasUpdateTriggerChanged(changeFlags, "trigger3")).toBe(true);
        });
    });
});
