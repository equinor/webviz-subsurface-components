import { DatedTrees } from "../src/types";

/**
 * This is example data based on the Group Tree data in `group-tree.json`-file found in the `example-data`-folder.
 *
 * This is converted to .ts file to obtain type safety.
 */
export const exampleDatedTrees: DatedTrees = [
    {
        dates: ["2018-02-01", "2018-03-01"],
        tree: {
            node_label: "TRE_1",
            node_type: "Group",
            node_data: {
                pressure: [5, 10],
            },
            edge_label: "VFP10",
            edge_data: {
                waterrate: [10, 10],
                oilrate: [10, 10],
                gasrate: [10, 10],
                waterinjrate: [10, 10],
                gasinjrate: [10, 10],
            },
            children: [
                {
                    node_label: "TRE_1_1",
                    node_type: "Well",
                    node_data: {
                        pressure: [20, 30],
                        bhp: [11, 10],
                        wmctl: [12, 10],
                    },
                    edge_label: "VFP11",
                    edge_data: {
                        waterrate: [20, 30],
                        oilrate: [30, 40],
                        gasrate: [40, 50],
                        waterinjrate: [50, 60],
                        gasinjrate: [60, 70],
                    },
                },
                {
                    node_label: "TRE_1_2",
                    node_type: "Well",
                    node_data: {
                        pressure: [22, 30],
                        wmctl: [10, 10],
                    },
                    edge_label: "VFP12",
                    edge_data: {
                        waterrate: [25, 35],
                        oilrate: [35, 45],
                        gasrate: [45, 55],
                        waterinjrate: [55, 65],
                        gasinjrate: [65, 75],
                    },
                },
            ],
        },
    },

    {
        dates: ["2019-02-01", "2019-03-01"],
        tree: {
            node_label: "TRE_1",
            node_type: "Group",
            node_data: {
                pressure: [5, 10],
            },
            edge_label: "VFP10",
            edge_data: {
                waterrate: [10, 10],
                oilrate: [10, 10],
                gasrate: [10, 10],
                waterinjrate: [10, 10],
                gasinjrate: [10, 10],
            },
            children: [
                {
                    node_label: "TRE_1_1",
                    node_type: "Well",
                    node_data: {
                        pressure: [20, 30],
                        bhp: [10, 10],
                        wmctl: [10, 10],
                    },
                    edge_label: "VFP11",
                    edge_data: {
                        waterrate: [20, 30],
                        oilrate: [30, 40],
                        gasrate: [40, 50],
                        waterinjrate: [50, 60],
                        gasinjrate: [60, 70],
                    },
                    children: [
                        {
                            node_label: "TRE_1_1_1",
                            node_type: "Well",
                            node_data: {
                                pressure: [20, 30],
                                bhp: [10, 10],
                                wmctl: [10, 10],
                            },
                            edge_label: "VFP12",
                            edge_data: {
                                waterrate: [20, 30],
                                oilrate: [30, 40],
                                gasrate: [40, 50],
                                waterinjrate: [50, 60],
                                gasinjrate: [60, 70],
                            },
                        },
                        {
                            node_label: "TRE_1_1_2",
                            node_type: "Well",
                            node_data: {
                                pressure: [20, 30],
                                bhp: [10, 10],
                                wmctl: [10, 10],
                            },
                            edge_label: "VFP13",
                            edge_data: {
                                waterrate: [20, 30],
                                oilrate: [30, 40],
                                gasrate: [40, 50],
                                waterinjrate: [50, 60],
                                gasinjrate: [60, 70],
                            },
                        },
                    ],
                },
                {
                    node_label: "TRE_1_2",
                    node_type: "Well",
                    node_data: {
                        pressure: [20, 30],
                        bhp: [10, 10],
                        wmctl: [10, 10],
                    },
                    edge_label: "VFP14",
                    edge_data: {
                        waterrate: [20, 30],
                        oilrate: [30, 40],
                        gasrate: [40, 50],
                        waterinjrate: [50, 60],
                        gasinjrate: [60, 70],
                    },
                },
            ],
        },
    },
];
