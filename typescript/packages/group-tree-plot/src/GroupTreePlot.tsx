import React from "react";
import _ from "lodash";

import type { DatedTree, EdgeMetadata, NodeMetadata } from "./types";
import TreePlotRenderer from "./TreePlotRenderer/index";
import { PlotErrorOverlay } from "./PlotErrorOverlay";
import { type DataAssembler, useDataAssembler } from "./utils/DataAssembler";

export interface GroupTreePlotProps {
    id: string;
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    datedTrees: DatedTree[];
    selectedEdgeKey: string;
    selectedNodeKey: string;
    selectedDateTime: string;

    initialVisibleDepth?: number;
}

export function GroupTreePlot(props: GroupTreePlotProps): React.ReactNode {
    let errorMsg = "";

    // References to handle resizing
    const svgRootRef = React.useRef<SVGSVGElement | null>(null);
    const [svgHeight, setSvgHeight] = React.useState<number>(0);
    const [svgWidth, setSvgWidth] = React.useState<number>(0);

    // Data update props
    const [prevDate, setPrevDate] = React.useState<string | null>(null);

    // Storing a copy of the last successfully assembeled data to render when data becomes invalid
    const lastValidDataAssembler = React.useRef<DataAssembler | null>(null);

    const dataAssembler = useDataAssembler(
        props.datedTrees,
        props.edgeMetadataList,
        props.nodeMetadataList
    );

    if (dataAssembler === null) {
        errorMsg = "Invalid data for assembler";
    } else if (dataAssembler !== lastValidDataAssembler.current) {
        lastValidDataAssembler.current = dataAssembler;
    }

    if (dataAssembler && props.selectedDateTime !== prevDate) {
        try {
            dataAssembler.setActiveDate(props.selectedDateTime);
            setPrevDate(props.selectedDateTime);
        } catch (error) {
            errorMsg = (error as Error).message;
        }
    }

    // Mount hook
    React.useEffect(function setupResizeObserver() {
        if (!svgRootRef.current) throw new Error("Expected root ref to be set");

        const svgElement = svgRootRef.current;

        // Debounce to avoid excessive re-renders
        const debouncedResizeObserverCheck = _.debounce<ResizeObserverCallback>(
            function debouncedResizeObserverCheck(entries) {
                if (!Array.isArray(entries)) return;
                if (!entries.length) return;

                const entry = entries[0];

                setSvgWidth(entry.contentRect.width);
                setSvgHeight(entry.contentRect.height);
            },
            100
        );

        // Since the debounce will delay calling the setters, we call them early now
        setSvgHeight(svgElement.getBoundingClientRect().height);
        setSvgWidth(svgElement.getBoundingClientRect().width);

        // Set up a resize-observer to check for svg size changes
        const resizeObserver = new ResizeObserver(debouncedResizeObserverCheck);
        resizeObserver.observe(svgElement);

        // Unsubscribe on unmount
        return () => resizeObserver.unobserve(svgElement);
    }, []);

    return (
        <svg ref={svgRootRef} height={"100%"} width={"100%"}>
            {lastValidDataAssembler.current && svgHeight && svgWidth && (
                <TreePlotRenderer
                    dataAssembler={lastValidDataAssembler.current}
                    primaryEdgeProperty={props.selectedEdgeKey}
                    primaryNodeProperty={props.selectedNodeKey}
                    width={svgWidth}
                    height={svgHeight}
                    initialVisibleDepth={props.initialVisibleDepth}
                />
            )}

            {errorMsg && <PlotErrorOverlay message={errorMsg} />}
        </svg>
    );
}

GroupTreePlot.displayName = "GroupTreePlot";
