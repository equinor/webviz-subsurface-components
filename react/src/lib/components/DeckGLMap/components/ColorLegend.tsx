import React from "react";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
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
    horizontal?: boolean | null;
    layer: ExtendedLayer<unknown>;
}

const ColorLegend: React.FC<ColorLegendProps> = ({
    horizontal,
    layer,
}: ColorLegendProps) => {
    const [legendData, setLegendData] = React.useState<
        DiscreteLegendDataType | ContinuousLegendDataType
    >();
    React.useEffect(() => {
        const legend_data = layer.getLegendData?.() ?? layer.state?.legend;
        setLegendData(legend_data);
    }, [layer.props, layer.state?.legend]);

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
                />
            )}
        </div>
    );
};

export default ColorLegend;
