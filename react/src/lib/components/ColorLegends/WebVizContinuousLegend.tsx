import React from "react";
import PropTypes from "prop-types";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface LegendProps {
    title?: string;
    min: number;
    max: number;
    cssLegendStyles?: {
        left?: string;
        top?: string;
        right?: string;
        bottom?: string;
    };
    colorName: string;
    horizontal?: boolean | null;
    colorTables: colorTablesArray | string | undefined;
}

const ContinuousLegendWrapper: React.FC<LegendProps> = ({
    title,
    min,
    max,
    cssLegendStyles,
    colorName,
    horizontal,
    colorTables,
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
        />
    );
};

ContinuousLegendWrapper.propTypes = {
    title: PropTypes.string,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    cssLegendStyles: PropTypes.objectOf(PropTypes.string),
    colorName: PropTypes.string.isRequired,
    horizontal: PropTypes.bool,
    colorTables: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default ContinuousLegendWrapper;
