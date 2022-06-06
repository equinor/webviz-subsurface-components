import React, { ReactElement } from "react";
import { Layer } from "deck.gl";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface ColorLegendProps {
    // Pass additional css style to the parent color legend container
    cssStyle?: Record<string, unknown> | null;
    horizontal?: boolean | null;
    layers: Layer<unknown>[];
    colorTables: colorTablesArray;
}

// Todo: Adapt it for other layers too
const ColorLegend: React.FC<ColorLegendProps> = ({
    cssStyle,
    horizontal,
    layers,
}: ColorLegendProps) => {
    function Legend() {
        const items: ReactElement[] = [];
        layers.map((layer, index) => {
            if (layer.props.visible) {
                const legend_data = layer.getLegendData?.();
                if (legend_data) {
                    if (legend_data.discrete) {
                        items.push(
                            <div style={{ marginTop: 30 }} key={index}>
                                <DiscreteColorLegend
                                    discreteData={legend_data.metadata}
                                    dataObjectName={legend_data.title}
                                    colorName={legend_data.colorName}
                                    horizontal={horizontal}
                                />
                            </div>
                        );
                    } else {
                        items.push(
                            <div style={{ marginTop: 30 }} key={index}>
                                <ContinuousLegend
                                    min={legend_data.valueRange[0]}
                                    max={legend_data.valueRange[1]}
                                    dataObjectName={legend_data.title}
                                    colorName={legend_data.colorName}
                                    horizontal={horizontal}
                                    id={layer?.props?.id}
                                />
                            </div>
                        );
                    }
                }
            }
        });
        return (
            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    zIndex: 999,
                    ...cssStyle,
                }}
            >
                {items}
            </div>
        );
    }

    return <Legend />;
};

export default ColorLegend;
