import React from "react";
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
    return (
        <div
            style={{
                position: "absolute",
                display: "flex",
                zIndex: 999,
                ...cssStyle,
            }}
        >
            {layers.map(
                (layer, index) =>
                    layer?.props?.visible &&
                    layer?.state?.legend && (
                        <div style={{ marginTop: 30 }} key={index}>
                            {layer?.state?.legend?.discrete && (
                                <DiscreteColorLegend
                                    discreteData={layer.state.legend?.metadata}
                                    dataObjectName={layer.state.legend?.title}
                                    colorName={layer.state.legend?.colorName}
                                    horizontal={horizontal}
                                />
                            )}
                            {layer?.state?.legend?.valueRange?.length > 0 &&
                                layer?.state?.legend && (
                                    <ContinuousLegend
                                        min={layer.state.legend?.valueRange[0]}
                                        max={layer.state.legend?.valueRange[1]}
                                        dataObjectName={
                                            layer.state.legend?.title
                                        }
                                        colorName={
                                            layer.state.legend?.colorName
                                        }
                                        horizontal={horizontal}
                                        id={layer?.props?.id}
                                    />
                                )}
                        </div>
                    )
            )}
        </div>
    );
};

ColorLegend.defaultProps = {
    horizontal: false,
};

export default ColorLegend;
