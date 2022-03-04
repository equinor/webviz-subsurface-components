import React from "react";
import PropTypes from "prop-types";
import { ContinuousLegend } from "@emerson-eps/color-tables";
//import { colorTablesArray } from "@emerson-eps/color-tables/";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");

interface LegendProps {
    title: string;
    min: number;
    max: number;
    position?: number[] | null;
    colorName: string;
    horizontal?: boolean | null;
}

const ContinuousLegendWrapper: React.FC<LegendProps> = ({
    title,
    min,
    max,
    position,
    colorName,
    horizontal,
}) => {
    return (
        <ContinuousLegend
            min={min}
            max={max}
            dataObjectName={title}
            position={position}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal ? horizontal : null}
        />
    );
};

ContinuousLegendWrapper.propTypes = {
    title: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    position: PropTypes.arrayOf(PropTypes.number.isRequired),
    colorName: PropTypes.string.isRequired,
    horizontal: PropTypes.bool,
};

export default ContinuousLegendWrapper;
