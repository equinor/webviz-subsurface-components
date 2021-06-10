import React, { useCallback } from "react";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import cloneDeep from "lodash/cloneDeep";

import {
    ExpressionType,
    ExternalParseData,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";

import { ExpressionNameTextField } from "./ExpressionNameTextField";
import {
    ExpressionInputTextField,
    ExpressionStatus,
} from "./ExpressionInputTextField";
import { VariablesTable } from "./VariablesTable";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { isVariableVectorMapValid } from "../utils/VectorCalculatorHelperFunctions";
import {
    parseExpression,
    parseName,
    retrieveVariablesFromValidExpression,
} from "../utils/VectorCalculatorRegex";
import "../VectorCalculator.css";

interface ExpressionInputComponent {
    activeExpression: ExpressionType;
    expressions: ExpressionType[];
    vectors: TreeDataNode[];
    externalParsing: boolean;
    externalParseData?: ExternalParseData;
    disabled?: boolean;
    onExpressionChange: (expression: ExpressionType) => void;
    onExternalExpressionParsing: (expression: ExpressionType) => void;
}

export const ExpressionInputComponent: React.FC<ExpressionInputComponent> = (
    props: ExpressionInputComponent
) => {
    const { activeExpression, expressions, externalParsing, disabled } = props;
    const [isValidName, setIsValidName] = React.useState<boolean>(
        parseName(activeExpression.name)
    );
    const [expressionStatus, setExpressionStatus] =
        React.useState<ExpressionStatus>(ExpressionStatus.Valid); // TODO: Set correct initial value (external parsing?)
    const [isValidVariableVectorMap, setIsValidVariableVectorMap] =
        React.useState<boolean>(
            isVariableVectorMapValid(
                activeExpression.variableVectorMap,
                ":",
                props.vectors
            )
        );
    const [isValid, setIsValid] = React.useState<boolean>(
        isValidName &&
            expressionStatus == ExpressionStatus.Valid &&
            isValidVariableVectorMap
    );
    const [editableExpression, setEditableExpression] =
        React.useState<ExpressionType>(activeExpression);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>([]);

    Icon.add({ clear });
    Icon.add({ save });
    Icon.add({ sync });

    React.useEffect(() => {
        setIsValid(
            isValidName &&
                expressionStatus == ExpressionStatus.Valid &&
                isValidVariableVectorMap
        );
    }, [isValidName, expressionStatus, isValidVariableVectorMap]);

    React.useEffect(() => {
        if (props.externalParseData === undefined) {
            return;
        }

        // Ensure evaluated expression is equal current editable expression
        if (
            props.externalParseData.id !== editableExpression.id ||
            props.externalParseData.expression !== editableExpression.expression
        ) {
            return;
        }

        const newEditabledExpression = cloneDeep(editableExpression);

        setExpressionStatus(
            props.externalParseData.isValid
                ? ExpressionStatus.Valid
                : ExpressionStatus.Invalid
        );

        // Update variable vector map when valid expression
        if (props.externalParseData.isValid) {
            newEditabledExpression.variableVectorMap =
                getVariableVectorMapFromVariables(
                    props.externalParseData.variables
                );
        }

        setEditableExpression(newEditabledExpression);
        setIsValidVariableVectorMap(
            isVariableVectorMapValid(
                newEditabledExpression.variableVectorMap,
                ":",
                props.vectors
            )
        );
    }, [props.externalParseData]);

    React.useEffect(() => {
        const activeExpressionClone = cloneDeep(activeExpression);
        const variableVectorMapClone = cloneDeep(
            activeExpression.variableVectorMap
        );
        setEditableExpression(activeExpressionClone);
        setCachedVariableVectorMap(variableVectorMapClone);

        setIsValidName(parseName(activeExpressionClone.name));
        setIsValidVariableVectorMap(
            isVariableVectorMapValid(
                activeExpressionClone.variableVectorMap,
                ":",
                props.vectors
            )
        );

        if (externalParsing) {
            props.onExternalExpressionParsing(activeExpressionClone);
        } else {
            setExpressionStatus(
                parseExpression(activeExpressionClone.expression)
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
        }
    }, [activeExpression]);

    const handleSaveClick = (): void => {
        if (!isValid) {
            return;
        }

        const newExpression: ExpressionType = {
            ...editableExpression,
            isValid: isValid,
        };
        props.onExpressionChange(newExpression);
    };

    const handleCancelClick = (): void => {
        setEditableExpression(activeExpression);

        if (externalParsing) {
            props.onExternalExpressionParsing(activeExpression);
        } else {
            setExpressionStatus(
                parseExpression(activeExpression.expression)
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
        }
    };

    const onNameChange = (newName: string): void => {
        setEditableExpression({ ...editableExpression, name: newName });
    };
    const onValidNameChange = (isValid: boolean): void => {
        setIsValidName(isValid);
    };

    const onExpressionChange = (newExpression: string): void => {
        const updatedExpression = {
            ...editableExpression,
            expression: newExpression,
        };

        // Handle parsing externally
        if (externalParsing) {
            setEditableExpression(updatedExpression);
            setExpressionStatus(ExpressionStatus.Evaluating);
            props.onExternalExpressionParsing(updatedExpression);
        } else {
            // TODO: Now the function returns editableExpression map from expression string character
            // Replace with same logic as for external parsing: Provide list of variables in expression
            // E.g.: Currently log(x+y) gives issue as log is a func
            const newMap =
                getVariableVectorMapFromExpression(updatedExpression);
            updatedExpression.variableVectorMap = newMap;

            setIsValidVariableVectorMap(
                isVariableVectorMapValid(newMap, ":", props.vectors)
            );
            setExpressionStatus(
                parseExpression(updatedExpression.expression)
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
            setEditableExpression(updatedExpression);
        }
    };

    const onVariableVectorMapChange = (
        newVariableVectorMap: VariableVectorMapType[]
    ): void => {
        setCachedVariableVectorMap(
            getUpdatedCachedVariableVectorMap(newVariableVectorMap)
        );

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
            const newCachedVariableVectorMap = cloneDeep(
                cachedVariableVectorMap
            );
            for (const elm of newMap) {
                const cachedElm: VariableVectorMapType | undefined =
                    newCachedVariableVectorMap.find(
                        (cachedElm) =>
                            cachedElm.variableName === elm.variableName
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
        (expression: ExpressionType): VariableVectorMapType[] => {
            if (expression.expression.length === 0) {
                return [];
            }
            if (!parseExpression(expression.expression)) {
                return cloneDeep(editableExpression.variableVectorMap);
            }

            // Replace with parse lib which handles funcitons and provides list of variables
            // E.g.: Currently log(x+y) gives issue as log is a func
            const variables: string[] = retrieveVariablesFromValidExpression(
                expression.expression
            );
            return getVariableVectorMapFromVariables(variables);
        },
        [
            parseExpression,
            retrieveVariablesFromValidExpression,
            editableExpression,
            cachedVariableVectorMap,
        ]
    );

    const getVariableVectorMapFromVariables = useCallback(
        (variables: string[]): VariableVectorMapType[] => {
            const map: VariableVectorMapType[] = [];
            for (const variable of variables) {
                const cachedElm: VariableVectorMapType | undefined =
                    cachedVariableVectorMap.find(
                        (elm) => elm.variableName === variable
                    );
                if (cachedElm === undefined) {
                    map.push({ variableName: variable, vectorName: [] });
                } else {
                    map.push(cachedElm);
                }
            }
            return map;
        },
        [cachedVariableVectorMap]
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
                    status={expressionStatus}
                    disabled={disabled}
                    onExpressionChange={onExpressionChange}
                />
            </Grid>
            <Grid container item xs={12} spacing={0}>
                <VariablesTable
                    variableVectorMap={editableExpression.variableVectorMap}
                    vectorData={props.vectors}
                    disabled={
                        disabled ||
                        expressionStatus === ExpressionStatus.Evaluating
                    }
                    onMapChange={onVariableVectorMapChange}
                />
            </Grid>
            <Grid container item spacing={4} justify="flex-start">
                <Grid item>
                    <Button
                        onClick={handleSaveClick}
                        disabled={disabled || !isValid}
                    >
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
