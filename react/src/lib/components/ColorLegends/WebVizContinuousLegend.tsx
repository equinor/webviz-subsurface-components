import React from "react";
import PropTypes from "prop-types";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface LegendProps {
    min: number;
    max: number;
    title?: string;
    cssLegendStyles?: Record<string, unknown>;
    colorName?: string;
    horizontal?: boolean | null;
    colorTables?: colorTablesArray | string;
    id?: string;
    colorMapFunction?: (x: number) => [number, number, number];
    isRangeShown?: boolean;
    legendFontSize?: number;
    tickFontSize?: number;
    numberOfTicks?: number;
    legendScaleSize?: number;
}

const ContinuousLegendWrapper: React.FC<LegendProps> = ({
    min,
    max,
    title,
    cssLegendStyles,
    colorName,
    horizontal,
    colorTables,
    id,
    colorMapFunction,
    isRangeShown,
    legendFontSize,
    tickFontSize,
    numberOfTicks,
    legendScaleSize,
}) => {
    return (
        <ContinuousLegend
            min={min}
            max={max}
            dataObjectName={title}
            cssLegendStyles={cssLegendStyles}
            colorName={colorName}
            horizontal={horizontal}
            colorTables={colorTables}
            id={id}
            colorMapFunction={colorMapFunction}
            isRangeShown={isRangeShown}
            legendFontSize={legendFontSize}
            tickFontSize={tickFontSize}
            numberOfTicks={numberOfTicks}
            legendScaleSize={legendScaleSize}
        />
    );
};

ContinuousLegendWrapper.propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    title: PropTypes.string,
    cssLegendStyles: PropTypes.objectOf(PropTypes.string),
    colorName: PropTypes.string.isRequired,
    horizontal: PropTypes.bool,
    colorTables: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    id: PropTypes.string,
    colorMapFunction: PropTypes.func,
    isRangeShown: PropTypes.bool,
    legendFontSize: PropTypes.number,
    tickFontSize: PropTypes.number,
    numberOfTicks: PropTypes.number,
    legendScaleSize: PropTypes.number,
};

export default ContinuousLegendWrapper;
