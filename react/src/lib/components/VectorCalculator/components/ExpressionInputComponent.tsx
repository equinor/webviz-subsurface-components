import React from "react";

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

import "!style-loader!css-loader!../VectorCalculator.css";

interface ExpressionInputComponent {
    vectors: TreeDataNode[];
    externalParsing: boolean;
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
        store.dispatch({
            type: StoreActions.ResetEditableExpression,
            payload: {},
        });
    }, [store]);

    React.useEffect(() => {
        setExpressionTypeValid(
            nameValid &&
                variableVectorMapValid &&
                expressionStatus === ExpressionStatus.Valid
        );
    }, [nameValid, expressionStatus, variableVectorMapValid]);

    const handleNameValidChange = (isValid: boolean): void => {
        setNameValid(isValid);
    };

    const handleExpressionStatusChanged = (status: ExpressionStatus): void => {
        setExpressionStatus(status);
    };

    const handleVariableVectorMapValidChanged = (isValid: boolean): void => {
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
                    externalParsing={props.externalParsing}
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
