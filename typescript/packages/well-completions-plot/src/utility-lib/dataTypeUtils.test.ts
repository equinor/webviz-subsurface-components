import {
    areCompletionsPlotDataValuesEqual,
    extractSubzones,
    populateSubzonesArray,
} from "./dataTypeUtils";
import type { CompletionPlotData, Zone } from "../types/dataTypes";

describe("areCompletionsPlotDataValuesEqual", () => {
    const mockData: CompletionPlotData = {
        zoneIndex: 0,
        open: 1,
        shut: 0,
        khMean: 10,
        khMin: 5,
        khMax: 15,
    };
    it("should return true for equal CompletionPlotData objects", () => {
        const data2: CompletionPlotData = { ...mockData };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(true);
    });

    it("should return false for CompletionPlotData objects with different open values", () => {
        const data2: CompletionPlotData = { ...mockData, open: 0 };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(false);
    });

    it("should return false for CompletionPlotData objects with different shut values", () => {
        const data2: CompletionPlotData = { ...mockData, shut: 1 };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(false);
    });

    it("should return false for CompletionPlotData objects with different khMean values", () => {
        const data2: CompletionPlotData = { ...mockData, khMean: 15 };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(false);
    });

    it("should return false for CompletionPlotData objects with different khMin values", () => {
        const data2: CompletionPlotData = { ...mockData, khMin: 10 };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(false);
    });

    it("should return false for CompletionPlotData objects with different khMax values", () => {
        const data2: CompletionPlotData = { ...mockData, khMax: 20 };

        expect(areCompletionsPlotDataValuesEqual(mockData, data2)).toBe(false);
    });
});

describe("extractSubzones", () => {
    it("should return an empty array if the zone is undefined", () => {
        expect(extractSubzones(undefined)).toEqual([]);
    });

    it("should return the zone itself if it has no subzones", () => {
        const zone: Zone = { name: "zone1", color: "color1", subzones: [] };
        expect(extractSubzones(zone)).toEqual([zone]);
    });

    it("should return all subzones if the zone has subzones", () => {
        const subzone1: Zone = {
            name: "subzone1",
            color: "color1.1",
            subzones: [],
        };
        const subzone2: Zone = {
            name: "subzone2",
            color: "color1.2",
            subzones: [],
        };
        const zone: Zone = {
            name: "zone1",
            color: "color1",
            subzones: [subzone1, subzone2],
        };
        expect(extractSubzones(zone)).toEqual([subzone1, subzone2]);
    });

    it("should return all leaf subzones in a nested structure", () => {
        const leaf1: Zone = {
            name: "leaf1",
            color: "color1.1.1",
            subzones: [],
        };
        const leaf2: Zone = {
            name: "leaf2",
            color: "color1.1.2",
            subzones: [],
        };
        const subzone: Zone = {
            name: "subzone",
            color: "color1.1",
            subzones: [leaf1, leaf2],
        };
        const zone: Zone = {
            name: "zone",
            color: "color1",
            subzones: [subzone],
        };
        expect(extractSubzones(zone)).toEqual([leaf1, leaf2]);
    });
});

describe("populateSubzonesArray", () => {
    it("should not modify the array if the zone is undefined", () => {
        const subzonesArray: Zone[] = [];
        populateSubzonesArray(undefined, subzonesArray);
        expect(subzonesArray).toEqual([]);
    });

    it("should add the zone itself to the array if it has no subzones", () => {
        const zone: Zone = { name: "zone1", color: "color1", subzones: [] };
        const subzonesArray: Zone[] = [];
        populateSubzonesArray(zone, subzonesArray);
        expect(subzonesArray).toEqual([zone]);
    });

    it("should add all subzones to the array if the zone has subzones", () => {
        const subzone1: Zone = {
            name: "subzone1",
            color: "color1.1",
            subzones: [],
        };
        const subzone2: Zone = {
            name: "subzone2",
            color: "color1.2",
            subzones: [],
        };
        const zone: Zone = {
            name: "zone1",
            color: "color1",
            subzones: [subzone1, subzone2],
        };
        const subzonesArray: Zone[] = [];
        populateSubzonesArray(zone, subzonesArray);
        expect(subzonesArray).toEqual([subzone1, subzone2]);
    });

    it("should add all leaf subzones in a nested structure to the array", () => {
        const leaf1: Zone = {
            name: "leaf1",
            color: "color1.1.1",
            subzones: [],
        };
        const leaf2: Zone = {
            name: "leaf2",
            color: "color1.1.2",
            subzones: [],
        };
        const subzone: Zone = {
            name: "subzone",
            color: "color1.1",
            subzones: [leaf1, leaf2],
        };
        const zone: Zone = {
            name: "zone",
            color: "color1",
            subzones: [subzone],
        };
        const subzonesArray: Zone[] = [];
        populateSubzonesArray(zone, subzonesArray);
        expect(subzonesArray).toEqual([leaf1, leaf2]);
    });
});
