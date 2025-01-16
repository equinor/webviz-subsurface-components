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

export class DataAssembler {
    datedTrees: DatedTree[];
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];

    private _propertyToLabelMap: Map<string, [label: string, unit: string]>;
    private _propertyMaxVals: Map<string, number>;

    private _currentTreeIndex = 0;
    private _currentDateIndex = 0;

    constructor(
        datedTrees: DatedTree[],
        edgeMetadataList: EdgeMetadata[],
        nodeMetadataList: NodeMetadata[]
    ) {
        // Guard - Require atleast one tree to be given.
        if (!datedTrees.length) throw new Error("Tree-list is empty");

        this.datedTrees = datedTrees;

        this.edgeMetadataList = edgeMetadataList;
        this.nodeMetadataList = nodeMetadataList;

        this._propertyToLabelMap = new Map();
        [...edgeMetadataList, ...nodeMetadataList].forEach((elm) => {
            this._propertyToLabelMap.set(elm.key, [
                elm.label ?? "",
                elm.unit ?? "",
            ]);
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

    setActiveDate(newDate: string) {
        const [newTreeIdx, newDateIdx] = findTreeAndDateIndex(
            newDate,
            this.datedTrees
        );

        // I do think these will always both be -1, or not -1, so checking both might be excessive
        if (newTreeIdx === -1 || newDateIdx == -1) {
            throw new Error("Invalid date for data assembler");
        }

        this._currentTreeIndex = newTreeIdx;
        this._currentDateIndex = newDateIdx;
    }

    getActiveTree(): DatedTree {
        return this.datedTrees[this._currentTreeIndex];
    }

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

    getPropertyValue(
        data: EdgeData | NodeData,
        property: string
    ): number | null {
        if (this._currentDateIndex === -1) return null;

        const value = data[property]?.[this._currentDateIndex];

        return value ?? null;
    }

    getPropertyInfo(propertyKey: string): [string, string] {
        const infos = this._propertyToLabelMap.get(propertyKey);
        const [label, unit] = infos ?? ["", ""];

        return [
            label !== "" ? label : _.upperFirst(propertyKey),
            unit !== "" ? unit : "?",
        ];
    }

    normalizeValue(property: string, value: number): number {
        const maxVal = this._propertyMaxVals.get(property);

        // Invalid property, return a default of 2
        if (!maxVal) return 2;

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

    if (!dataAssembler || targetDate === prevDate) return;

    try {
        dataAssembler.setActiveDate(targetDate);
        setPrevDate(targetDate);
    } catch (error) {
        return (error as Error).message;
    }
}

/**
 * Initializes a memoized data-assembler instance. Creates a new instance everytime data changes, but returns the last valid instance if the new data is invalid.
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
    // Storing a copy of the last successfully assembeled data to render when data becomes invalid
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
