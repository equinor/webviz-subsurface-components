import React from "react";
import PropTypes from "prop-types";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");

interface LegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
    title: string;
    position: number[];
    colorName: string;
    horizontal?: boolean;
}

const DiscreteLegendWrapper: React.FC<LegendProps> = ({
    discreteData,
    title,
    position,
    colorName,
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
    title: PropTypes.string.isRequired,
    colorName: PropTypes.string.isRequired,
    horizontal: PropTypes.bool,
};

export default DiscreteLegendWrapper;
