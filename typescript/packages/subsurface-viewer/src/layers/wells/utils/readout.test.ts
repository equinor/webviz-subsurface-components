import "jest";
import type {
    PerforationProperties,
    ScreenProperties,
    WellFeature,
} from "../types";
import { createPerforationReadout, createScreenReadout } from "./readout";

describe("readout utilities", () => {
    const mockScreen: ScreenProperties = {
        name: "Screen-1",
        mdStart: 500,
        mdEnd: 600,
    };

    const mockPerforation: PerforationProperties = {
        name: "Perforation-1",
        status: "open",
        md: 750,
    };

    const mockWellFeature: WellFeature = {
        type: "Feature",
        geometry: {
            type: "GeometryCollection",
            geometries: [
                {
                    type: "LineString",
                    coordinates: [],
                },
            ],
        },
        properties: {
            name: "Well-1",
            color: [255, 0, 0],
            md: [[0, 1000]],
            screens: [],
        },
    };

    describe("createScreenReadout", () => {
        it("should return null when no screen is provided", () => {
            const result = createScreenReadout(undefined, mockWellFeature);
            expect(result).toBeNull();
        });

        it("should create correct readout object for a screen", () => {
            const result = createScreenReadout(mockScreen, mockWellFeature);
            expect(result).toEqual({
                name: "Screen Well-1",
                value: "Screen-1",
                color: [255, 0, 0],
            });
        });
    });

    describe("createPerforationReadout", () => {
        it("should return null when no perforation is provided", () => {
            const result = createPerforationReadout(undefined, mockWellFeature);
            expect(result).toBeNull();
        });

        it("should create correct readout object for a perforation", () => {
            const result = createPerforationReadout(
                mockPerforation,
                mockWellFeature
            );

            expect(result).toEqual({
                name: "Perforation-1",
                value: "open",
                color: [255, 0, 0],
            });
        });
    });
});
