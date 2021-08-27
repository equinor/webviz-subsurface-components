import React from "react";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { add, copy, delete_forever } from "@equinor/eds-icons";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";

import { ExpressionsTable } from "./ExpressionsTable";
import { ExpressionType } from "../utils/VectorCalculatorTypes";
import {
    getAvailableName,
    getDefaultExpression,
} from "../utils/VectorCalculatorHelperFunctions";

import "../VectorCalculator.css";

interface ExpressionsTableComponentProps {
    expressions: ExpressionType[];
    onActiveExpressionChange: (expression: ExpressionType | undefined) => void;
    onExpressionsChange: (expressions: ExpressionType[]) => void;
}

export const ExpressionsTableComponent: React.FC<ExpressionsTableComponentProps> =
    (props: ExpressionsTableComponentProps) => {
        const { expressions } = props;
        const [activeExpression, setActiveExpression] =
            React.useState<ExpressionType | undefined>(undefined);
        const [selectedExpressions, setSelectedExpressions] = React.useState<
            ExpressionType[]
        >([]);
        const [disableDelete, setDisableDelete] =
            React.useState<boolean>(false);
        const blinkingTimer =
            React.useRef<ReturnType<typeof setTimeout> | null>(null);
        const [blinkingTableExpressions, setBlinkingTableExpressions] =
            React.useState<ExpressionType[]>([]);

        Icon.add({ add, copy, delete_forever });

        React.useEffect(() => {
            // Unmount timer
            return () => {
                blinkingTimer.current && clearTimeout(blinkingTimer.current);
            };
        }, []);

        React.useEffect(() => {
            // Disable delete when all expressions are non-deletable
            setDisableDelete(
                selectedExpressions.length <= 0
                    ? false
                    : selectedExpressions.every((expr) => !expr.isDeletable)
            );
        }, [selectedExpressions]);

        const addNewExpressions = React.useCallback(
            (newExpressions: ExpressionType[]): void => {
                const newExpressionsList = cloneDeep(expressions);
                for (const elm of newExpressions) {
                    newExpressionsList.push(elm);
                }
                props.onExpressionsChange(newExpressionsList);
            },
            [expressions]
        );

        const handleExpressionsSelect = (
            expressions: ExpressionType[]
        ): void => {
            setSelectedExpressions(expressions);
        };

        const handleActiveExpressionSelect = (
            expression: ExpressionType
        ): void => {
            setActiveExpression(expression);
            props.onActiveExpressionChange(expression);
        };

        const handleCloneClick = React.useCallback((): void => {
            if (selectedExpressions.length <= 0) {
                return;
            }

            const newExpressions: ExpressionType[] = [];
            for (const elm of selectedExpressions) {
                const cloneExpr = cloneDeep(elm);
                cloneExpr.name = getAvailableName(elm.name, expressions);
                cloneExpr.id = uuidv4();
                cloneExpr.isDeletable = true;
                newExpressions.push(cloneExpr);
            }
            addNewExpressions(newExpressions);
        }, [selectedExpressions, addNewExpressions, getAvailableName]);

        const handleDeleteClick = React.useCallback((): void => {
            const nonDeletableExpressions = selectedExpressions.filter(
                (elm) => {
                    return !elm.isDeletable;
                }
            );
            setSelectedExpressions(nonDeletableExpressions);

            // Handle blinking in table
            setBlinkingTableExpressions(nonDeletableExpressions);
            blinkingTimer.current = setTimeout(
                () => setBlinkingTableExpressions([]),
                3000
            );

            const deletableExpressions = selectedExpressions.filter((elm) => {
                return elm.isDeletable;
            });
            const newExpressionsList = expressions.filter((elm) => {
                return deletableExpressions.indexOf(elm) === -1;
            });
            props.onExpressionsChange(newExpressionsList);

            if (
                activeExpression !== undefined &&
                !newExpressionsList.some((el) => el.id === activeExpression.id)
            ) {
                setActiveExpression(undefined);
                props.onActiveExpressionChange(undefined);
            }
        }, [
            activeExpression,
            blinkingTimer,
            expressions,
            selectedExpressions,
            setActiveExpression,
            setBlinkingTableExpressions,
            setSelectedExpressions,
            props.onActiveExpressionChange,
            props.onExpressionsChange,
        ]);

        const handleNewClick = React.useCallback((): void => {
            const newName = getAvailableName("New Expression", expressions);
            const newExpression: ExpressionType = {
                ...getDefaultExpression(),
                name: newName,
            };
            addNewExpressions([newExpression]);
        }, [expressions, addNewExpressions, getAvailableName]);

        return (
            <Paper className="ExpressionTableComponent">
                <Grid container item xs={12} spacing={3} direction="column">
                    <Grid item>
                        <ExpressionsTable
                            expressions={expressions}
                            blinkingExpressions={blinkingTableExpressions}
                            onExpressionsSelect={handleExpressionsSelect}
                            onActiveExpressionSelect={
                                handleActiveExpressionSelect
                            }
                        />
                    </Grid>
                    <Grid item>
                        {blinkingTableExpressions.length !== 0 && (
                            <Alert variant="filled" severity="error">
                                {blinkingTableExpressions.length > 1
                                    ? "Expressions not deletable!"
                                    : "Expression not deletable!"}
                            </Alert>
                        )}
                    </Grid>
                </Grid>
                <Grid container item xs={12}>
                    <Grid container item xs={8} spacing={2}>
                        <Grid item>
                            <Button
                                onClick={handleCloneClick}
                                variant="outlined"
                                disabled={selectedExpressions.length <= 0}
                            >
                                <Icon key="clone" name="copy" />
                                Clone
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={handleDeleteClick}
                                color="danger"
                                disabled={
                                    disableDelete ||
                                    selectedExpressions.length <= 0
                                }
                            >
                                <Icon key="delete" name="delete_forever" />
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container item xs={4} spacing={1} justify="flex-end">
                        <Grid item>
                            <Button onClick={handleNewClick}>
                                <Icon key="new" name="add" />
                                New
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        );
    };
