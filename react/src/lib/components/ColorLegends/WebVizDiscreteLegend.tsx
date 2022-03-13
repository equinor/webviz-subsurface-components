import React from "react";
import PropTypes from "prop-types";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
import colorTablesArray from "@emerson-eps/color-tables/";

interface LegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
    title: string;
    position?: number[] | null;
    colorName: string;
    colorTables: colorTablesArray | string;
    horizontal?: boolean | null;
}

const DiscreteLegendWrapper: React.FC<LegendProps> = ({
    discreteData,
    title,
    position,
    colorName,
    colorTables,
    horizontal,
}) => {
    return (
        <DiscreteColorLegend
            discreteData={discreteData}
            dataObjectName={title}
            position={position}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal}
        />
    );
};

DiscreteLegendWrapper.propTypes = {
    discreteData: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    position: PropTypes.arrayOf(PropTypes.number.isRequired),
    colorName: PropTypes.string.isRequired,
    colorTables: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    horizontal: PropTypes.bool,
};

export default DiscreteLegendWrapper;
