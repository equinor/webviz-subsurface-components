import React from "react";
import PropTypes from "prop-types";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
import { colorTablesArray } from "@emerson-eps/color-tables/";

interface LegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
    title?: string;
    cssLegendStyles?: {
        left?: string;
        top?: string;
        right?: string;
        bottom?: string;
    };
    colorName: string;
    colorTables: colorTablesArray | string | undefined;
    horizontal?: boolean | null;
}

const DiscreteLegendWrapper: React.FC<LegendProps> = ({
    discreteData,
    title,
    cssLegendStyles,
    colorName,
    colorTables,
    horizontal,
}) => {
    return (
        <DiscreteColorLegend
            discreteData={discreteData}
            dataObjectName={title}
            cssLegendStyles={cssLegendStyles}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal}
        />
    );
};

DiscreteLegendWrapper.propTypes = {
    discreteData: PropTypes.any.isRequired,
    title: PropTypes.string,
    cssLegendStyles: PropTypes.objectOf(PropTypes.string),
    colorName: PropTypes.string.isRequired,
    colorTables: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    horizontal: PropTypes.bool,
};

export default DiscreteLegendWrapper;
