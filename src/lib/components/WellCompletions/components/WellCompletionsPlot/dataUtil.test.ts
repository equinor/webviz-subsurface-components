import { dataInTimeIndexRange } from "./dataUtil";

describe("Feature Toggles", () => {
    const testStratigraphy = [
        {
            name: "zone1",
            color: "#c9f",
        },
        {
            name: "zone2",
            color: "#a9b",
        },
        {
            name: "zone3",
            color: "#fde",
        },
        {
            name: "zone4",
            color: "#c9e",
        },
        {
            name: "zone5",
            color: "#dde",
        },
        {
            name: "zone6",
            color: "#f8d",
        },
        {
            name: "zone7",
            color: "#9dc",
        },
        {
            name: "zone8",
            color: "#cce",
        },
        {
            name: "zone9",
            color: "#bdd",
        },
        {
            name: "zone10",
            color: "#8ea",
        },
        {
            name: "zone11",
            color: "#ded",
        },
        {
            name: "zone12",
            color: "#eb9",
        },
        {
            name: "zone13",
            color: "#bdf",
        },
        {
            name: "zone14",
            color: "#aca",
        },
    ];
    const testData = {
        stratigraphy: testStratigraphy,
        wells: [
            {
                name: "RWI_3",
                completions: {
                    zone1: {
                        t: [5],
                        f: [1.0],
                    },
                    zone2: {
                        t: [5],
                        f: [1.0],
                    },
                    zone3: {
                        t: [5],
                        f: [1.0],
                    },
                    zone4: {
                        t: [5],
                        f: [1.0],
                    },
                    zone5: {
                        t: [5],
                        f: [1.0],
                    },
                    zone6: {
                        t: [5],
                        f: [1.0],
                    },
                    zone7: {
                        t: [5],
                        f: [1.0],
                    },
                    zone8: {
                        t: [5],
                        f: [1.0],
                    },
                    zone9: {
                        t: [5],
                        f: [1.0],
                    },
                    zone10: {
                        t: [5],
                        f: [1.0],
                    },
                    zone11: {
                        t: [5],
                        f: [1.0],
                    },
                    zone12: {
                        t: [5],
                        f: [1.0],
                    },
                    zone13: {
                        t: [5],
                        f: [1.0],
                    },
                    zone14: {
                        t: [5],
                        f: [1.0],
                    },
                },
                type: "Producer",
                region: "Region1",
            },
        ],
        timeSteps: [],
    };
    it("test dataInTimeIndexRange", () => {
        expect(dataInTimeIndexRange(testData, [0, 0])).toEqual([
            {
                name: "RWI_3",
                completions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
        ]);
        expect(dataInTimeIndexRange(testData, [6, 6])).toEqual([
            {
                name: "RWI_3",
                completions: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            },
        ]);
    });
});
