import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { VariablesTable } from "./VariablesTable";
import { ExpressionNameTextField } from "./ExpressionNameTextField";
import {
    ExpressionInputTextField,
    ExpressionStatus,
} from "./ExpressionInputTextField";

import {
    ExpressionType,
    ExternalParseData,
    VariableVectorMapType,
} from "../utils/VectorCalculatorTypes";
import {
    isVariableVectorMapValid,
    parseName,
} from "../utils/VectorCalculatorHelperFunctions";
import {
    expressionVariables,
    expressionParseMessage,
    validateExpression,
} from "../utils/ExpressionParser";
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
        React.useState<ExpressionStatus>(ExpressionStatus.Invalid);
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
    const [parsingMessage, setParsingMessage] = React.useState<string>("");
    const expressionParser = new ExpressionParserWrapper();

    Icon.add({ clear, save, sync });

    const getVariableVectorMapFromVariables = React.useCallback(
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

    const getVariableVectorMapFromExpression = React.useCallback(
        (expression: ExpressionType): VariableVectorMapType[] => {
            if (expression.expression.length === 0) {
                return [];
            }

            if (!validateExpression(expression.expression)) {
                return cloneDeep(editableExpression.variableVectorMap);
            }

            const variables: string[] = expressionVariables(
                expression.expression
            );

            return getVariableVectorMapFromVariables(variables);
        },
        [
            editableExpression,
            expressionVariables,
            getVariableVectorMapFromVariables,
            validateExpression,
        ]
    );

    const getUpdatedCachedVariableVectorMap = React.useCallback(
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

        setParsingMessage(props.externalParseData.message);
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
    }, [
        props.externalParseData,
        props.vectors,
        getVariableVectorMapFromVariables,
        isVariableVectorMapValid,
    ]);

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
                validateExpression(activeExpressionClone.expression)
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
            setParsingMessage(
                expressionParseMessage(activeExpressionClone.expression)
            );
        }
    }, [
        activeExpression,
        externalParsing,
        props.vectors,
        props.onExternalExpressionParsing,
        expressionParseMessage,
        parseName,
        validateExpression,
        isVariableVectorMapValid,
    ]);

    const handleSaveClick = React.useCallback((): void => {
        if (!isValid) {
            return;
        }

        const newExpression: ExpressionType = {
            ...editableExpression,
            isValid: isValid,
        };
        props.onExpressionChange(newExpression);
    }, [editableExpression, isValid, props.onExpressionChange]);

    const handleCancelClick = React.useCallback((): void => {
        setEditableExpression(activeExpression);

        if (externalParsing) {
            props.onExternalExpressionParsing(activeExpression);
        } else {
            setExpressionStatus(
                validateExpression(activeExpression.expression)
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
            setParsingMessage("");
        }
    }, [
        activeExpression,
        externalParsing,
        setEditableExpression,
        setExpressionStatus,
        setParsingMessage,
        props.onExternalExpressionParsing,
        validateExpression,
    ]);

    const handleNameChange = (newName: string): void => {
        setEditableExpression({ ...editableExpression, name: newName });
    };

    const handleValidNameChange = (isValid: boolean): void => {
        setIsValidName(isValid);
    };

    const handleExpressionChange = React.useCallback(
        (newExpression: string): void => {
            const updatedExpression = {
                ...editableExpression,
                expression: newExpression,
            };

            // Handle parsing externally
            if (externalParsing) {
                setEditableExpression(updatedExpression);
                setExpressionStatus(ExpressionStatus.Evaluating);
                setParsingMessage("");
                props.onExternalExpressionParsing(updatedExpression);
            } else {
                const newMap =
                    getVariableVectorMapFromExpression(updatedExpression);
                updatedExpression.variableVectorMap = newMap;

                setIsValidVariableVectorMap(
                    isVariableVectorMapValid(newMap, ":", props.vectors)
                );
                setExpressionStatus(
                    validateExpression(updatedExpression.expression)
                        ? ExpressionStatus.Valid
                        : ExpressionStatus.Invalid
                );
                setParsingMessage(
                    expressionParseMessage(updatedExpression.expression)
                );
                setEditableExpression(updatedExpression);
            }
        },
        [
            editableExpression,
            externalParsing,
            setEditableExpression,
            setExpressionStatus,
            setParsingMessage,
            setIsValidVariableVectorMap,
            isVariableVectorMapValid,
            expressionParseMessage,
            validateExpression,
            props.onExternalExpressionParsing,
            getVariableVectorMapFromExpression,
        ]
    );

    const handleVariableVectorMapChange = React.useCallback(
        (newVariableVectorMap: VariableVectorMapType[]): void => {
            setCachedVariableVectorMap(
                getUpdatedCachedVariableVectorMap(newVariableVectorMap)
            );

            setIsValidVariableVectorMap(
                isVariableVectorMapValid(
                    newVariableVectorMap,
                    ":",
                    props.vectors
                )
            );

            setEditableExpression({
                ...editableExpression,
                variableVectorMap: newVariableVectorMap,
            });
        },
        [
            editableExpression,
            isVariableVectorMapValid,
            getUpdatedCachedVariableVectorMap,
            setCachedVariableVectorMap,
            setEditableExpression,
            setIsValidVariableVectorMap,
        ]
    );

    return (
        <Grid
            container
            className="ExpressionInputComponent"
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
                    onNameChange={handleNameChange}
                    onValidChange={handleValidNameChange}
                />
            </Grid>
            <Grid item>
                <ExpressionInputTextField
                    expression={editableExpression.expression}
                    status={expressionStatus}
                    helperText={parsingMessage}
                    disabled={disabled}
                    onExpressionChange={handleExpressionChange}
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
                    onMapChange={handleVariableVectorMapChange}
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
