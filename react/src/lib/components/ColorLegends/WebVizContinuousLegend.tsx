import React, { ReactElement } from "react";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import colorTables from "@emerson-eps/color-tables/src/component/color-tables.json";

const ContinuousLegendWrapper: React.FC = (): ReactElement => {
    const min = 0;
    const max = 0.35;
    const dataObjectName = "Wells / PORO";
    const position = [16, 10];
    const horizontal = true;
    const colorName = "Rainbow";

    return (
        <ContinuousLegend
            min={min}
            max={max}
            dataObjectName={dataObjectName}
            position={position}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal}
        />
    );
};

export default ContinuousLegendWrapper;
