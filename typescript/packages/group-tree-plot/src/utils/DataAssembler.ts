import * as d3 from "d3";

import type {
    DatedTree,
    EdgeData,
    EdgeMetadata,
    NodeData,
    NodeMetadata,
} from "../types";
import _ from "lodash";
import { printTreeValue } from "./treePlot";
import React from "react";

/**
 * Utility class to assemble and combine data for one or more dated flow network trees.
 * The instance allows setting an active date, and provides methods to get data and labels pertaining to the given date
 */
export class DataAssembler {
    datedTrees: DatedTree[];
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];

    private _propertyToLabelMap: Map<string, [label?: string, unit?: string]>;
    private _propertyMaxVals: Map<string, number>;

    private _currentTreeIndex = 0;
    private _currentDateIndex = 0;

    /**
     * @param datedTrees A list of dated tree objects. List cannot be empty
     * @param edgeMetadataList A list of labels and units to use when representing values from tree edges
     * @param nodeMetadataList A list of labels and units to use when representing values from tree nodes
     * @throws Throws if dated tree list is empty
     */
    constructor(
        datedTrees: DatedTree[],
        edgeMetadataList: EdgeMetadata[],
        nodeMetadataList: NodeMetadata[]
    ) {
        // Guard - Require at least one tree to be given.
        if (!datedTrees.length) throw new Error("Tree-list is empty");

        this.datedTrees = datedTrees;

        this.edgeMetadataList = edgeMetadataList;
        this.nodeMetadataList = nodeMetadataList;

        this._propertyToLabelMap = new Map();
        [...edgeMetadataList, ...nodeMetadataList].forEach((elm) => {
            this._propertyToLabelMap.set(elm.key, [elm.label, elm.unit]);
        });

        this._propertyMaxVals = new Map();
        this.datedTrees.forEach(({ tree }) => {
            // Utilizing d3 to iterate over each child node from our tree-root
            d3.hierarchy(tree, (d) => d.children).each((node) => {
                const { edge_data } = node.data;

                Object.entries(edge_data).forEach(([key, vals]) => {
                    const existingMax =
                        this._propertyMaxVals.get(key) ?? Number.MIN_VALUE;

                    const newMax = Math.max(...vals, existingMax);

                    this._propertyMaxVals.set(key, newMax);
                });
            });
        });
    }

    /**
     * Changes the active date for the instance. Raises if date is invalid
     * @param newDate A date string, formatted as YYYY-MM-DD (eg. 2001-01-30)
     * @throws Will throw if the date is invalid, or if no tree uses the given date
     */
    setActiveDate(newDate: string) {
        const [newTreeIdx, newDateIdx] = findTreeAndDateIndex(
            newDate,
            this.datedTrees
        );

        // I do think these will always both be -1, or not -1, so checking both might be excessive
        if (newTreeIdx === -1 || newDateIdx === -1) {
            throw new Error("Invalid date for data assembler");
        }

        this._currentTreeIndex = newTreeIdx;
        this._currentDateIndex = newDateIdx;
    }

    /**
     * Gets the currently active tree
     * @returns A dated tree
     */
    getActiveTree(): DatedTree {
        return this.datedTrees[this._currentTreeIndex];
    }

    /**
     * Pretty-prints all values in the given object with labels and units added
     * @param data Data from a node or edge
     * @returns A formatted string presentation of the data value
     */
    getTooltip(data: NodeData | EdgeData): string {
        if (this._currentDateIndex === -1) return "";

        let text = "";

        for (const propName in data) {
            const [label, unit] = this.getPropertyInfo(propName);
            const value = this.getPropertyValue(data, propName);
            const valueString = printTreeValue(value);

            text += `${label}: ${valueString} ${unit}\n`;
        }

        return text.trimEnd();
    }

    /**
     * Gets a property's value at the currently active date
     * @param data Data from a node or edge
     * @param property A key for a property
     * @returns The value, if found
     */
    getPropertyValue(
        data: EdgeData | NodeData,
        property: string
    ): number | null {
        if (this._currentDateIndex === -1) return null;

        const value = data[property]?.[this._currentDateIndex];

        return value ?? null;
    }

    /**
     * Gets the label and unit strings for a given property
     * @param propertyKey The key for the property
     * @returns The label and unit for the property. If not found, label defaults to "", and unit defaults to "?"
     */
    getPropertyInfo(propertyKey: string): [label: string, unit: string] {
        const [label, unit] = this._propertyToLabelMap.get(propertyKey) ?? [];

        const sanitizedLabel = _.upperFirst(label ?? "");
        const sanitizedUnit = unit ?? "?";

        return [sanitizedLabel, sanitizedUnit];
    }

    /**
     * Returns a property's value to a normalized value between 2 and 100. A value of 0 will be returned as is.
     * Will also return 0 if no data is found
     * @param data Data object to take data from
     * @param property The property key to take from
     * @returns The normalized value.
     */
    normalizeValue(data: EdgeData | NodeData, property: string): number {
        const value = this.getPropertyValue(data, property) ?? 0;
        const maxVal = this._propertyMaxVals.get(property);

        // Don't normalize 0 or invalid properties
        if (!maxVal || value === 0) return 0;

        return d3.scaleLinear().domain([0, maxVal]).range([2, 100])(value);
    }
}

