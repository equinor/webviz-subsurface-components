/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import {
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Tooltip,
} from "@mui/material";

import { getDetailedExpression } from "../../../utils/VectorCalculatorHelperFunctions";
import type { ExpressionType } from "../../../utils/VectorCalculatorTypes";
import { ConfirmDialog } from "../../../utils/ConfirmDialog";
import {
    isExpressionEdited,
    StoreActions,
    useStore,
} from "../../ExpressionsStore";

import { BlinkingTableRow } from "./BlinkingTableRow";
import { EnhancedTableHead } from "./EnhancedTableHead";

import "../../../VectorCalculator.css";

interface ExpressionsTableProps {
    blinkingExpressions: ExpressionType[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    onExpressionsSelect: (expressions: ExpressionType[]) => void;
}

export const ExpressionsTable: React.FC<ExpressionsTableProps> = (
    props: ExpressionsTableProps
) => {
    const store = useStore();
    const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = React.useState(false);
    const [expressions, setExpressions] = React.useState<ExpressionType[]>(
        store.state.expressions
    );
    const [activeExpression, setActiveExpression] =
        React.useState<ExpressionType>(store.state.activeExpression);
    const [selectedExpressions, setSelectedExpressions] = React.useState<
        ExpressionType[]
    >([]);

    React.useEffect(() => {
        setExpressions(store.state.expressions);
    }, [store.state.expressions]);

    React.useEffect(() => {
        const newSelectedExpressions = expressions.filter((expr) =>
            selectedExpressions.some((elm) => elm.id === expr.id)
        );

        if (newSelectedExpressions !== selectedExpressions) {
            setSelectedExpressions(newSelectedExpressions);
            props.onExpressionsSelect(newSelectedExpressions);
        }
    }, [expressions]);

    const handleCheckBoxClick = React.useCallback(
        (expression: ExpressionType): void => {
            const index = selectedExpressions.indexOf(expression);

            let newSelected: ExpressionType[] = [];
            if (index === -1) {
                newSelected = newSelected.concat(
                    selectedExpressions,
                    expression
                );
            } else if (index === 0) {
                newSelected = newSelected.concat(selectedExpressions.slice(1));
            } else if (index === selectedExpressions.length - 1) {
                newSelected = newSelected.concat(
                    selectedExpressions.slice(0, -1)
                );
            } else if (index > 0) {
                newSelected = newSelected.concat(
                    selectedExpressions.slice(0, index),
                    selectedExpressions.slice(index + 1)
                );
            }

            setSelectedExpressions(newSelected);
            props.onExpressionsSelect(newSelected);
        },
        [selectedExpressions, setSelectedExpressions, props.onExpressionsSelect]
    );

    const handleRowClick = React.useCallback(
        (expression: ExpressionType): void => {
            setActiveExpression(expression);
            if (
                !store.state.activeExpression.id ||
                !isExpressionEdited(store.state)
            ) {
                store.dispatch({
                    type: StoreActions.SetActiveExpression,
                    payload: { expression: expression },
                });
                return;
            }
            if (store.state.editableExpressionTypeValid) {
                setIsSaveDialogOpen(true);
            } else {
                setIsDiscardDialogOpen(true);
            }
        },
        [
            store.state,
            store.state.activeExpression.id,
            store.state.editableExpressionTypeValid,
            isExpressionEdited,
            setIsSaveDialogOpen,
            setIsDiscardDialogOpen,
            setActiveExpression,
        ]
    );

    const isExpressionSelected = (expression: ExpressionType): boolean => {
        return selectedExpressions.indexOf(expression) !== -1;
    };

    const handleSelectAllClick = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                const newSelectedExpressions = [...expressions];
                setSelectedExpressions(newSelectedExpressions);
                props.onExpressionsSelect(newSelectedExpressions);
                return;
            }
            setSelectedExpressions([]);
            props.onExpressionsSelect([]);
        },
        [expressions, setSelectedExpressions, props.onExpressionsSelect]
    );

    const handleOnSave = React.useCallback(() => {
        // Secure not saving invalid data
        if (!store.state.editableExpressionTypeValid) {
            setActiveExpression(store.state.activeExpression);
        } else {
            store.dispatch({
                type: StoreActions.SaveEditableExpression,
            });
        }
        setIsSaveDialogOpen(false);
    }, [
        store.state.editableExpressionTypeValid,
        store.state.activeExpression,
        setActiveExpression,
        setIsSaveDialogOpen,
    ]);

    const handleOnNotSave = React.useCallback(() => {
        setIsSaveDialogOpen(false);
        store.dispatch({
            type: StoreActions.SetActiveExpression,
            payload: { expression: activeExpression },
        });
    }, [setIsSaveDialogOpen, activeExpression]);

    const handleOnNotDiscardChanges = React.useCallback(() => {
        setActiveExpression(store.state.activeExpression);
        setIsDiscardDialogOpen(false);
    }, [
        store.state.activeExpression,
        setIsDiscardDialogOpen,
        setActiveExpression,
    ]);

    const handleOnDiscardChanges = React.useCallback(() => {
        setIsDiscardDialogOpen(false);
        store.dispatch({
            type: StoreActions.SetActiveExpression,
            payload: { expression: activeExpression },
        });
    }, [setIsDiscardDialogOpen, activeExpression]);

    return (
        <>
            <TableContainer>
                <Table
                    aria-label="sticky table"
                    className="ExpressionsTableHeaderTable"
                >
                    <EnhancedTableHead
                        numSelected={selectedExpressions.length}
                        onSelectAllClick={handleSelectAllClick}
                        rowCount={expressions.length}
                    />
                </Table>
            </TableContainer>
            <TableContainer className="ExpressionsTable">
                <Table aria-label="sticky table">
                    <TableBody>
                        {expressions.map((row) => {
                            const isSelected = isExpressionSelected(row);
                            const isActive =
                                store.state.activeExpression === row;
                            const expressionFromMap =
                                getDetailedExpression(row);
                            const isBlinking = props.blinkingExpressions.some(
                                (elm) => elm.id == row.id
                            );

                            return (
                                <BlinkingTableRow
                                    blinking={isBlinking}
                                    hover={true}
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={row.id}
                                    selected={isActive}
                                    aria-checked={isActive}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isSelected}
                                            onClick={() =>
                                                handleCheckBoxClick(row)
                                            }
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        onClick={() => handleRowClick(row)}
                                        className="ExpressionsTableNameCell"
                                    >
                                        <Tooltip
                                            key={row.name}
                                            placement="top"
                                            title={
                                                row.description
                                                    ? row.description
                                                    : ""
                                            }
                                            enterDelay={1000}
                                            enterNextDelay={1000}
                                            hidden={
                                                !row.description ||
                                                row.description.length <= 0
                                            }
                                        >
                                            <div
                                                className={
                                                    "ExpressionsTableCell"
                                                }
                                            >
                                                {row.name}
                                            </div>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        onClick={() => handleRowClick(row)}
                                        className="ExpressionsTableExpressionCell"
                                    >
                                        <Tooltip
                                            key={row.expression}
                                            placement="top"
                                            title={expressionFromMap}
                                            enterDelay={1000}
                                            enterNextDelay={1000}
                                        >
                                            <div
                                                className={
                                                    "ExpressionsTableCell"
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
            <ConfirmDialog
                id={"SaveDialog"}
                open={isSaveDialogOpen}
                containerRef={props.containerRef}
                text={"Do you want to save changes?"}
                onYes={handleOnSave}
                onNo={handleOnNotSave}
            />
            <ConfirmDialog
                id={"DiscardDialog"}
                open={isDiscardDialogOpen}
                containerRef={props.containerRef}
                text={"Do you want to discard changes?"}
                onYes={handleOnDiscardChanges}
                onNo={handleOnNotDiscardChanges}
            />
        </>
    );
};
