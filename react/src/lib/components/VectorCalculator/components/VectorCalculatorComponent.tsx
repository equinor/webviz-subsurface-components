import React from "react";
import Grid from "@material-ui/core/Grid";

import {
    ExpressionType,
    ExternalParseData,
} from "../utils/VectorCalculatorTypes";
import { ExpressionsTableComponent } from "./ExpressionsTableComponent";
import { ExpressionInputComponent } from "./ExpressionInputComponent";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

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
    const { isDashControlled } = props;
    const [expressions, setExpressions] = React.useState<ExpressionType[]>(
        props.expressions
    );
    const [activeExpression, setActiveExpression] =
        React.useState<ExpressionType>({
            name: "",
            expression: "",
            id: "",
            variableVectorMap: [],
            isValid: false,
            isDeletable: true,
        });
    const [disabledInputComponent, setDisabledInputComponent] =
        React.useState<boolean>(true);

    React.useEffect(() => {
        setExpressions(props.expressions);
    }, [props.expressions]);

    React.useEffect(() => {
        // Only send valid expressions
        const outputExpressions = expressions.filter(
            (expression) => expression.isValid
        );

        if (outputExpressions !== props.expressions) {
            props.setProps({ expressions: outputExpressions });
        }
    }, [expressions, props.setProps]);

    const handleActiveExpressionChange = React.useCallback(
        (expression: ExpressionType | undefined) => {
            setDisabledInputComponent(expression === undefined);

            if (expression === undefined) {
                setActiveExpression({
                    name: "",
                    expression: "",
                    id: "",
                    variableVectorMap: [],
                    isValid: false,
                    isDeletable: true,
                });
            } else {
                setActiveExpression(expression);
            }
        },
        [setActiveExpression, setDisabledInputComponent]
    );

    const handleExpressionsChange = (expressions: ExpressionType[]) => {
        setExpressions(expressions);
    };

    const handleActiveExpressionEdit = React.useCallback(
        (expression: ExpressionType): void => {
            if (activeExpression === undefined) {
                return;
            }

            const newExpressions = expressions.map((elm) => {
                if (elm.id === activeExpression.id) {
                    const editedExpression = expression;
                    setActiveExpression(editedExpression);
                    return editedExpression;
                }
                return elm;
            });
            setExpressions(newExpressions);
        },
        [activeExpression, expressions, setActiveExpression, setExpressions]
    );

    const handleExternalExpressionParsing = React.useCallback(
        (expression: ExpressionType): void => {
            props.setProps({ externalParseExpression: expression });
        },
        [props.setProps]
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <ExpressionsTableComponent
                    expressions={expressions}
                    onActiveExpressionChange={handleActiveExpressionChange}
                    onExpressionsChange={handleExpressionsChange}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <ExpressionInputComponent
                    activeExpression={activeExpression}
                    expressions={expressions}
                    vectors={props.vectors}
                    externalParsing={isDashControlled}
                    externalParseData={props.externalParseData}
                    maxExpressionDescriptionLength={
                        props.maxExpressionDescriptionLength
                    }
                    disabled={disabledInputComponent}
                    onExpressionChange={handleActiveExpressionEdit}
                    onExternalExpressionParsing={
                        handleExternalExpressionParsing
                    }
                />
            </Grid>
        </Grid>
    );
};
