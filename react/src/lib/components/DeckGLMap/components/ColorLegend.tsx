import React, { ReactElement } from "react";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { ExtendedLayer } from "../layers/utils/layerTools";
import { RGBAColor } from "@deck.gl/core/utils/color";

interface LegendBaseData {
    title: string;
    colorName: string;
    discrete: boolean;
}
export interface DiscreteLegendDataType extends LegendBaseData {
    metadata: Record<string, [RGBAColor, number]>;
}

export interface ContinuousLegendDataType extends LegendBaseData {
    valueRange: [number, number];
}

interface ColorLegendProps {
    // Pass additional css style to the parent color legend container
    cssStyle?: Record<string, unknown> | null;
    horizontal?: boolean | null;
    layers: ExtendedLayer<unknown>[];
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
                        const dld =
                            layer.getLegendData?.() as DiscreteLegendDataType;
                        items.push(
                            <div style={{ marginTop: 30 }} key={index}>
                                <DiscreteColorLegend
                                    discreteData={dld.metadata}
                                    dataObjectName={dld.title}
                                    colorName={dld.colorName}
                                    horizontal={horizontal}
                                />
                            </div>
                        );
                    } else {
                        const cld =
                            layer.getLegendData?.() as ContinuousLegendDataType;
                        items.push(
                            <div style={{ marginTop: 30 }} key={index}>
                                <ContinuousLegend
                                    min={cld.valueRange[0]}
                                    max={cld.valueRange[1]}
                                    dataObjectName={cld.title}
                                    colorName={cld.colorName}
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
