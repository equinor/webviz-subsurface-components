import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import { TreeDataNode } from "@webviz/core-components";

import { VariablesTable } from "./VariablesTable";
import { ExpressionDescriptionTextField } from "./ExpressionDescriptionTextField";
import { ExpressionNameTextField } from "./ExpressionNameTextField";
import { ExpressionInputTextField } from "./ExpressionInputTextField";

import { areVariableVectorMapsEqual } from "../utils/VectorCalculatorHelperFunctions";

import { StoreActions, useStore, ExpressionStatus } from "./ExpressionsStore";

import {
    ExpressionType,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";
import { getExpressionParseData } from "../utils/ExpressionParser";

import "!style-loader!css-loader!../VectorCalculator.css";

interface ExpressionInputComponent {
    vectors: TreeDataNode[];
    maxExpressionDescriptionLength: number;
}

export const ExpressionInputComponent: React.FC<ExpressionInputComponent> = (
    props: ExpressionInputComponent
) => {
    const store = useStore();
    const [activeExpression, setActiveExpression] =
        React.useState<ExpressionType>(store.state.activeExpression);

    const [disabled, setDisabled] = React.useState<boolean>(
        store.state.activeExpression.id === ""
    );
    const [expressionStatus, setExpressionStatus] =
        React.useState<ExpressionStatus>(ExpressionStatus.Invalid);
    const [isExpressionEdited, setIsExpressionEdited] = React.useState<boolean>(
        store.state.activeExpression !== store.state.editableExpression
    );

    const [editableExpression, setEditableExpression] =
        React.useState<ExpressionType>(store.state.editableExpression);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>([]);

    Icon.add({ clear, save, sync });

    const getVariableVectorMapFromVariables = React.useCallback(
        (variables: string[]): VariableVectorMapType[] => {
            const map: VariableVectorMapType[] = [];
            for (const variable of variables) {
                const cachedElm = cachedVariableVectorMap.find(
                    (elm) => elm.variableName === variable
                );
                if (!cachedElm) {
                    map.push({ variableName: variable, vectorName: [] });
                } else {
                    map.push(cachedElm);
                }
            }
            return map;
        },
        [cachedVariableVectorMap]
    );

    const makeVariableVectorMapFromExpression = React.useCallback(
        (expression: ExpressionType): VariableVectorMapType[] => {
            if (expression.expression.length === 0) {
                return [];
            }

            const parseData = getExpressionParseData(expression.expression);
            if (!parseData.isValid) {
                return cloneDeep(editableExpression.variableVectorMap);
            }
            return getVariableVectorMapFromVariables(parseData.variables);
        },
        [
            editableExpression,
            getExpressionParseData,
            getVariableVectorMapFromVariables,
        ]
    );

    const getUpdatedCachedVariableVectorMap = React.useCallback(
        (newMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap = cloneDeep(
                cachedVariableVectorMap
            );
            for (const elm of newMap) {
                const cachedElm = newCachedVariableVectorMap.find(
                    (cachedElm) => cachedElm.variableName === elm.variableName
                );
                if (!cachedElm) {
                    newCachedVariableVectorMap.push(elm);
                } else {
                    cachedElm.vectorName = elm.vectorName;
                    newCachedVariableVectorMap.push(cachedElm);
                }
            }
            return newCachedVariableVectorMap;
        },
        [cachedVariableVectorMap]
    );

    const areExpressionsEqual = React.useCallback(
        (first: ExpressionType, second: ExpressionType): boolean => {
            const areIdsEqual = first.id === second.id;
            const areNamesEqual = first.name === second.name;
            const areExpressionsEqual = first.expression === second.expression;
            const areDescriptionsEqual =
                first.description === second.description;

            return (
                areIdsEqual &&
                areNamesEqual &&
                areExpressionsEqual &&
                areDescriptionsEqual &&
                areVariableVectorMapsEqual(
                    first.variableVectorMap,
                    second.variableVectorMap
                )
            );
        },
        [areVariableVectorMapsEqual]
    );

    React.useEffect(() => {
        if (activeExpression !== store.state.activeExpression) {
            setActiveExpression(store.state.activeExpression);
        }
        if (editableExpression !== store.state.editableExpression) {
            setEditableExpression(store.state.editableExpression);
        }
        if (disabled !== (store.state.activeExpression.id === "")) {
            setDisabled(store.state.activeExpression.id === "");
        }
        setIsExpressionEdited(
            !areExpressionsEqual(
                store.state.activeExpression,
                store.state.editableExpression
            )
        );
    }, [
        store.state.activeExpression,
        store.state.editableExpression,
        areExpressionsEqual,
    ]);

    const handleSaveClick = React.useCallback((): void => {
        if (!store.state.editableExpression.isValid) {
            return;
        }

        store.dispatch({
            type: StoreActions.SaveEditableExpression,
            payload: {},
        });
    }, [store.state.editableExpression.isValid]);

    const handleCancelClick = React.useCallback((): void => {
        store.dispatch({
            type: StoreActions.ResetEditableExpression,
            payload: {},
        });
    }, [store]);

    return (
        <Grid
            container
            item
            component={Paper}
            className="ExpressionInputComponent"
            xs={12}
            spacing={3}
            direction="column"
        >
            <Grid item>
                <ExpressionNameTextField
                    vectors={props.vectors}
                    disabled={disabled}
                />
            </Grid>
            <Grid item>
                <ExpressionInputTextField disabled={disabled} />
            </Grid>
            <Grid item>
                <ExpressionDescriptionTextField
                    disabled={disabled}
                    maxLength={props.maxExpressionDescriptionLength}
                />
            </Grid>
            <Grid container item xs={12} spacing={0}>
                <VariablesTable
                    vectorData={props.vectors}
                    disabled={
                        disabled ||
                        expressionStatus === ExpressionStatus.Evaluating
                    }
                />
            </Grid>
            <Grid container item spacing={2} justify="flex-end">
                <Grid item>
                    <Button
                        onClick={handleCancelClick}
                        disabled={disabled || !isExpressionEdited}
                        variant="outlined"
                    >
                        <Icon key="cancel" name="clear" />
                        Cancel
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        onClick={handleSaveClick}
                        disabled={
                            disabled ||
                            !store.state.editableExpression.isValid ||
                            !isExpressionEdited
                        }
                    >
                        <Icon key="save" name="save" />
                        Save
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};
