import React from "react";
import Grid from "@material-ui/core/Grid";
import { Button } from "@equinor/eds-core-react";

import {
    ExpressionType,
    ExternalParseData,
} from "../utils/VectorCalculatorTypes";
import { SaveDialog } from "./SaveDialog";
import { ExpressionsTableComponent } from "./ExpressionsTableComponent";
import { ExpressionInputComponent } from "./ExpressionInputComponent";
import { TreeDataNode } from "@webviz/core-components";

import {
    createVariableVectorMapFromVariables,
    isVariableVectorMapValid,
} from "../utils/VectorCalculatorHelperFunctions";

import {
    ExpressionStatus,
    createExpressionTypeFromEditableData,
    StoreActions,
    useStore,
} from "./ExpressionsStore";

interface ParentProps {
    expressions?: ExpressionType[];
    externalParseExpression?: ExpressionType;
}

interface VectorCalculatorProps {
    id: string;
    vectors: TreeDataNode[];
    expressions: ExpressionType[];
    isDashControlled: boolean;
    maxExpressionDescriptionLength: number;
    externalParseData?: ExternalParseData;
    setProps: (props: ParentProps) => void;
}

export const VectorCalculatorComponent: React.FC<VectorCalculatorProps> = (
    props: VectorCalculatorProps
) => {
    const store = useStore();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    React.useEffect(() => {
        /// Ensure external parsing for active expression
        if (
            !props.externalParseData ||
            !store.state.externalParsing ||
            props.externalParseData.id !== store.state.activeExpression.id
        ) {
            return;
        }

        const status = props.externalParseData.isValid
            ? ExpressionStatus.Valid
            : ExpressionStatus.Invalid;

        store.dispatch({
            type: StoreActions.SetEditableExpressionStatus,
            payload: {
                status: status,
            },
        });
        store.dispatch({
            type: StoreActions.SetParseMessage,
            payload: { message: props.externalParseData.message },
        });

        if (status === ExpressionStatus.Valid) {
            // Create map with cached map
            const newVariableVectorMap = createVariableVectorMapFromVariables(
                props.externalParseData.variables,
                store.state.cachedVariableVectorMap
            );
            const newStatus = isVariableVectorMapValid(
                newVariableVectorMap,
                ":",
                props.vectors
            );
            store.dispatch({
                type: StoreActions.SetVariableVectorMap,
                payload: {
                    variableVectorMap: newVariableVectorMap,
                    status: newStatus,
                },
            });
        }
    }, [props.externalParseData]);

    React.useEffect(() => {
        const expressions = store.state.expressions;
        // Only send valid expressions
        const outputExpressions = expressions.filter(
            (expression) => expression.isValid
        );

        if (outputExpressions !== props.expressions) {
            props.setProps({ expressions: outputExpressions });
        }
    }, [store.state.expressions, props.setProps]);

    React.useEffect(() => {
        if (store.state.externalParsing) {
            // Build expression:
            const externalParsingExpression =
                createExpressionTypeFromEditableData(store.state);

            props.setProps({
                externalParseExpression: externalParsingExpression,
            });
        }
    }, [store.state.editableExpression]);

    const handleOpenClick = React.useCallback(() => {
        console.log("Open pushed!");
        setIsDialogOpen(true);
    }, [setIsDialogOpen]);
    const handleOnSave = () => {
        setIsDialogOpen(false);
        console.log("Save pushed");
    };
    const handleOnClose = () => {
        setIsDialogOpen(false);
        console.log("Closed dialog");
    };

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <ExpressionsTableComponent />
                </Grid>
                <Grid item xs={6}>
                    <ExpressionInputComponent
                        vectors={props.vectors}
                        maxExpressionDescriptionLength={
                            props.maxExpressionDescriptionLength
                        }
                    />
                </Grid>
            </Grid>
            <Button onClick={handleOpenClick}>Open</Button>
            <SaveDialog
                open={isDialogOpen}
                onSave={handleOnSave}
                onClose={handleOnClose}
            />
        </div>
    );
};
