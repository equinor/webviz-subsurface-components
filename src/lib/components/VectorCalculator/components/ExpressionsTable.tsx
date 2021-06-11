import React, { useCallback } from "react";
import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
} from "@material-ui/core";
import { Tooltip } from "@equinor/eds-core-react";

import { getDetailedExpression } from "../utils/VectorCalculatorHelperFunctions";
import { ExpressionType } from "../utils/VectorCalculatorTypes";
import { BlinkingTableRow } from "../utils/BlinkingTableRow";
import { EnhancedTableHead } from "../utils/EnhancedTableHead";
import "../VectorCalculator.css";

interface ExpressionsTableProps {
    expressions: ExpressionType[];
    onExpressionsSelect: (expressions: ExpressionType[]) => void;
    onActiveExpressionSelect: (expression: ExpressionType) => void;
}
export const ExpressionsTable: React.FC<ExpressionsTableProps> = (
    props: ExpressionsTableProps
) => {
    const { expressions } = props;
    const [selectedExpressions, setSelectedExpressions] = React.useState<
        ExpressionType[]
    >([]);
    const [activeExpression, setActiveExpression] =
        React.useState<ExpressionType>({
            name: "",
            expression: "",
            id: "",
            variableVectorMap: [],
            isValid: false,
            isDeletable: true,
        });

    React.useEffect(() => {
        updateSelectedExpressions();
        updateActiveExpression();
    }, [expressions]);

    const updateSelectedExpressions = useCallback((): void => {
        const newSelectedExpressions = expressions.filter((expr) => {
            for (const elm of selectedExpressions) {
                if (elm.id === expr.id) {
                    return true;
                }
            }
            return false;
        });

        setSelectedExpressions(newSelectedExpressions);
    }, [expressions, selectedExpressions]);

    const updateActiveExpression = useCallback((): void => {
        let newActiveExpression = expressions.find(
            (elm) => elm.id === activeExpression.id
        );
        if (newActiveExpression === undefined) {
            newActiveExpression = {
                name: "",
                expression: "",
                id: "",
                variableVectorMap: [],
                isValid: false,
                isDeletable: true,
            };
        }
        setActiveExpression(newActiveExpression);
    }, [expressions, activeExpression]);

    const handleCheckBoxClick = (expression: ExpressionType): void => {
        const index = selectedExpressions.indexOf(expression);

        let newSelected: ExpressionType[] = [];
        if (index === -1) {
            newSelected = newSelected.concat(selectedExpressions, expression);
        } else if (index === 0) {
            newSelected = newSelected.concat(selectedExpressions.slice(1));
        } else if (index === selectedExpressions.length - 1) {
            newSelected = newSelected.concat(selectedExpressions.slice(0, -1));
        } else if (index > 0) {
            newSelected = newSelected.concat(
                selectedExpressions.slice(0, index),
                selectedExpressions.slice(index + 1)
            );
        }

        setSelectedExpressions(newSelected);
        props.onExpressionsSelect(newSelected);
    };

    const handleRowClick = (expression: ExpressionType): void => {
        setActiveExpression(expression);
        props.onActiveExpressionSelect(expression);
    };

    const isExpressionSelected = useCallback(
        (expression: ExpressionType): boolean => {
            return selectedExpressions.indexOf(expression) !== -1;
        },
        [selectedExpressions]
    );

    const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newSelectedExpressions = [...expressions];
            setSelectedExpressions(newSelectedExpressions);
            props.onExpressionsSelect(newSelectedExpressions);
            return;
        }
        setSelectedExpressions([]);
        props.onExpressionsSelect([]);
    };

    return (
        <TableContainer className={"ExpressionTable"} component={Paper}>
            <Table stickyHeader aria-label="sticky table">
                <EnhancedTableHead
                    numSelected={selectedExpressions.length}
                    onSelectAllClick={handleSelectAllClick}
                    rowCount={expressions.length}
                />
                <TableBody>
                    {expressions.map((row) => {
                        const isSelected = isExpressionSelected(row);
                        const isActive = activeExpression === row;
                        const expressionFromMap = getDetailedExpression(row);

                        return (
                            <BlinkingTableRow
                                blinking={false} // TODO: Add blinking functionality
                                hover={true}
                                role="checkbox"
                                tabIndex={-1}
                                key={row.id}
                                selected={isActive}
                                aria-checked={isActive}
                            >
                                <TableCell padding="checkbox" width="2%">
                                    <Checkbox
                                        checked={isSelected}
                                        onClick={() => handleCheckBoxClick(row)}
                                    />
                                </TableCell>
                                <TableCell
                                    align="left"
                                    onClick={() => handleRowClick(row)}
                                    width="38%"
                                >
                                    <div className={"ExpressionsTableNameCell"}>
                                        {row.name}
                                    </div>
                                </TableCell>
                                <TableCell
                                    align="left"
                                    width="60%"
                                    onClick={() => handleRowClick(row)}
                                >
                                    <Tooltip
                                        key={row.expression}
                                        placement="top"
                                        title={expressionFromMap}
                                        enterDelay={1000}
                                    >
                                        <div
                                            className={
                                                "ExpressionsTableExpressionCell"
                                            }
                                        >
                                            {expressionFromMap}
                                        </div>
                                    </Tooltip>
                                </TableCell>
                            </BlinkingTableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
