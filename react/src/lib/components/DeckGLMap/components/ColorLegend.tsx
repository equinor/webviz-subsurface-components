import React from "react";
import { Layer } from "deck.gl";
import { WellsLayer } from "../layers";
import {
    ContinuousLegend,
    DiscreteColorLegend,
} from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import { getLayersByType } from "../layers/utils/layerTools";

interface ColorLegendProps {
    visible?: boolean | null;
    position?: number[] | null;
    horizontal?: boolean | null;
    layers: Layer<unknown>[];
    colorTables: colorTablesArray;
}

// Todo: Adapt it for other layers too
const ColorLegend: React.FC<ColorLegendProps> = ({
    visible,
    position,
    horizontal,
    layers,
    colorTables,
}: ColorLegendProps) => {
    const [legendProps, setLegendProps] = React.useState<{
        title: string;
        name: string;
        colorName: string;
        discrete: boolean;
        metadata: { objects: Record<string, [number[], number]> };
        valueRange: number[];
    }>({
        title: "",
        name: "string",
        colorName: "string",
        discrete: false,
        metadata: { objects: {} },
        valueRange: [],
    });

    // layers will have entries of unique type only
    const wellsLayer = React.useMemo(
        () => getLayersByType(layers, "WellsLayer")?.[0] as WellsLayer,
        [layers]
    );

    // Get color table for log curves.
    React.useEffect(() => {
        if (!wellsLayer?.isLoaded || !wellsLayer.props.logData) return;

        const legend = wellsLayer.state.legend[0];
        setLegendProps({
            title: legend.title,
            name: wellsLayer?.props?.logName,
            colorName: wellsLayer?.props?.logColor,
            discrete: legend.discrete,
            metadata: legend.metadata,
            valueRange: legend.valueRange,
        });
    }, [
        wellsLayer?.isLoaded,
        wellsLayer?.props?.logName,
        wellsLayer?.props?.logColor,
    ]);

    const [showLegend, setShowLegend] = React.useState<boolean | null>();
    React.useEffect(() => {
        // check log_curves from layer manager
        setShowLegend(
            visible && wellsLayer?.props.visible && wellsLayer?.props.logCurves
        );
    }, [visible, wellsLayer?.props.visible, wellsLayer?.props.logCurves]);

    if (!showLegend) return null;
    return (
        <div>
            {legendProps.discrete && (
                <DiscreteColorLegend
                    discreteData={legendProps.metadata}
                    dataObjectName={legendProps.title}
                    position={position}
                    colorName={legendProps.colorName}
                    colorTables={colorTables}
                    horizontal={horizontal}
                />
            )}
            {legendProps.valueRange?.length > 0 && legendProps && (
                <ContinuousLegend
                    min={legendProps.valueRange[0]}
                    max={legendProps.valueRange[1]}
                    dataObjectName={legendProps.title}
                    position={position}
                    colorName={legendProps.colorName}
                    colorTables={colorTables}
                    horizontal={horizontal}
                />
            )}
        </div>
    );
};

ColorLegend.defaultProps = {
    visible: true,
    position: [5, 10],
    horizontal: false,
};

export default ColorLegend;
