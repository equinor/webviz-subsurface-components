import type { DatedTree, EdgeMetadata, NodeMetadata } from "../src/types";

/**
 * Test data for the interactive storybook example.
 *
 * This creates two tree type scenarios:
 * 1. "Single Tree Definition" - One tree structure valid for all dates
 * 2. "Multiple Tree Definitions" - Different tree structure per date
 */

const allDates = [
    "2020-01-01",
    "2020-04-01",
    "2020-07-01",
    "2020-10-01",
    "2021-01-01",
    "2021-04-01",
    "2021-07-01",
    "2021-10-01",
];

// Metadata that applies to both tree types
export const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate", unit: "m3/day" },
    { key: "oilrate", label: "Oil Rate", unit: "m3/day" },
    { key: "gasrate", label: "Gas Rate", unit: "m3/day" },
];

export const nodeMetadataList: NodeMetadata[] = [
    { key: "pressure", label: "Pressure", unit: "bar" },
    { key: "bhp", label: "BHP", unit: "bar" },
];

// Tree Type 1: Single Tree Definition (one tree valid for all dates)
// Data reflects the same timeline as Multiple Tree Definitions:
// - Q1 2020 (indices 0-1): Only WELL_A1 active
// - Q2-Q3 2020 (indices 2-3): WELL_A2 comes online
// - Q4 2020-Q1 2021 (indices 4-5): PLATFORM_B with WELL_B1 comes online
// - Q2-Q3 2021 (indices 6-7): Full field
export const singleTreeDefinition: DatedTree[] = [
    {
        dates: allDates,
        tree: {
            node_label: "FIELD",
            node_type: "Group",
            node_data: {
                pressure: [20, 22, 24, 26, 28, 30, 32, 34],
            },
            edge_label: "",
            edge_data: {
                waterrate: [0, 0, 0, 0, 0, 0, 0, 0],
                oilrate: [0, 0, 0, 0, 0, 0, 0, 0],
                gasrate: [0, 0, 0, 0, 0, 0, 0, 0],
            },
            children: [
                {
                    node_label: "PLATFORM_A",
                    node_type: "Group",
                    node_data: {
                        // Pressure present from start
                        pressure: [18, 20, 22, 24, 26, 28, 30, 32],
                    },
                    edge_label: "Pipeline_1",
                    edge_data: {
                        // Only WELL_A1 in Q1 2020, WELL_A2 adds from Q2 2020
                        waterrate: [50, 52, 110, 115, 120, 125, 130, 135],
                        oilrate: [250, 260, 540, 560, 580, 600, 620, 640],
                        gasrate: [500, 525, 1100, 1150, 1200, 1250, 1300, 1350],
                    },
                    children: [
                        {
                            node_label: "WELL_A1",
                            node_type: "Well",
                            node_data: {
                                // Active from start
                                pressure: [16, 18, 20, 22, 24, 26, 28, 30],
                                bhp: [150, 155, 160, 165, 170, 175, 180, 185],
                            },
                            edge_label: "Flowline_A1",
                            edge_data: {
                                // Active from start
                                waterrate: [50, 52, 54, 56, 58, 60, 62, 64],
                                oilrate: [250, 260, 270, 280, 290, 300, 310, 320],
                                gasrate: [500, 525, 550, 575, 600, 625, 650, 675],
                            },
                        },
                        {
                            node_label: "WELL_A2",
                            node_type: "Well",
                            node_data: {
                                // Not active in Q1 2020, comes online Q2 2020
                                pressure: [0, 0, 20, 22, 24, 26, 28, 30],
                                bhp: [0, 0, 158, 163, 168, 173, 178, 183],
                            },
                            edge_label: "Flowline_A2",
                            edge_data: {
                                // Not active in Q1 2020, comes online Q2 2020
                                waterrate: [0, 0, 56, 59, 62, 65, 68, 71],
                                oilrate: [0, 0, 270, 280, 290, 300, 310, 320],
                                gasrate: [0, 0, 550, 575, 600, 625, 650, 675],
                            },
                        },
                    ],
                },
                {
                    node_label: "PLATFORM_B",
                    node_type: "Group",
                    node_data: {
                        // Not active until Q4 2020
                        pressure: [0, 0, 0, 0, 26, 28, 30, 32],
                    },
                    edge_label: "Pipeline_2",
                    edge_data: {
                        // Not active until Q4 2020
                        waterrate: [0, 0, 0, 0, 100, 105, 110, 115],
                        oilrate: [0, 0, 0, 0, 480, 500, 520, 540],
                        gasrate: [0, 0, 0, 0, 1000, 1050, 1100, 1150],
                    },
                    children: [
                        {
                            node_label: "WELL_B1",
                            node_type: "Well",
                            node_data: {
                                // Not active until Q4 2020
                                pressure: [0, 0, 0, 0, 24, 26, 28, 30],
                                bhp: [0, 0, 0, 0, 165, 170, 175, 180],
                            },
                            edge_label: "Flowline_B1",
                            edge_data: {
                                // Not active until Q4 2020
                                waterrate: [0, 0, 0, 0, 100, 105, 110, 115],
                                oilrate: [0, 0, 0, 0, 480, 500, 520, 540],
                                gasrate: [0, 0, 0, 0, 1000, 1050, 1100, 1150],
                            },
                        },
                    ],
                },
            ],
        },
    },
];

