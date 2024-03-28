/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import type { ExtendedLayer } from "../layers/utils/layerTools";
import type { Color } from "@deck.gl/core/typed";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import type { colorMapFunctionType } from "../layers/utils/layerTools";

interface LegendBaseData {
    title: string;
    colorName: string;
    discrete: boolean;
    colorMapFunction?: colorMapFunctionType;
}
export interface DiscreteLegendDataType extends LegendBaseData {
    metadata: Record<string, [Color, number]>;
}

export interface ContinuousLegendDataType extends LegendBaseData {
    valueRange: [number, number];
}

interface ColorLegendProps {
    horizontal?: boolean | null;
    layer: ExtendedLayer;
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
        const legend_data = layer.getLegendData?.() ?? layer.state?.["legend"];
        setLegendData(legend_data);
    }, [layer.props, layer.state?.["legend"]]);

    if (!legendData || !layer.props.visible) return null;

    return (
        <div style={{ marginTop: 30 }}>
            {legendData.discrete && (
                <DiscreteColorLegend
                    discreteData={
                        (legendData as DiscreteLegendDataType).metadata
                    }
                    dataObjectName={legendData.title}
                    colorName={legendData.colorName}
                    horizontal={horizontal}
                    colorTables={colorTables}
                />
            )}
            {!legendData.discrete && (
                <ContinuousLegend
                    min={(legendData as ContinuousLegendDataType).valueRange[0]}
                    max={(legendData as ContinuousLegendDataType).valueRange[1]}
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