function findTreeAndDateIndex(
    targetDate: string,
    datedTrees: DatedTree[]
): [treeIndex: number, dateIndex: number] {
    // Using standard for loop so we can return early when we find a matching tree
    for (let treeIdx = 0; treeIdx < datedTrees.length; treeIdx++) {
        const datedTree = datedTrees[treeIdx];
        const dateIdx = datedTree.dates.findIndex(
            (date) => date === targetDate
        );

        if (dateIdx !== -1) {
            return [treeIdx, dateIdx];
        }
    }

    // No matching entry found
    return [-1, -1];
}
/**
 * Updates the active date in a data-assembler instance.
 * @param dataAssembler An instance of DataAssembler
 * @param targetDate A date string
 * @returns An error message, if the date was invalid
 */
export function useUpdateAssemblerDate(
    dataAssembler: DataAssembler | null,
    targetDate: string
): string | void {
    const [prevDate, setPrevDate] = React.useState<string | null>(null);
    const prevAssemblerRef = React.useRef<DataAssembler | null>(null);

    // Reset previous date if assembler instance changed
    if (dataAssembler !== prevAssemblerRef.current) {
        prevAssemblerRef.current = dataAssembler;
        setPrevDate(null);
    }

    if (!dataAssembler || targetDate === prevDate) return;

    try {
        dataAssembler.setActiveDate(targetDate);
        setPrevDate(targetDate);
    } catch (error) {
        return (error as Error).message;
    }
}

/**
 * Initializes a memoized data-assembler instance. Creates a new instance every time data changes, but returns the last valid instance if the new data is invalid.
 * @param datedTrees A list of dated trees. *Assumes all node labels are unique across all node types*
 * @param edgeMetadataList Dated metadata for each tree edge
 * @param nodeMetadataList Dated metadata for each tree node
 * @returns A data-assembler instance, and an error message (if the instance could not be created)
 */
export function useDataAssembler(
    datedTrees: DatedTree[],
    edgeMetadataList: EdgeMetadata[],
    nodeMetadataList: NodeMetadata[]
): [DataAssembler | null, string] {
    // Store a status message to track if data was valid
    let errorMsg = "";
    // Storing a copy of the last successfully assembled data to render when data becomes invalid
    const lastValidDataAssembler = React.useRef<DataAssembler | null>(null);

    const dataAssembler = React.useMemo(() => {
        if (datedTrees.length === 0) return null;

        const assembler = new DataAssembler(
            datedTrees,
            edgeMetadataList,
            nodeMetadataList
        );

        return assembler;
    }, [datedTrees, edgeMetadataList, nodeMetadataList]);

    if (dataAssembler === null) {
        errorMsg = "Invalid data for assembler";
    } else if (dataAssembler !== lastValidDataAssembler.current) {
        lastValidDataAssembler.current = dataAssembler;
    }

    return [lastValidDataAssembler.current, errorMsg];
}
