/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import Grid from "@mui/material/Grid";

import type {
    ExpressionType,
    ExternalParseData,
} from "../utils/VectorCalculatorTypes";
import { ExpressionsTableComponent } from "./ExpressionsTableComponent";
import { ExpressionEditComponent } from "./ExpressionEditComponent";
import type { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector";

import {
    createExpressionTypeFromEditableData,
    StoreActions,
    useStore,
} from "./ExpressionsStore";

import "../VectorCalculator.css";

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
    const vectorCalculatorRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        /// Ensure external parsing for active expression
        if (
            !props.externalParseData ||
            !props.isDashControlled ||
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
        // Only send valid expressions
        const outputExpressions = store.state.expressions.filter(
            (expression) => expression.isValid
        );

        if (outputExpressions !== props.expressions) {
            props.setProps({ expressions: outputExpressions });
        }
    }, [store.state.expressions, props.setProps]);

    React.useEffect(() => {
        if (props.isDashControlled) {
            // Build ExpressionType for external parsing
            const externalParsingExpression =
                createExpressionTypeFromEditableData(store.state);
            props.setProps({
                externalParseExpression: externalParsingExpression,
            });
        }
    }, [store.state.editableExpression]);

    return (
        <div ref={vectorCalculatorRef} className={"VectorCalculator"}>
            <Grid
                container
                spacing={3}
                alignItems="stretch"
                justifyContent="space-between"
            >
                <ExpressionsTableComponent containerRef={vectorCalculatorRef} />
                <ExpressionEditComponent
                    vectors={props.vectors}
                    externalParsing={props.isDashControlled}
                    maxExpressionDescriptionLength={
                        props.maxExpressionDescriptionLength
                    }
                />
            </Grid>
        </div>
    );
};
