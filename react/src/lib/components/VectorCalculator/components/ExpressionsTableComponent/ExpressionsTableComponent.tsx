import React from "react";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { add, copy, delete_forever } from "@equinor/eds-icons";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";

import { StoreActions, useStore } from "../ExpressionsStore";
import { ExpressionsTable } from "./components/ExpressionsTable";
import { ExpressionType } from "../../utils/VectorCalculatorTypes";
import {
    getAvailableName,
    getDefaultExpression,
} from "../../utils/VectorCalculatorHelperFunctions";

import "!style-loader!css-loader!../../VectorCalculator.css";

interface ExpressionsTableComponentProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ExpressionsTableComponent: React.FC<
    ExpressionsTableComponentProps
> = (props: ExpressionsTableComponentProps) => {
    const store = useStore();
    const [expressions, setExpressions] = React.useState<ExpressionType[]>(
        store.state.expressions
    );
    const [selectedExpressions, setSelectedExpressions] = React.useState<
        ExpressionType[]
    >([]);
    const [disableDelete, setDisableDelete] = React.useState<boolean>(false);
    const blinkingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
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
        setExpressions(store.state.expressions);
    }, [store.state.expressions]);

    React.useEffect(() => {
        // Disable delete when all expressions are non-deletable
        setDisableDelete(
            selectedExpressions.length <= 0
                ? false
                : selectedExpressions.every((expr) => !expr.isDeletable)
        );
    }, [selectedExpressions]);

    const handleExpressionsSelect = (expressions: ExpressionType[]): void => {
        setSelectedExpressions(expressions);
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
        store.dispatch({
            type: StoreActions.AddExpressions,
            payload: { expressions: newExpressions },
        });
    }, [expressions, selectedExpressions, getAvailableName]);

    const handleDeleteClick = React.useCallback((): void => {
        const nonDeletableExpressions = selectedExpressions.filter((elm) => {
            return !elm.isDeletable;
        });

        // Handle blinking in table
        setBlinkingTableExpressions(nonDeletableExpressions);
        blinkingTimer.current = setTimeout(
            () => setBlinkingTableExpressions([]),
            3000
        );

        const deletableExpressions = selectedExpressions.filter((elm) => {
            return elm.isDeletable;
        });
        const deletableExpressionIds = deletableExpressions.map(
            (elm) => elm.id
        );

        store.dispatch({
            type: StoreActions.DeleteExpressions,
            payload: { ids: deletableExpressionIds },
        });
    }, [
        blinkingTimer,
        selectedExpressions,
        setBlinkingTableExpressions,
        setSelectedExpressions,
    ]);

    const handleNewClick = React.useCallback((): void => {
        const newName = getAvailableName("New Expression", expressions);
        const newExpression: ExpressionType = {
            ...getDefaultExpression(),
            name: newName,
        };
        store.dispatch({
            type: StoreActions.AddExpressions,
            payload: { expressions: [newExpression] },
        });
    }, [expressions, getAvailableName]);

    return (
        <Grid
            container
            item
            component={Paper}
            className="ExpressionTableComponent"
            xs={12}
            spacing={3}
            direction="column"
        >
            <Grid item>
                <ExpressionsTable
                    containerRef={props.containerRef}
                    blinkingExpressions={blinkingTableExpressions}
                    onExpressionsSelect={handleExpressionsSelect}
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
                                disableDelete || selectedExpressions.length <= 0
                            }
                        >
                            <Icon key="delete" name="delete_forever" />
                            Delete
                        </Button>
                    </Grid>
                </Grid>
                <Grid container item xs={4} justifyContent="flex-end">
                    <Grid item>
                        <Button onClick={handleNewClick}>
                            <Icon key="new" name="add" />
                            New
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};
