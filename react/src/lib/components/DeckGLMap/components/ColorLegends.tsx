import React from "react";
import { ExtendedLayer } from "../layers/utils/layerTools";
import ColorLegend from "./ColorLegend";

interface ColorLegendsProps {
    // Pass additional css style to the parent color legend container
    cssStyle?: Record<string, unknown> | null;
    horizontal?: boolean | null;
    layers: ExtendedLayer<unknown>[];
}

// Todo: Adapt it for other layers too
const ColorLegends: React.FC<ColorLegendsProps> = ({
    cssStyle,
    horizontal,
    layers,
}: ColorLegendsProps) => {
    if (layers.length == 0) return null;
    return (
        <div
            style={{
                position: "absolute",
                display: "flex",
                zIndex: 999,
                ...cssStyle,
            }}
        >
            {layers.map((layer, index) => (
                <ColorLegend
                    layer={layer}
                    horizontal={horizontal}
                    key={index}
                />
            ))}
        </div>
    );
};

export default ColorLegends;
