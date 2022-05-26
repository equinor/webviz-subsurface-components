import React from "react";
import { Layer } from "deck.gl";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface ColorLegendProps {
    position?: number[] | null;
    horizontal?: boolean | null;
    layers: Layer<unknown>[];
    colorTables: colorTablesArray;
}

// Todo: Adapt it for other layers too
const ColorLegend: React.FC<ColorLegendProps> = ({
    position,
    horizontal,
    layers,
}: ColorLegendProps) => {
    return (
        <div
            style={{
                position: "absolute",
                display: "flex",
                right: position ? position[0] : " ",
                top: position ? position[1] : " ",
                zIndex: 999,
            }}
        >
            {layers.map(
                (layer, index) =>
                    layer?.props?.visible &&
                    layer?.state?.legend?.[0] && (
                        <div>
                            {layer?.state?.legend?.[0].discrete && (
                                <DiscreteColorLegend
                                    discreteData={
                                        layer.state.legend?.[0].metadata
                                    }
                                    dataObjectName={
                                        layer.state.legend?.[0].title
                                    }
                                    colorName={
                                        layer.state.legend?.[0].colorName
                                    }
                                    position={position}
                                    horizontal={horizontal}
                                    key={index}
                                />
                            )}
                            {layer?.state?.legend?.[0].valueRange?.length > 0 &&
                                layer?.state?.legend?.[0] && (
                                    <ContinuousLegend
                                        min={
                                            layer.state.legend?.[0]
                                                .valueRange[0]
                                        }
                                        max={
                                            layer.state.legend?.[0]
                                                .valueRange[1]
                                        }
                                        dataObjectName={
                                            layer.state.legend?.[0].title
                                        }
                                        colorName={
                                            layer.state.legend?.[0].colorName
                                        }
                                        position={position}
                                        horizontal={horizontal}
                                        key={index}
                                    />
                                )}
                        </div>
                    )
            )}
        </div>
    );
};

ColorLegend.defaultProps = {
    position: [5, 10],
    horizontal: false,
};

export default ColorLegend;
