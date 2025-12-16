import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { GroupTreePlot } from "../GroupTreePlot";

import {
    treeTypes,
    edgeMetadataList,
    nodeMetadataList,
    allTestDates,
} from "../../example-data/interactive-test-data";

const meta: Meta = {
    component: GroupTreePlot,
    title: "GroupTreePlot/Interactive Demo",
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

/**
 * Interactive storybook example with time slider and tree type dropdown.
 *
 * This story demonstrates the bug fix for switching between tree types:
 * - "Single Tree Definition": One tree valid for all dates (static structure with changing data)
 * - "Multiple Tree Definitions": Different tree structures over time (wells get added)
 *
 * Test functionality:
 * 1. Move the slider to a later date (e.g., 2021-07-01)
 * 2. Switch tree types
 * 3. Verify the tree shows the correct date (not the first date)
 */
export const InteractiveWithTreeTypeSwitch: Story = {
    render: () => {
        const [treeTypeIndex, setTreeTypeIndex] = React.useState(0);
        const [dateIndex, setDateIndex] = React.useState(0);
        const [selectedEdgeKey, setSelectedEdgeKey] = React.useState(
            edgeMetadataList[0]?.key || ""
        );
        const [selectedNodeKey, setSelectedNodeKey] = React.useState(
            nodeMetadataList[0]?.key || ""
        );

        const currentTreeType = treeTypes[treeTypeIndex];
        const currentDate = allTestDates[dateIndex] || "";

        // Update date index when tree type changes to maintain same date
        React.useEffect(() => {
            // Try to maintain the same date when switching tree types
            const currentDateString = allTestDates[dateIndex];

            // Since both tree types use the same dates, we can keep the same index
            // This maintains the selected date across tree type switches
        }, [treeTypeIndex]);

        return (
            <div style={{ padding: "20px" }}>
                <div
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    {/* Tree Type Dropdown */}
                    <div>
                        <label
                            htmlFor="tree-type-select"
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                            }}
                        >
                            Tree Type:
                        </label>
                        <select
                            id="tree-type-select"
                            value={treeTypeIndex}
                            onChange={(e) =>
                                setTreeTypeIndex(parseInt(e.target.value))
                            }
                            style={{
                                padding: "8px",
                                fontSize: "14px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                width: "400px",
                            }}
                        >
                            {treeTypes.map((type, index) => (
                                <option key={index} value={index}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "5px",
                            }}
                        >
                            {currentTreeType.description}
                        </div>
                    </div>

                    {/* Date Slider */}
                    <div>
                        <label
                            htmlFor="date-slider"
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                            }}
                        >
                            Selected Date: {currentDate}
                        </label>
                        <input
                            id="date-slider"
                            type="range"
                            min="0"
                            max={allTestDates.length - 1}
                            value={dateIndex}
                            onChange={(e) =>
                                setDateIndex(parseInt(e.target.value))
                            }
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "12px",
                                color: "#666",
                                maxWidth: "600px",
                            }}
                        >
                            <span>{allTestDates[0]}</span>
                            <span>{allTestDates[allTestDates.length - 1]}</span>
                        </div>
                    </div>

                    {/* Edge Metadata Dropdown */}
                    <div>
                        <label
                            htmlFor="edge-key-select"
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                            }}
                        >
                            Edge Metric:
                        </label>
                        <select
                            id="edge-key-select"
                            value={selectedEdgeKey}
                            onChange={(e) => setSelectedEdgeKey(e.target.value)}
                            style={{
                                padding: "8px",
                                fontSize: "14px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                width: "300px",
                            }}
                        >
                            {edgeMetadataList.map((meta) => (
                                <option key={meta.key} value={meta.key}>
                                    {meta.label} ({meta.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Node Metadata Dropdown */}
                    <div>
                        <label
                            htmlFor="node-key-select"
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                            }}
                        >
                            Node Metric:
                        </label>
                        <select
                            id="node-key-select"
                            value={selectedNodeKey}
                            onChange={(e) => setSelectedNodeKey(e.target.value)}
                            style={{
                                padding: "8px",
                                fontSize: "14px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                width: "300px",
                            }}
                        >
                            {nodeMetadataList.map((meta) => (
                                <option key={meta.key} value={meta.key}>
                                    {meta.label} ({meta.unit})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* GroupTreePlot Component */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "10px",
                        height: "700px",
                        width: "100%",
                    }}
                >
                    <GroupTreePlot
                        id="interactive-grouptreeplot"
                        datedTrees={currentTreeType.datedTrees}
                        edgeMetadataList={edgeMetadataList}
                        nodeMetadataList={nodeMetadataList}
                        selectedDateTime={currentDate}
                        selectedEdgeKey={selectedEdgeKey}
                        selectedNodeKey={selectedNodeKey}
                    />
                </div>
            </div>
        );
    },
};
