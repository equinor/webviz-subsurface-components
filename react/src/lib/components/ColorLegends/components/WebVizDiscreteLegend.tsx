import React, { ReactElement } from "react";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");

const DiscreteLegendWrapper: React.FC = (): ReactElement => {
    const discreteData = {
        Above_BCU: [[255, 13, 186, 255], 0],
        ABOVE: [[255, 64, 53, 255], 1],
        H12: [[247, 255, 164, 255], 2],
        BELOW: [[73, 255, 35, 255], 14],
        H3: [[255, 144, 1, 255], 11],
    };
    const colorName = "Stratigraphy";
    const dataObjectName = "Wells / ZONELOG";
    const position = [16, 10];
    const horizontal = true;

    return (
        <DiscreteColorLegend
            discreteData={discreteData}
            dataObjectName={dataObjectName}
            position={position}
            colorName={colorName}
            colorTables={colorTables}
            horizontal={horizontal}
        />
    );
};

export default DiscreteLegendWrapper;
