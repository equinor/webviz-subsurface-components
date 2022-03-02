import React from "react";
import { TableRow, TableRowProps } from "@material-ui/core";

import "!style-loader!css-loader!../../../VectorCalculator.css";

interface BlinkingTableRowProps extends TableRowProps {
    blinking: boolean;
}
export const BlinkingTableRow: React.FC<BlinkingTableRowProps> = (
    props: BlinkingTableRowProps
) => {
    const { blinking, children, ...other } = props;

    return (
        <TableRow {...other} className={blinking ? "BlinkingTableRow" : ""}>
            {children}
        </TableRow>
    );
};
