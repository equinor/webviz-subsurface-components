import React from "react";
import { TableRow, TableRowProps } from "@material-ui/core";

interface BlinkingTableRowProps extends TableRowProps {
    blinking: boolean;
    children: React.ReactNode;
}
export const BlinkingTableRow: React.FC<BlinkingTableRowProps> = (
    props: BlinkingTableRowProps
) => {
    return (
        <TableRow
            className={props.blinking ? "BlinkingTableRow" : "Styled"}
            {...props}
        >
            {props.children}
        </TableRow>
    );
};
