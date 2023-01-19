import React from "react";
import { ExtendedLayer } from "../layers/utils/layerTools";
import ColorLegend from "./ColorLegend";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface ColorLegendsProps {
    // Pass additional css style to the parent color legend container
    cssStyle?: Record<string, unknown> | null;
    horizontal?: boolean | null;
    layers: ExtendedLayer<unknown>[];
    colorTables: colorTablesArray | string | undefined;
    reverseRange?: boolean;
}

// Todo: Adapt it for other layers too
const ColorLegends: React.FC<ColorLegendsProps> = ({
    cssStyle,
    horizontal,
    layers,
    colorTables,
    reverseRange,
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
                    colorTables={colorTables}
                    reverseRange={reverseRange}
                />
            ))}
        </div>
    );
};

export default ColorLegends;
