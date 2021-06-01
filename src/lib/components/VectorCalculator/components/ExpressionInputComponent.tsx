import React, { useCallback } from "react";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import cloneDeep from "lodash.clonedeep";

import {
    ExpressionType,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";

import { ExpressionNameTextField } from "./ExpressionNameTextField";
import { ExpressionInputTextField } from "./ExpressionInputTextField";
import { VariablesTable } from "./VariablesTable";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { isVariableVectorMapValid } from "../utils/VectorCalculatorHelperFunctions";
import {
    parseExpression,
    retrieveVariablesFromExpression,
    parseExpressionName,
} from "../utils/VectorCalculatorRegex";
import "../VectorCalculator.css";

interface ExpressionInputComponent {
    activeExpression: ExpressionType;
    expressions: ExpressionType[];
    vectors: TreeDataNode[];
    disabled?: boolean;
    onExpressionChange: (expression: ExpressionType) => void;
}

export const ExpressionInputComponent: React.FC<ExpressionInputComponent> = (
    props: ExpressionInputComponent
) => {
    const { activeExpression, expressions, disabled } = props;
    const [isValidName, setIsValidName] = React.useState(true);
    const [isValidExpression, setIsValidExpression] = React.useState(
        parseExpression(activeExpression.expression)
    );
    const [
        isValidVariableVectorMap,
        setIsValidVariableVectorMap,
    ] = React.useState(
        isVariableVectorMapValid(
            activeExpression.variableVectorMap,
            ":",
            props.vectors
        )
    );
    const [
        editableExpression,
        setEditableExpression,
    ] = React.useState<ExpressionType>({
        name: "",
        expression: "",
        id: "",
        variableVectorMap: [],
    });
    const [
        cachedVariableVectorMap,
        setCachedVariableVectorMap,
    ] = React.useState<VariableVectorMapType[]>([]);

    Icon.add({ clear });
    Icon.add({ save });
    Icon.add({ sync });

    React.useEffect(() => {
        const activeExpressionClone = cloneDeep(activeExpression);
        const variableVectorMapClone = cloneDeep(
            activeExpression.variableVectorMap
        );
        setEditableExpression(activeExpressionClone);
        setCachedVariableVectorMap(variableVectorMapClone);

        setIsValidName(parseExpressionName(activeExpressionClone.name));
        setIsValidExpression(parseExpression(activeExpressionClone.expression));
        setIsValidVariableVectorMap(
            isVariableVectorMapValid(
                activeExpressionClone.variableVectorMap,
                ":",
                props.vectors
            )
        );
    }, [activeExpression]);

    const handleSaveClick = (): void => {
        if (!isValidName || !isValidExpression || !isValidVariableVectorMap) {
            return;
        }

        const newExpression: ExpressionType = { ...editableExpression };
        props.onExpressionChange(newExpression);
    };

    const handleCancelClick = (): void => {
        setEditableExpression(activeExpression);
    };

    const onNameChange = (newName: string): void => {
        setEditableExpression({ ...editableExpression, name: newName });
    };
    const onValidNameChange = (isValid: boolean): void => {
        setIsValidName(isValid);
    };

    const onExpressionChange = (newExpression: string): void => {
        const newMap = getVariableVectorMapFromExpression(newExpression);

        setIsValidVariableVectorMap(
            isVariableVectorMapValid(newMap, ":", props.vectors)
        );
        setEditableExpression({
            ...editableExpression,
            expression: newExpression,
            variableVectorMap: newMap,
        });
    };
    const onValidExpressionChange = (isValid: boolean): void => {
        setIsValidExpression(isValid);
    };

    const onVariableVectorMapChange = (
        newVariableVectorMap: VariableVectorMapType[]
    ): void => {
        const newCachedMap = getUpdatedCachedVariableVectorMap(
            newVariableVectorMap
        );
        setCachedVariableVectorMap(newCachedMap);

        setIsValidVariableVectorMap(
            isVariableVectorMapValid(newVariableVectorMap, ":", props.vectors)
        );
        setEditableExpression({
            ...editableExpression,
            variableVectorMap: newVariableVectorMap,
        });
    };

    const getUpdatedCachedVariableVectorMap = useCallback(
        (newMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap: VariableVectorMapType[] = [];
            for (const elm of newMap) {
                const cachedElm:
                    | VariableVectorMapType
                    | undefined = cachedVariableVectorMap.find(
                    (cachedElm) => cachedElm.variableName === elm.variableName
                );
                if (cachedElm === undefined) {
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

    const getVariableVectorMapFromExpression = useCallback(
        (expression: string): VariableVectorMapType[] => {
            if (expression.length === 0) {
                return [];
            }
            if (!parseExpression(expression)) {
                return cloneDeep(editableExpression.variableVectorMap);
            }

            const variables: string[] = retrieveVariablesFromExpression(
                expression
            );
            const map: VariableVectorMapType[] = [];
            for (const variable of variables) {
                const existingMap:
                    | VariableVectorMapType
                    | undefined = cachedVariableVectorMap.find(
                    (elm) => elm.variableName === variable
                );
                if (existingMap === undefined) {
                    map.push({ variableName: variable, vectorName: [] });
                } else {
                    map.push(existingMap);
                }
            }
            return map;
        },
        [
            parseExpression,
            retrieveVariablesFromExpression,
            editableExpression,
            cachedVariableVectorMap,
        ]
    );

    return (
        <Grid
            container
            className="VectorCalculator__ExpressionInputComponent"
            component={Paper}
            item
            xs={12}
            spacing={3}
            direction="column"
        >
            <Grid item>
                <ExpressionNameTextField
                    initialName={activeExpression.name}
                    currentName={editableExpression.name}
                    existingExpressions={expressions}
                    disabled={disabled}
                    onNameChange={onNameChange}
                    onValidChange={onValidNameChange}
                />
            </Grid>
            <Grid item>
                <ExpressionInputTextField
                    expression={editableExpression.expression}
                    disabled={disabled}
                    onExpressionChange={onExpressionChange}
                    onValidChanged={onValidExpressionChange}
                />
            </Grid>
            <Grid container item xs={12} spacing={0}>
                <VariablesTable
                    variableVectorMap={editableExpression.variableVectorMap}
                    vectorData={props.vectors}
                    onMapChange={onVariableVectorMapChange}
                />
            </Grid>
            <Grid container item spacing={4} justify="flex-start">
                <Grid item>
                    <Button onClick={handleSaveClick} disabled={disabled}>
                        <Icon key="save" name="save" />
                        Save
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        onClick={handleCancelClick}
                        disabled={disabled}
                        variant="outlined"
                    >
                        <Icon key="cancel" name="clear" />
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};
