import React from "react";

import { cloneDeep } from "lodash";

import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import { TreeDataNode } from "@webviz/core-components";

import { VariablesTable } from "./VariablesTable";
import { ExpressionDescriptionTextField } from "./ExpressionDescriptionTextField";
import { ExpressionNameTextField } from "./ExpressionNameTextField";
import { ExpressionInputTextField } from "./ExpressionInputTextField";

import {
    areVariableVectorMapsEqual,
    getVariablesFromMap,
} from "../utils/VectorCalculatorHelperFunctions";

import { StoreActions, useStore, ExpressionStatus } from "./ExpressionsStore";

import { ExpressionType } from "../utils/VectorCalculatorTypes";

import "!style-loader!css-loader!../VectorCalculator.css";

interface ExpressionInputComponent {
    vectors: TreeDataNode[];
    maxExpressionDescriptionLength: number;
}

export const ExpressionInputComponent: React.FC<ExpressionInputComponent> = (
    props: ExpressionInputComponent
) => {
    const store = useStore();
    const [disabled, setDisabled] = React.useState<boolean>(
        store.state.activeExpression.id === ""
    );
    const [isExpressionEdited, setIsExpressionEdited] =
        React.useState<boolean>(false);

    const [expressionStatus, setExpressionStatus] =
        React.useState<ExpressionStatus>(ExpressionStatus.Evaluating);
    const [nameValid, setNameValid] = React.useState<boolean>(false);
    const [variableVectorMapValid, setVariableVectorMapValid] =
        React.useState<boolean>(false);
    const [expressionTypeValid, setExpressionTypeValid] =
        React.useState<boolean>(false);

    Icon.add({ clear, save, sync });

    const areExpressionsEqual = React.useCallback(
        (first: ExpressionType, second: ExpressionType): boolean => {
            const areIdsEqual = first.id === second.id;
            const areNamesEqual = first.name === second.name;
            const areExpressionsEqual = first.expression === second.expression;
            const areDescriptionsEqual =
                first.description === second.description;
            const areIsValidsEqual = first.isValid === second.isValid;
            const areIsDeletableEqual =
                first.isDeletable === second.isDeletable;

            return (
                areIdsEqual &&
                areNamesEqual &&
                areExpressionsEqual &&
                areDescriptionsEqual &&
                areIsValidsEqual &&
                areIsDeletableEqual &&
                areVariableVectorMapsEqual(
                    first.variableVectorMap,
                    second.variableVectorMap
                )
            );
        },
        [areVariableVectorMapsEqual]
    );

    React.useEffect(() => {
        if (disabled !== (store.state.activeExpression.id === "")) {
            setDisabled(store.state.activeExpression.id === "");
        }

        const areEqual =
            store.state.activeExpression.name === store.state.editableName &&
            store.state.activeExpression.expression ===
                store.state.editableExpression &&
            store.state.activeExpression.description ===
                store.state.editableDescription &&
            areVariableVectorMapsEqual(
                store.state.activeExpression.variableVectorMap,
                store.state.editableVariableVectorMap
            );
        setIsExpressionEdited(!areEqual);
    }, [
        store.state.activeExpression,
        store.state.editableExpression,
        store.state.editableName,
        store.state.editableDescription,
        store.state.editableVariableVectorMap,
    ]);

    const handleSaveClick = React.useCallback((): void => {
        if (!expressionTypeValid) {
            return;
        }

        store.dispatch({
            type: StoreActions.SaveEditableExpression,
            payload: {},
        });
    }, [expressionTypeValid]);

    const handleCancelClick = React.useCallback((): void => {
        // store.dispatch({
        //     type: StoreActions.ResetEditableExpression,
        //     payload: {},
        // });

        store.dispatch({
            type: StoreActions.SetExpression,
            payload: { expression: store.state.activeExpression.expression },
        });
        store.dispatch({
            type: StoreActions.SetName,
            payload: { name: store.state.activeExpression.name },
        });
        store.dispatch({
            type: StoreActions.SetDescription,
            payload: {
                description: store.state.activeExpression.description
                    ? store.state.activeExpression.description
                    : "",
            },
        });
        store.dispatch({
            type: StoreActions.SetVariableVectorMap,
            payload: {
                variableVectorMap: cloneDeep(
                    store.state.activeExpression.variableVectorMap
                ),
            },
        });
        store.dispatch({
            type: StoreActions.SetParsingData,
            payload: {
                data: {
                    isValid: true,
                    parsingMessage: "",
                    variables: getVariablesFromMap(
                        store.state.activeExpression.variableVectorMap
                    ),
                },
            },
        });
    }, [store]);

    const handleNameValidChange = (isValid: boolean): void => {
        setExpressionTypeValid(
            isValid &&
                variableVectorMapValid &&
                expressionStatus === ExpressionStatus.Valid
        );
        setNameValid(isValid);
    };

    const handleExpressionStatusChanged = (status: ExpressionStatus): void => {
        setExpressionTypeValid(
            status === ExpressionStatus.Valid &&
                variableVectorMapValid &&
                nameValid
        );
        setExpressionStatus(status);
    };

    const handleVariableVectorMapValidChanged = (isValid: boolean): void => {
        setExpressionTypeValid(
            isValid && nameValid && expressionStatus === ExpressionStatus.Valid
        );
        setVariableVectorMapValid(isValid);
    };

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
                    onValidChanged={handleNameValidChange}
                />
            </Grid>
            <Grid item>
                <ExpressionInputTextField
                    disabled={disabled}
                    onStatusChanged={handleExpressionStatusChanged}
                />
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
                    onValidChanged={handleVariableVectorMapValidChanged}
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
                            !expressionTypeValid ||
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
