import React from "react";
import PropTypes from "prop-types";
import { ContinuousLegend } from "@emerson-eps/color-tables";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");

interface LegendProps {
    title: string;
    min: number;
    max: number;
};

const ContinuousLegendWrapper: React.FC<LegendProps> = ({title, min, max}) => {
    const position = [16, 10];
    const horizontal = true;
    const colorName = "Rainbow";

    return (
        <ContinuousLegend
            min={min}
            max={max}
            dataObjectName={title}
            position={position}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal}
        />
    );
};

ContinuousLegendWrapper.propTypes = {
    title: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
};

export default ContinuousLegendWrapper;
