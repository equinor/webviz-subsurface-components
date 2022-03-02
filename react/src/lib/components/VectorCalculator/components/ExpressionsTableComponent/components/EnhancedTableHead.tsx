import React from "react";
import { Checkbox, TableCell, TableHead, TableRow } from "@material-ui/core";

interface EnhancedTableProps {
    numSelected: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowCount: number;
}
export const EnhancedTableHead: React.FC<EnhancedTableProps> = (
    props: EnhancedTableProps
) => {
    const { onSelectAllClick, numSelected, rowCount } = props;

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={
                            numSelected > 0 && numSelected < rowCount
                        }
                        checked={numSelected > 0 && numSelected <= rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{ "aria-label": "select all expressions" }}
                    />
                </TableCell>
                <TableCell
                    className="ExpressionsTableHeader ExpressionsTableHeaderNameCell"
                    align="left"
                >
                    {"Name"}
                </TableCell>
                <TableCell
                    className="ExpressionsTableHeader ExpressionsTableHeaderExpressionCell"
                    align="left"
                >
                    {"Expression"}
                </TableCell>
            </TableRow>
        </TableHead>
    );
};
