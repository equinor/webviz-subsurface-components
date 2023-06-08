import React from "react";
import { Checkbox, TableCell, TableHead, TableRow } from "@mui/material";

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
                <TableCell
                    padding="checkbox"
                    className="ExpressionsTableHeader"
                >
                    <Checkbox
                        indeterminate={
                            numSelected > 0 && numSelected < rowCount
                        }
                        checked={numSelected > 0 && numSelected <= rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{ "aria-label": "select all expressions" }}
                        color="primary"
                    />
                </TableCell>
                <TableCell
                    className="ExpressionsTableHeader ExpressionsTableNameCell"
                    align="left"
                >
                    {"Name"}
                </TableCell>
                <TableCell
                    className="ExpressionsTableHeader ExpressionsTableExpressionCell"
                    align="left"
                >
                    {"Expression"}
                </TableCell>
            </TableRow>
        </TableHead>
    );
};
