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
        console.log("*** External parse data received ***");
        console.log(`Active expression id: ${store.state.activeExpression.id}`);
        console.log(
            `External parse data id: ${
                props.externalParseData
                    ? props.externalParseData.id
                    : "undefined external parse data"
            }`
        );
        /// Ensure external parsing for active expression
        if (
            !props.externalParseData ||
            !store.state.externalParsing ||
            props.externalParseData.id !== store.state.activeExpression.id
        ) {
            return;
        }

        store.dispatch({
            type: StoreActions.SetParsingData,
            payload: {
                data: {
                    isValid: props.externalParseData.isValid,
                    parsingMessage: props.externalParseData.message,
                    variables: props.externalParseData.variables,
                },
            },
        });
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
            console.log("*** Send expression external parsing ***");
            console.log(`Expression status: ${store.state.editableExpression}`);

            // Build expression:
            const externalParsingExpression =
                createExpressionTypeFromEditableData(store.state);

            console.log(`Expression: ${externalParsingExpression}`);

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
