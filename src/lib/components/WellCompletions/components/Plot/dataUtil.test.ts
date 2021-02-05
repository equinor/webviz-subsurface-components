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
    const testWells = [
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
                    t: [1, 2, 5],
                    f: [1.0, 0.125, 0],
                },
                zone7: {
                    t: [1, 2, 5],
                    f: [1.0, 0.125, 0],
                },
                zone8: {
                    t: [5],
                    f: [1.0],
                },
                zone9: {
                    t: [3],
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
    ];
    it("test dataInTimeIndexRange", () => {
        //Display single time step
        expect(
            dataInTimeIndexRange(
                testStratigraphy,
                testWells,
                [0, 0],
                "First Step",
                false
            )
        ).toEqual({
            stratigraphy: testStratigraphy,
            wells: [
                {
                    name: "RWI_3",
                    completions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                },
            ],
        });
        //Well with zero completions is filtered out
        expect(
            dataInTimeIndexRange(
                testStratigraphy,
                testWells,
                [0, 0],
                "First Step",
                true
            )
        ).toEqual({
            stratigraphy: testStratigraphy,
            wells: [],
        });
        //Display range first step
        expect(
            dataInTimeIndexRange(
                testStratigraphy,
                testWells,
                [2, 6],
                "First Step",
                false
            )
        ).toEqual({
            stratigraphy: testStratigraphy,
            wells: [
                {
                    name: "RWI_3",
                    completions: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0.125,
                        0.125,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                    ],
                },
            ],
        });
        //Display range average
        expect(
            dataInTimeIndexRange(
                testStratigraphy,
                testWells,
                [2, 6],
                "First Step",
                false
            )
        ).toEqual({
            stratigraphy: testStratigraphy,
            wells: [
                {
                    name: "RWI_3",
                    completions: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0.125,
                        0.125,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                    ],
                },
            ],
        });
        //with filtered stratigraphy
        const filteredStratigraphy = testStratigraphy.slice(2, 5);
        expect(
            dataInTimeIndexRange(
                filteredStratigraphy,
                testWells,
                [2, 6],
                "Max",
                false
            )
        ).toEqual({
            stratigraphy: filteredStratigraphy,
            wells: [
                {
                    name: "RWI_3",
                    completions: [1, 1, 1],
                },
            ],
        });
    });
});
