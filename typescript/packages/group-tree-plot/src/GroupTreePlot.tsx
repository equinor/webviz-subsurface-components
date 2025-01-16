import React from "react";
import _ from "lodash";

import "./group_tree.css";

import type { DatedTree, EdgeMetadata, NodeMetadata } from "./types";
import { TreePlotRenderer } from "./components/TreePlotRenderer";
import { PlotErrorOverlay } from "./components/PlotErrorOverlay";
import {
    useDataAssembler,
    useUpdateAssemblerDate,
} from "./utils/dataAssembler";

export const TREE_TRANSITION_DURATION = 200;

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
    // References to handle resizing
    const svgRootRef = React.useRef<SVGSVGElement | null>(null);
    const [svgHeight, setSvgHeight] = React.useState<number>(0);
    const [svgWidth, setSvgWidth] = React.useState<number>(0);

    const [dataAssembler, initError] = useDataAssembler(
        props.datedTrees,
        props.edgeMetadataList,
        props.nodeMetadataList
    );

    const dateUpdateError = useUpdateAssemblerDate(
        dataAssembler,
        props.selectedDateTime
    );

    const errorToPrint = initError ?? dateUpdateError;

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

        // Cleanup on unmount
        return () => {
            debouncedResizeObserverCheck.cancel();
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <svg ref={svgRootRef} height="100%" width="100%">
            {dataAssembler && svgHeight && svgWidth && (
                <TreePlotRenderer
                    dataAssembler={dataAssembler}
                    primaryEdgeProperty={props.selectedEdgeKey}
                    primaryNodeProperty={props.selectedNodeKey}
                    width={svgWidth}
                    height={svgHeight}
                    initialVisibleDepth={props.initialVisibleDepth}
                />
            )}

            {errorToPrint && <PlotErrorOverlay message={errorToPrint} />}
        </svg>
    );
}

GroupTreePlot.displayName = "GroupTreePlot";
