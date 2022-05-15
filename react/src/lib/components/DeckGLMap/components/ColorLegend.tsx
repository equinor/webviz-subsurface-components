import React from "react";
import { Layer } from "deck.gl";
import { WellsLayer } from "../layers";
import {
    DiscreteColorLegend,
    ContinuousLegend,
} from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { getLayersByType } from "../layers/utils/layerTools";

interface ColorLegendProps {
    position?: number[] | null;
    horizontal?: boolean | null;
    layers: Layer<unknown>[] | any;
    colorTables: colorTablesArray;
}

// Todo: Adapt it for other layers too
const ColorLegend: React.FC<ColorLegendProps> = ({
    position,
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

    //layers will have entries of unique type only
    const wellsLayer = React.useMemo(
        () => getLayersByType(layers, "WellsLayer")?.[0] as WellsLayer,
        [layers]
    );

    // Get color table for log curves.
    React.useEffect(() => {
        // needed else throw error
        if (!layers || !wellsLayer?.isLoaded) return;
        const getLegendData: any = [];
        layers.map((layer: any) => {
            if (layer.id == "wells-layer") {
                getLegendData.push({
                    title: layer?.state?.legend[0].title,
                    colorName: layer?.props?.logColor,
                    discrete: layer?.state?.legend[0].discrete,
                    metadata: layer?.state?.legend[0].metadata,
                    valueRange: layer?.state?.legend[0].valueRange,
                    visible: layer?.props?.visible,
                });
            }
            if (layer.id == "colormap-layer") {
                getLegendData.push({
                    title: "colorMapLayer",
                    colorName: layer?.props?.colorMapName,
                    discrete: false,
                    metadata: { objects: {} },
                    valueRange: [0, 1],
                    visible: layer?.props?.visible,
                });
            }
        });
        setLegendProps(getLegendData);
    }, [layers, wellsLayer?.isLoaded]);

    return (
        <div
            // className="flex-container" style={{display: "flex"}}
            style={{
                position: "absolute",
                right: position ? position[0] : " ",
                top: position ? position[1] : " ",
                zIndex: 999,
            }}
        >
            {legendProps.map(
                (legend) =>
                    legend.visible && (
                        <div>
                            {legend.discrete && (
                                <DiscreteColorLegend
                                    discreteData={legend.metadata}
                                    dataObjectName={legend.title}
                                    colorName={legend.colorName}
                                    position={position}
                                    horizontal={horizontal}
                                />
                            )}
                            {legend.valueRange?.length > 0 && legend && (
                                <ContinuousLegend
                                    min={legend.valueRange[0]}
                                    max={legend.valueRange[1]}
                                    dataObjectName={legend.title}
                                    colorName={legend.colorName}
                                    position={position}
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
    position: [5, 10],
    horizontal: false,
};

export default ColorLegend;
