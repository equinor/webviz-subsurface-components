import React, { useCallback } from "react";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { add, copy, delete_forever } from "@equinor/eds-icons";
import { v4 as uuidv4 } from "uuid";

import { ExpressionsTable } from "./ExpressionsTable";
import { ExpressionType } from "../utils/VectorCalculatorTypes";
import { getAvailableName } from "../utils/VectorCalculatorHelperFunctions";
import "../VectorCalculator.css";
import { cloneDeep } from "lodash";

interface ExpressionsTableComponentProps {
    expressions: ExpressionType[];
    predefinedExpressions: ExpressionType[];
    onActiveExpressionChange: (expression: ExpressionType | undefined) => void;
    onExpressionsChange: (expressions: ExpressionType[]) => void;
}

export const ExpressionsTableComponent: React.FC<ExpressionsTableComponentProps> =
    (props: ExpressionsTableComponentProps) => {
        const { expressions, predefinedExpressions } = props;
        const [activeExpression, setActiveExpression] =
            React.useState<ExpressionType | undefined>(undefined);
        const [selectedExpressions, setSelectedExpressions] = React.useState<
            ExpressionType[]
        >([]);
        const [disableDelete, setDisableDelete] =
            React.useState<boolean>(false);

        Icon.add({ add });
        Icon.add({ copy });
        Icon.add({ delete_forever });

        const handleExpressionsSelect = useCallback(
            (expressions: ExpressionType[]): void => {
                setSelectedExpressions(expressions);

                // Disable deletion when one or more expression is not deletable
                setDisableDelete(expressions.some((expr) => !expr.isDeletable));
            },
            [predefinedExpressions]
        );

        const handleActiveExpressionSelect = (
            expression: ExpressionType
        ): void => {
            setActiveExpression(expression);
            props.onActiveExpressionChange(expression);
        };

        const handleCloneClick = (): void => {
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
        };

        const handleDeleteClick = (): void => {
            const newExpressionsList = expressions.filter((elm) => {
                return selectedExpressions.indexOf(elm) === -1;
            });
            props.onExpressionsChange(newExpressionsList);
            setSelectedExpressions([]);

            if (
                activeExpression !== undefined &&
                !newExpressionsList.some((el) => el.id === activeExpression.id)
            ) {
                setActiveExpression(undefined);
                props.onActiveExpressionChange(undefined);
            }
        };

        const handleNewClick = (): void => {
            // TODO: Set new expression as active expression?
            // - If so: must modify selectedExpressions state in ExpressionsTable -> new prop gives unwanted logic?
            const newName = getAvailableName("New Expression", expressions);
            const newExpression: ExpressionType = {
                name: newName,
                expression: "",
                id: uuidv4(),
                variableVectorMap: [],
                isValid: false,
                isDeletable: true,
            };
            addNewExpressions([newExpression]);
        };

        const addNewExpressions = useCallback(
            (newExpressions: ExpressionType[]): void => {
                const newExpressionsList = cloneDeep(expressions);
                for (const elm of newExpressions) {
                    newExpressionsList.push(elm);
                }
                props.onExpressionsChange(newExpressionsList);
            },
            [expressions]
        );

        return (
            <Paper className="ExpressionTableComponent">
                <Grid container item xs={12} spacing={3} direction="column">
                    <Grid item>
                        <ExpressionsTable
                            expressions={expressions}
                            onExpressionsSelect={handleExpressionsSelect}
                            onActiveExpressionSelect={
                                handleActiveExpressionSelect
                            }
                        />
                    </Grid>
                </Grid>
                <Grid container item spacing={2} alignItems="flex-end">
                    <Grid item>
                        <Button onClick={handleCloneClick} variant="outlined">
                            <Icon key="clone" name="copy" />
                            Clone
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={handleDeleteClick}
                            color="danger"
                            disabled={disableDelete}
                        >
                            <Icon key="delete" name="delete_forever" />
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={handleNewClick}>
                            <Icon key="new" name="add" />
                            New
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        );
    };
