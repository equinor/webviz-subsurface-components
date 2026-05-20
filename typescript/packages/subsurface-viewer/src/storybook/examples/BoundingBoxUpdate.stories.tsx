import React from "react";
import { CompositeLayer } from "@deck.gl/core";
import type { BoundingBox3D } from "../../utils";
import type { Meta } from "@storybook/react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ScatterplotLayer } from "@deck.gl/layers";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/BoundingBoxUpdate",
} as Meta;

type Props = {
    id: string;
    data: { position: [number, number, number] }[];
    color?: [number, number, number];
    reportBoundingBox?: (action: { layerBoundingBox: BoundingBox3D }) => void;
};

export class BoundingBoxReportingScatterplotLayer extends CompositeLayer<Props> {
    static layerName = "BoundingBoxReportingScatterplotLayer";

    initializeState() {
        this.report();
    }

    updateState() {
        this.report();
    }

    report() {
        const { data, reportBoundingBox } = this.props;
        if (!reportBoundingBox || !data.length) return;

        const xs = data.map((d) => d.position[0]);
        const ys = data.map((d) => d.position[1]);
        const zs = data.map((d) => d.position[2] ?? 0);

        const radius = 10; // assuming getRadius always returns 10 meters

        const minX = Math.min(...xs) - radius;
        const maxX = Math.max(...xs) + radius;
        const minY = Math.min(...ys) - radius;
        const maxY = Math.max(...ys) + radius;
        const minZ = Math.min(...zs) - radius;
        const maxZ = Math.max(...zs) + radius;

        reportBoundingBox({
            layerBoundingBox: [minX, minY, minZ, maxX, maxY, maxZ],
        });
    }

    renderLayers() {
        return new ScatterplotLayer({
            id: `${this.props.id}-scatter`,
            data: this.props.data,
            getPosition: (d) => d.position,
            getRadius: 10,
            radiusUnits: "meters",
            getFillColor: this.props.color ?? [255, 100, 100],
        });
    }
}

export const BoundingBoxAdjustsOnAddRemoveLayers = () => {
    const [triggerHome, setTriggerHome] = React.useState(0);
    const [layers, setLayers] = React.useState(() => [
        new BoundingBoxReportingScatterplotLayer({
            id: "layer-a",
            data: [{ position: [0, 0, 0] }],
        }),
    ]);

    const toggleLayer = () => {
        setLayers((prev) => {
            const hasB = prev.some((l) => l.id === "layer-b");
            if (hasB) {
                return prev.filter((l) => l.id !== "layer-b");
            } else {
                return [
                    ...prev,
                    new BoundingBoxReportingScatterplotLayer({
                        id: "layer-b",
                        data: [{ position: [250, 250, 10] }],
                        color: [100, 255, 100],
                    }),
                ];
            }
        });
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "500px" }}>
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 100,
                }}
            >
                <button onClick={toggleLayer}>Toggle Layer B</button>
                <button onClick={() => setTriggerHome((x) => x + 1)}>
                    Trigger Home
                </button>
            </div>
            <SubsurfaceViewer
                id="bbox-toggle-map"
                layers={layers}
                triggerHome={triggerHome}
                views={{
                    layout: [1, 1],
                    viewports: [
                        {
                            id: "main",
                            show3D: true,
                            layerIds: layers.map((l) => l.id),
                        },
                    ],
                }}
            />
        </div>
    );
};
