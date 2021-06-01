import React from 'react';
import Grid from '@material-ui/core/Grid';
import { validate as isUuid } from 'uuid';

import { ExpressionType } from '../utils/VectorCalculatorTypes';
import { ExpressionsTableComponent } from './ExpressionsTableComponent';
import { ExpressionInputComponent } from './ExpressionInputComponent';
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";
import { parseExpression, parseExpressionName } from '../utils/VectorCalculatorRegex';
import { isVariableVectorMapValid } from '../utils/VectorCalculatorHelperFunctions';

interface ParentProps {
    expressions: ExpressionType[]
};

interface VectorCalculatorProps {
    id: string,
    vectors: TreeDataNode[],
    expressions: ExpressionType[],
    isDashControlled: boolean,
    setProps: (props: ParentProps) => void,
};

export const VectorCalculatorComponent: React.FC<VectorCalculatorProps> = (props: VectorCalculatorProps) => {
    const [expressions, setExpressions] = React.useState<ExpressionType[]>(props.expressions);
    const [activeExpression, setActiveExpression] = React.useState<ExpressionType>({ name: "", expression: "", id: "", variableVectorMap: [] });
    const [disabledInputComponent, setDisabledInputComponent] = React.useState<boolean>(true);

    React.useEffect(() => {
        // Intention: Validation of expressions handled back-end
        if (expressions !== props.expressions) {
            props.setProps({ expressions: expressions });
        }
    }, [expressions]);

    const handleActiveExpressionChange = (expression: ExpressionType | undefined) => {
        setDisabledInputComponent(expression === undefined);

        if (expression === undefined) {
            setActiveExpression({ name: "", expression: "", id: "", variableVectorMap: [] });
        }
        else { setActiveExpression(expression); }
    };

    const handleExpressionsChange = (expressions: ExpressionType[]) => {
        setExpressions(expressions);
    };

    const handleActiveExpressionEdit = (expression: ExpressionType): void => {
        if (activeExpression === undefined) { return; }

        const newExpressions = expressions.map(elm => {
            if (elm.id === activeExpression.id) {
                const editedExpression = expression;
                setActiveExpression(editedExpression);
                return editedExpression;
            }
            return elm;
        })
        setExpressions(newExpressions);
    };

    return (
        <Grid container spacing={3} >
            <Grid item xs={4}>
                <ExpressionsTableComponent
                    expressions={expressions}
                    onActiveExpressionChange={handleActiveExpressionChange}
                    onExpressionsChange={handleExpressionsChange}
                />
            </Grid>
            <Grid item xs={6}>
                <ExpressionInputComponent
                    activeExpression={activeExpression}
                    expressions={expressions}
                    vectors={props.vectors}
                    disabled={disabledInputComponent}
                    onExpressionChange={handleActiveExpressionEdit}
                />
            </Grid>
        </Grid >
    );
};