// Tree Type 2: Multiple Tree Definitions (different tree structure per date)
// The tree structure changes over time (wells get added/removed)
export const multipleTreeDefinitions: DatedTree[] = [
    // Q1 2020: Only WELL_A1 is active
    {
        dates: ["2020-01-01", "2020-04-01"],
        tree: {
            node_label: "FIELD",
            node_type: "Group",
            node_data: {
                pressure: [20, 22],
            },
            edge_label: "",
            edge_data: {
                waterrate: [0, 0],
                oilrate: [0, 0],
                gasrate: [0, 0],
            },
            children: [
                {
                    node_label: "PLATFORM_A",
                    node_type: "Group",
                    node_data: {
                        pressure: [18, 20],
                    },
                    edge_label: "Pipeline_1",
                    edge_data: {
                        waterrate: [50, 52],
                        oilrate: [250, 260],
                        gasrate: [500, 525],
                    },
                    children: [
                        {
                            node_label: "WELL_A1",
                            node_type: "Well",
                            node_data: {
                                pressure: [16, 18],
                                bhp: [150, 155],
                            },
                            edge_label: "Flowline_A1",
                            edge_data: {
                                waterrate: [50, 52],
                                oilrate: [250, 260],
                                gasrate: [500, 525],
                            },
                        },
                    ],
                },
            ],
        },
    },
    // Q2-Q3 2020: WELL_A2 comes online
    {
        dates: ["2020-07-01", "2020-10-01"],
        tree: {
            node_label: "FIELD",
            node_type: "Group",
            node_data: {
                pressure: [24, 26],
            },
            edge_label: "",
            edge_data: {
                waterrate: [0, 0],
                oilrate: [0, 0],
                gasrate: [0, 0],
            },
            children: [
                {
                    node_label: "PLATFORM_A",
                    node_type: "Group",
                    node_data: {
                        pressure: [22, 24],
                    },
                    edge_label: "Pipeline_1",
                    edge_data: {
                        waterrate: [110, 115],
                        oilrate: [540, 560],
                        gasrate: [1100, 1150],
                    },
                    children: [
                        {
                            node_label: "WELL_A1",
                            node_type: "Well",
                            node_data: {
                                pressure: [20, 22],
                                bhp: [160, 165],
                            },
                            edge_label: "Flowline_A1",
                            edge_data: {
                                waterrate: [54, 56],
                                oilrate: [270, 280],
                                gasrate: [550, 575],
                            },
                        },
                        {
                            node_label: "WELL_A2",
                            node_type: "Well",
                            node_data: {
                                pressure: [20, 22],
                                bhp: [158, 163],
                            },
                            edge_label: "Flowline_A2",
                            edge_data: {
                                waterrate: [56, 59],
                                oilrate: [270, 280],
                                gasrate: [550, 575],
                            },
                        },
                    ],
                },
            ],
        },
    },
    // Q4 2020 - Q1 2021: PLATFORM_B comes online
    {
        dates: ["2021-01-01", "2021-04-01"],
        tree: {
            node_label: "FIELD",
            node_type: "Group",
            node_data: {
                pressure: [28, 30],
            },
            edge_label: "",
            edge_data: {
                waterrate: [0, 0],
                oilrate: [0, 0],
                gasrate: [0, 0],
            },
            children: [
                {
                    node_label: "PLATFORM_A",
                    node_type: "Group",
                    node_data: {
                        pressure: [26, 28],
                    },
                    edge_label: "Pipeline_1",
                    edge_data: {
                        waterrate: [120, 125],
                        oilrate: [580, 600],
                        gasrate: [1200, 1250],
                    },
                    children: [
                        {
                            node_label: "WELL_A1",
                            node_type: "Well",
                            node_data: {
                                pressure: [24, 26],
                                bhp: [170, 175],
                            },
                            edge_label: "Flowline_A1",
                            edge_data: {
                                waterrate: [58, 60],
                                oilrate: [290, 300],
                                gasrate: [600, 625],
                            },
                        },
                        {
                            node_label: "WELL_A2",
                            node_type: "Well",
                            node_data: {
                                pressure: [24, 26],
                                bhp: [168, 173],
                            },
                            edge_label: "Flowline_A2",
                            edge_data: {
                                waterrate: [62, 65],
                                oilrate: [290, 300],
                                gasrate: [600, 625],
                            },
                        },
                    ],
                },
                {
                    node_label: "PLATFORM_B",
                    node_type: "Group",
                    node_data: {
                        pressure: [26, 28],
                    },
                    edge_label: "Pipeline_2",
                    edge_data: {
                        waterrate: [100, 105],
                        oilrate: [480, 500],
                        gasrate: [1000, 1050],
                    },
                    children: [
                        {
                            node_label: "WELL_B1",
                            node_type: "Well",
                            node_data: {
                                pressure: [24, 26],
                                bhp: [165, 170],
                            },
                            edge_label: "Flowline_B1",
                            edge_data: {
                                waterrate: [100, 105],
                                oilrate: [480, 500],
                                gasrate: [1000, 1050],
                            },
                        },
                    ],
                },
            ],
        },
    },
    // Q2-Q3 2021: Full field with all wells
    {
        dates: ["2021-07-01", "2021-10-01"],
        tree: {
            node_label: "FIELD",
            node_type: "Group",
            node_data: {
                pressure: [32, 34],
            },
            edge_label: "",
            edge_data: {
                waterrate: [0, 0],
                oilrate: [0, 0],
                gasrate: [0, 0],
            },
            children: [
                {
                    node_label: "PLATFORM_A",
                    node_type: "Group",
                    node_data: {
                        pressure: [30, 32],
                    },
                    edge_label: "Pipeline_1",
                    edge_data: {
                        waterrate: [130, 135],
                        oilrate: [620, 640],
                        gasrate: [1300, 1350],
                    },
                    children: [
                        {
                            node_label: "WELL_A1",
                            node_type: "Well",
                            node_data: {
                                pressure: [28, 30],
                                bhp: [180, 185],
                            },
                            edge_label: "Flowline_A1",
                            edge_data: {
                                waterrate: [62, 64],
                                oilrate: [310, 320],
                                gasrate: [650, 675],
                            },
                        },
                        {
                            node_label: "WELL_A2",
                            node_type: "Well",
                            node_data: {
                                pressure: [28, 30],
                                bhp: [178, 183],
                            },
                            edge_label: "Flowline_A2",
                            edge_data: {
                                waterrate: [68, 71],
                                oilrate: [310, 320],
                                gasrate: [650, 675],
                            },
                        },
                    ],
                },
                {
                    node_label: "PLATFORM_B",
                    node_type: "Group",
                    node_data: {
                        pressure: [30, 32],
                    },
                    edge_label: "Pipeline_2",
                    edge_data: {
                        waterrate: [110, 115],
                        oilrate: [520, 540],
                        gasrate: [1100, 1150],
                    },
                    children: [
                        {
                            node_label: "WELL_B1",
                            node_type: "Well",
                            node_data: {
                                pressure: [28, 30],
                                bhp: [175, 180],
                            },
                            edge_label: "Flowline_B1",
                            edge_data: {
                                waterrate: [110, 115],
                                oilrate: [520, 540],
                                gasrate: [1100, 1150],
                            },
                        },
                    ],
                },
            ],
        },
    },
];

// Export tree type configurations
export interface TreeTypeConfig {
    name: string;
    description: string;
    datedTrees: DatedTree[];
}

export const treeTypes: TreeTypeConfig[] = [
    {
        name: "Single Tree Definition",
        description: "1 tree structure valid for all 8 dates (data changes, structure stays the same)",
        datedTrees: singleTreeDefinition,
    },
    {
        name: "Multiple Tree Definitions",
        description: "4 tree structures, each valid for 2 dates (new wells/platforms appear over time)",
        datedTrees: multipleTreeDefinitions,
    },
];

// Export all unique dates across both tree types
export const allTestDates = allDates;
