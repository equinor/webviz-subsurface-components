/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import type { Color } from "@deck.gl/core";

import type { colorTablesArray } from "@emerson-eps/color-tables";
import {
    DiscreteCodes,
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";

import type { ExtendedLegendLayer } from "../layers/utils/layerTools";
import type { ColormapFunctionType } from "../layers/utils/colormapTools";

interface LegendBaseData {
    title: string;
    colorName: string;
    discrete: boolean;
    colorMapFunction?: ColormapFunctionType;
}
export interface DiscreteLegendDataType extends LegendBaseData {
    metadata: Record<string, [Color, number]>;
}

export interface ContinuousLegendDataType extends LegendBaseData {
    valueRange: [number, number];
}

/**
 * Type guard function that determines if the legend data is discrete or continuous.
 * Narrows the type of the data parameter to DiscreteLegendDataType when it returns true.
 * 
 * @param data - The legend data to check, can be either discrete or continuous type
 * @returns True if the data is of discrete type, false otherwise
 */
function isDiscrete(
    data: DiscreteLegendDataType | ContinuousLegendDataType
): data is DiscreteLegendDataType {
    return data.discrete;
}

function toDiscreteCodes(data: DiscreteLegendDataType): DiscreteCodes {
    return data.metadata as DiscreteCodes;
}

interface ColorLegendProps {
    horizontal?: boolean | null;
    layer: ExtendedLegendLayer;
    colorTables: colorTablesArray | string | undefined;
    reverseRange?: boolean;
}

const ColorLegend: React.FC<ColorLegendProps> = ({
    horizontal,
    layer,
    colorTables,
    reverseRange,
}: ColorLegendProps) => {
    const [legendData, setLegendData] = React.useState<
        DiscreteLegendDataType | ContinuousLegendDataType
    >();
    React.useEffect(() => {
        const legend_data =
            layer.getLegendData?.() ??
            (layer.state?.["legend"] as
                | DiscreteLegendDataType
                | ContinuousLegendDataType);
        setLegendData(legend_data);
    }, [layer.props, layer.state?.["legend"]]);

    if (!legendData || !layer.props.visible) return null;

    return (
        <div style={{ marginTop: 30 }}>
            {isDiscrete(legendData) && (
                <DiscreteColorLegend
                    discreteData={toDiscreteCodes(legendData)}
                    dataObjectName={legendData.title}
                    colorName={legendData.colorName}
                    horizontal={horizontal}
                    colorTables={colorTables}
                />
            )}
            {!isDiscrete(legendData) && (
                <ContinuousLegend
                    min={legendData.valueRange[0]}
                    max={legendData.valueRange[1]}
                    dataObjectName={legendData.title}
                    colorName={legendData.colorName}
                    horizontal={horizontal}
                    id={layer.props.id}
                    colorTables={colorTables}
                    colorMapFunction={legendData.colorMapFunction}
                    reverseRange={reverseRange}
                />
            )}
        </div>
    );
};

export default ColorLegend;
