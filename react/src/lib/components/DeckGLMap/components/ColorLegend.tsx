import React from "react";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import { ExtendedLayer } from "../layers/utils/layerTools";
import { Color } from "@deck.gl/core/typed";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { colorMapFunctionType } from "../layers/utils/layerTools";

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
    layer: ExtendedLayer<unknown>;
    colorTables: colorTablesArray | string | undefined;
    invertLegend?: boolean;
}

const ColorLegend: React.FC<ColorLegendProps> = ({
    horizontal,
    layer,
    colorTables,
    invertLegend,
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
                    invertLegend={invertLegend}
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
                    invertLegend={invertLegend}
                />
            )}
        </div>
    );
};

export default ColorLegend;
