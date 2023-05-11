/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";

import { Button, Icon } from "@equinor/eds-core-react";
import { clear, save, sync } from "@equinor/eds-icons";
Icon.add({ clear, save, sync });

import { Grid } from "@material-ui/core";
import { TreeDataNode } from "@webviz/core-components";

import { VectorSelectorTable } from "./components/VectorSelectorTable";
import { ExpressionDescriptionTextField } from "./components/ExpressionDescriptionTextField";
import { ExpressionNameTextField } from "./components/ExpressionNameTextField";
import { ExpressionInputTextField } from "./components/ExpressionInputTextField";

import {
    isExpressionEdited,
    StoreActions,
    useStore,
    ExpressionStatus,
} from "../ExpressionsStore";

import "../../VectorCalculator.css";

interface ExpressionEditComponentProps {
    vectors: TreeDataNode[];
    externalParsing: boolean;
    maxExpressionDescriptionLength: number;
}

export const ExpressionEditComponent: React.FC<ExpressionEditComponentProps> = (
    props: ExpressionEditComponentProps
) => {
    const store = useStore();
    const [disabled, setDisabled] = React.useState<boolean>(
        store.state.activeExpression.id === ""
    );
    const [expressionDataEdited, setExpressionDataEdited] =
        React.useState<boolean>(false);

    const [expressionStatus, setExpressionStatus] =
        React.useState<ExpressionStatus>(ExpressionStatus.Evaluating);
    const [nameValid, setNameValid] = React.useState<boolean>(false);
    const [variableVectorMapValid, setVariableVectorMapValid] =
        React.useState<boolean>(false);

    React.useEffect(() => {
        if (disabled !== (store.state.activeExpression.id === "")) {
            setDisabled(store.state.activeExpression.id === "");
        }

        setExpressionDataEdited(isExpressionEdited(store.state));
    }, [
        store.state.activeExpression,
        store.state.editableExpression,
        store.state.editableName,
        store.state.editableDescription,
        store.state.editableVariableVectorMap,
    ]);

    const handleSaveClick = React.useCallback((): void => {
        if (!store.state.editableExpressionTypeValid) {
            return;
        }

        store.dispatch({
            type: StoreActions.SaveEditableExpression,
        });
    }, [store.state.editableExpressionTypeValid]);

    const handleCancelClick = React.useCallback((): void => {
        store.dispatch({
            type: StoreActions.ResetEditableExpression,
        });
    }, [store]);

    React.useEffect(() => {
        store.dispatch({
            type: StoreActions.SetExpressionTypeValid,
            payload: {
                isValid:
                    nameValid &&
                    variableVectorMapValid &&
                    expressionStatus === ExpressionStatus.Valid,
            },
        });
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
            className="ExpressionEditComponent"
            container
            item
            direction="column"
            alignItems="stretch"
            xs={6}
        >
            <Grid item className="ExpressionNameTextFieldGridItem">
                <ExpressionNameTextField
                    vectors={props.vectors}
                    disabled={disabled}
                    onValidChanged={handleNameValidChange}
                />
            </Grid>
            <Grid item className="ExpressionInputTextFieldGridItem">
                <ExpressionInputTextField
                    externalParsing={props.externalParsing}
                    disabled={disabled}
                    onStatusChanged={handleExpressionStatusChanged}
                />
            </Grid>
            <Grid item className="ExpressionDescriptionTextFieldGridItem">
                <ExpressionDescriptionTextField
                    disabled={disabled}
                    maxLength={props.maxExpressionDescriptionLength}
                />
            </Grid>
            <Grid
                item
                className="TableWrapperGridItem VectorSelectorTableGridItem"
            >
                <VectorSelectorTable
                    vectorData={props.vectors}
                    disabled={
                        disabled ||
                        expressionStatus === ExpressionStatus.Evaluating
                    }
                    onValidChanged={handleVariableVectorMapValidChanged}
                />
            </Grid>
            <Grid
                className="ActionButtonsGridItem"
                container
                item
                spacing={2}
                justify="flex-end"
                alignContent="flex-end"
            >
                <Grid item>
                    <Button
                        onClick={handleCancelClick}
                        disabled={disabled || !expressionDataEdited}
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
                            !store.state.editableExpressionTypeValid ||
                            !expressionDataEdited
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
