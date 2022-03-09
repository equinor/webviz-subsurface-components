import React from "react";
import PropTypes from "prop-types";
import { ContinuousLegend } from "@emerson-eps/color-tables";
// eslint-disable-next-line @typescript-eslint/no-var-requires

interface ColorTable {
    name: string;
    discrete: boolean;
    colors: [number, number, number, number][];
}

interface LegendProps {
    title: string;
    min: number;
    max: number;
    position?: number[] | null;
    colorName: string;
    horizontal?: boolean | null;
    colorTables: ColorTable;
}

const ContinuousLegendWrapper: React.FC<LegendProps> = ({
    title,
    min,
    max,
    position,
    colorName,
    horizontal,
    colorTables,
}) => {
    return (
        <ContinuousLegend
            min={min}
            max={max}
            dataObjectName={title}
            position={position}
            colorName={colorName}
            horizontal={horizontal}
            colorTables={colorTables}
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
    colorTables: PropTypes.any,
};

export default ContinuousLegendWrapper;
