import React from "react";
import PropTypes from "prop-types";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
import colorTablesArray from "@emerson-eps/color-tables/"; 
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables1 = require("@emerson-eps/color-tables/src/component/color-tables.json");

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
        <div>
            { colorTables && discreteData && (
                <DiscreteColorLegend
                    discreteData={discreteData}
                    dataObjectName={title}
                    position={position}
                    colorName={colorName}
                    colorTables={colorTables1}
                    horizontal={horizontal}
                />
            )}
        </div> 
    );
};

DiscreteLegendWrapper.propTypes = {
    discreteData: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    position: PropTypes.arrayOf(PropTypes.number.isRequired),
    colorName: PropTypes.string.isRequired,
    colorTables: PropTypes.any.isRequired,
    horizontal: PropTypes.bool,
};

export default DiscreteLegendWrapper;
