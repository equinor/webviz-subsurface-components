import React, { useCallback } from "react";
import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { Tooltip } from "@equinor/eds-core-react";

import {
    ExpressionType,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";
import "../VectorCalculator.css";

interface EnhancedTableProps {
    numSelected: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowCount: number;
}
const EnhancedTableHead: React.FC<EnhancedTableProps> = (
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
                    className="ExpressionsTableHeader"
                    align="left"
                    width="600"
                >
                    {"Name"}
                </TableCell>
                <TableCell
                    className="ExpressionsTableHeader"
                    align="left"
                    width="300"
                >
                    {"Expression"}
                </TableCell>
            </TableRow>
        </TableHead>
    );
};

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
    const [
        activeExpression,
        setActiveExpression,
    ] = React.useState<ExpressionType>({
        name: "",
        expression: "",
        id: "",
        variableVectorMap: [],
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

    const getExpressionFromMap = (
        expression: string,
        variableVectorMap: VariableVectorMapType[]
    ): string => {
        let output = expression;
        for (const elm of variableVectorMap) {
            output = output.replace(elm.variableName, elm.vectorName[0]);
        }
        return output;
    };

    return (
        <TableContainer className={"ExpressionTable"} component={Paper}>
            <Table>
                <EnhancedTableHead
                    numSelected={selectedExpressions.length}
                    onSelectAllClick={handleSelectAllClick}
                    rowCount={expressions.length}
                />
                <TableBody>
                    {expressions.map((row) => {
                        const isSelected = isExpressionSelected(row);
                        const isActive = activeExpression === row;
                        const expressionFromMap = getExpressionFromMap(
                            row.expression,
                            row.variableVectorMap
                        );

                        return (
                            <TableRow
                                hover
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
                                    <div className={"VariablesTableNameCell"}>
                                        {row.name}
                                    </div>
                                </TableCell>
                                <Tooltip
                                    key={row.expression}
                                    placement="top"
                                    title={expressionFromMap}
                                >
                                    <TableCell
                                        align="left"
                                        width="60%"
                                        onClick={() => handleRowClick(row)}
                                    >
                                        <div
                                            className={
                                                "VariablesTableExpressionCell"
                                            }
                                        >
                                            {expressionFromMap}
                                        </div>
                                    </TableCell>
                                </Tooltip>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
