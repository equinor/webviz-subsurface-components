import React, { useState } from "react";
import { forwardRef, useImperativeHandle } from "react";
import type { DeckMetrics } from "../SubsurfaceViewer";

export const Metrics = forwardRef((_props, ref) => {
    const [metrics, setMetrics] = useState<DeckMetrics>();

    const publicRef = {
        updateMetrics: (m: DeckMetrics) => {
            setMetrics({ ...m });
        },
    };

    useImperativeHandle(ref, () => publicRef);

    const isDefined = typeof metrics === "object";
    if (!isDefined) {
        return null;
    }

    const tableRows = [];
    for (const key in metrics) {
        if (Object.prototype.hasOwnProperty.call(metrics, key)) {
            const typedKey = key as keyof DeckMetrics;
            tableRows.push(
                <tr key={typedKey}>
                    <td> {typedKey} </td>
                    <td> {metrics[typedKey]?.toFixed(1)} </td>
                </tr>
            );
        }
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "right",
                position: "absolute",
                top: "10px",
                right: "30px",
                zIndex: 200,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
        >
            <table>
                <tbody>
                    <tr>
                        <th align="left"> {"Metrics"} </th>
                    </tr>
                    {tableRows}
                </tbody>
            </table>
        </div>
    );
});

Metrics.displayName = "MetricsComponent";
export default Metrics;
