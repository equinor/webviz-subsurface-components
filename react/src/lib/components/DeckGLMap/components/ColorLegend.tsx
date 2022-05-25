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
    const [legendProps, setLegendProps] = React.useState<
        [
            {
                title: string;
                colorName: string;
                discrete: boolean;
                metadata: { objects: Record<string, [number[], number]> };
                valueRange: number[];
                visible: boolean;
            }
        ]
    >([
        {
            title: "",
            colorName: "string",
            discrete: false,
            metadata: { objects: {} },
            valueRange: [],
            visible: true,
        },
    ]);

    // Get color table for log curves.
    React.useEffect(() => {
        if (!layers) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getLegendData: any = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers.map((layer: any) => {
            if (
                layer?.id == "wells-layer" &&
                layer?.isLoaded &&
                Object.keys(layer?.state).length > 0
            ) {
                getLegendData.push({
                    title: layer?.state?.legend[0].title,
                    colorName: layer?.props?.logColor,
                    discrete: layer?.state?.legend[0].discrete,
                    metadata: layer?.state?.legend[0].metadata,
                    valueRange: layer?.state?.legend[0].valueRange,
                    visible: layer?.props?.visible,
                });
            }
            if (
                layer?.id == "colormap-layer" &&
                layer?.isLoaded &&
                Object.keys(layer?.state).length > 0
            ) {
                const min = layer?.state.model.uniforms.colorMapRangeMin;
                const max = layer?.state.model.uniforms.colorMapRangeMax;
                getLegendData.push({
                    title: layer?.props?.name,
                    colorName: layer?.props?.colorMapName,
                    discrete: false,
                    metadata: { objects: {} },
                    valueRange: [min, max],
                    visible: layer?.props?.visible,
                });
            }
        });
        setLegendProps(getLegendData);
    }, [layers]);

    return (
        <div
            style={{
                position: "absolute",
                display: "flex",
                zIndex: 999,
                ...cssStyle,
            }}
        >
            {legendProps.map(
                (legend, index) =>
                    legend.visible && (
                        <div key={index}>
                            {legend.discrete && (
                                <DiscreteColorLegend
                                    discreteData={legend.metadata}
                                    dataObjectName={legend.title}
                                    colorName={legend.colorName}
                                    horizontal={horizontal}
                                />
                            )}
                            {legend.valueRange?.length > 0 && legend && (
                                <ContinuousLegend
                                    min={legend.valueRange[0]}
                                    max={legend.valueRange[1]}
                                    dataObjectName={legend.title}
                                    colorName={legend.colorName}
                                    horizontal={horizontal}
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
