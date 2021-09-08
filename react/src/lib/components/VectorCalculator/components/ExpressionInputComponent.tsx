import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button, Icon } from "@equinor/eds-core-react";
import { Grid, Paper } from "@material-ui/core";
import { clear, save, sync } from "@equinor/eds-icons";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { VariablesTable } from "./VariablesTable";
import { ExpressionDescriptionTextField } from "./ExpressionDescriptionTextField";
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
    areVariableVectorMapsEqual,
    isVariableVectorMapValid,
    isExpressionNameValidAndNotOccupiedByVectors,
} from "../utils/VectorCalculatorHelperFunctions";
import { getExpressionParseData } from "../utils/ExpressionParser";

import "../VectorCalculator.css";

interface ExpressionInputComponent {
    activeExpression: ExpressionType;
    expressions: ExpressionType[];
    vectors: TreeDataNode[];
    externalParsing: boolean;
    maxExpressionDescriptionLength: number;
    externalParseData?: ExternalParseData;
    disabled?: boolean;
    onExpressionChange: (expression: ExpressionType) => void;
    onExternalExpressionParsing: (expression: ExpressionType) => void;
}

export const ExpressionInputComponent: React.FC<ExpressionInputComponent> = (
    props: ExpressionInputComponent
) => {
    const { activeExpression, expressions, externalParsing, disabled } = props;
    const [isExpressionNameValid, setIsExpressionNameValid] =
        React.useState<boolean>(
            isExpressionNameValidAndNotOccupiedByVectors(
                activeExpression.name,
                props.vectors
            )
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
        isExpressionNameValid &&
            expressionStatus === ExpressionStatus.Valid &&
            isValidVariableVectorMap
    );
    const [isExpressionEdited, setIsExpressionEdited] =
        React.useState<boolean>(false);

    const [editableExpression, setEditableExpression] =
        React.useState<ExpressionType>(activeExpression);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>([]);
    const [parsingMessage, setParsingMessage] = React.useState<string>("");

    Icon.add({ clear, save, sync });

    const getVariableVectorMapFromVariables = React.useCallback(
        (variables: string[]): VariableVectorMapType[] => {
            const map: VariableVectorMapType[] = [];
            for (const variable of variables) {
                const cachedElm = cachedVariableVectorMap.find(
                    (elm) => elm.variableName === variable
                );
                if (!cachedElm) {
                    map.push({ variableName: variable, vectorName: [] });
                } else {
                    map.push(cachedElm);
                }
            }
            return map;
        },
        [cachedVariableVectorMap]
    );

    const makeVariableVectorMapFromExpression = React.useCallback(
        (expression: ExpressionType): VariableVectorMapType[] => {
            if (expression.expression.length === 0) {
                return [];
            }

            const parseData = getExpressionParseData(expression.expression);
            if (!parseData.isValid) {
                return cloneDeep(editableExpression.variableVectorMap);
            }
            return getVariableVectorMapFromVariables(parseData.variables);
        },
        [
            editableExpression,
            getExpressionParseData,
            getVariableVectorMapFromVariables,
        ]
    );

    const getUpdatedCachedVariableVectorMap = React.useCallback(
        (newMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap = cloneDeep(
                cachedVariableVectorMap
            );
            for (const elm of newMap) {
                const cachedElm = newCachedVariableVectorMap.find(
                    (cachedElm) => cachedElm.variableName === elm.variableName
                );
                if (!cachedElm) {
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
            isExpressionNameValid &&
                expressionStatus === ExpressionStatus.Valid &&
                isValidVariableVectorMap
        );
    }, [isExpressionNameValid, expressionStatus, isValidVariableVectorMap]);

    React.useEffect(() => {
        const isNameEdited = activeExpression.name !== editableExpression.name;
        const isExpressionEdited =
            activeExpression.expression !== editableExpression.expression;
        const isVariableVectorMapEdited = !areVariableVectorMapsEqual(
            activeExpression.variableVectorMap,
            editableExpression.variableVectorMap
        );
        const isDescriptionEdited =
            activeExpression.description !== editableExpression.description;
        const isEdited =
            activeExpression.id === editableExpression.id &&
            (isNameEdited ||
                isExpressionEdited ||
                isVariableVectorMapEdited ||
                isDescriptionEdited);

        setIsExpressionEdited(isEdited);
    }, [editableExpression]);

    React.useEffect(() => {
        if (!props.externalParseData) {
            return;
        }

        // Ensure evaluated expression is equal current editable expression
        if (
            props.externalParseData.id !== editableExpression.id ||
            props.externalParseData.expression !== editableExpression.expression
        ) {
            return;
        }

        const newEditableExpression = cloneDeep(editableExpression);

        setParsingMessage(props.externalParseData.message);
        setExpressionStatus(
            props.externalParseData.isValid
                ? ExpressionStatus.Valid
                : ExpressionStatus.Invalid
        );

        // Update variable vector map when valid expression
        if (props.externalParseData.isValid) {
            newEditableExpression.variableVectorMap =
                getVariableVectorMapFromVariables(
                    props.externalParseData.variables
                );
        }

        setEditableExpression(newEditableExpression);
        setIsValidVariableVectorMap(
            isVariableVectorMapValid(
                newEditableExpression.variableVectorMap,
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

        setIsExpressionNameValid(
            isExpressionNameValidAndNotOccupiedByVectors(
                activeExpressionClone.name,
                props.vectors
            )
        );
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
            const parseData = getExpressionParseData(
                activeExpressionClone.expression
            );
            setExpressionStatus(
                parseData.isValid
                    ? ExpressionStatus.Valid
                    : ExpressionStatus.Invalid
            );
            getExpressionParseData(activeExpressionClone.expression)
                .parsingMessage;
            setParsingMessage(parseData.parsingMessage);
        }
    }, [
        activeExpression,
        externalParsing,
        props.vectors,
        props.onExternalExpressionParsing,
        getExpressionParseData,
        isExpressionNameValidAndNotOccupiedByVectors,
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
                getExpressionParseData(activeExpression.expression).isValid
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
        getExpressionParseData,
    ]);

    const handleExpressionNameChange = (newName: string): void => {
        setEditableExpression({ ...editableExpression, name: newName });
    };

    const handleIsExpressionNameValidChange = (isValid: boolean): void => {
        setIsExpressionNameValid(isValid);
    };

    const handleExpressionDescriptionChange = (
        newDescription: string
    ): void => {
        setEditableExpression({
            ...editableExpression,
            description: newDescription,
        });
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
                    makeVariableVectorMapFromExpression(updatedExpression);
                updatedExpression.variableVectorMap = newMap;

                setIsValidVariableVectorMap(
                    isVariableVectorMapValid(newMap, ":", props.vectors)
                );
                const parseData = getExpressionParseData(
                    updatedExpression.expression
                );
                setExpressionStatus(
                    parseData.isValid
                        ? ExpressionStatus.Valid
                        : ExpressionStatus.Invalid
                );
                setParsingMessage(parseData.parsingMessage);
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
            getExpressionParseData,
            props.onExternalExpressionParsing,
            makeVariableVectorMapFromExpression,
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
                    vectors={props.vectors}
                    disabled={disabled}
                    onNameChange={handleExpressionNameChange}
                    onValidChange={handleIsExpressionNameValidChange}
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
            <Grid item>
                <ExpressionDescriptionTextField
                    description={editableExpression.description}
                    disabled={disabled}
                    maxLength={props.maxExpressionDescriptionLength}
                    onDescriptionChange={handleExpressionDescriptionChange}
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
                        disabled={disabled || !isValid || !isExpressionEdited}
                    >
                        <Icon key="save" name="save" />
                        Save
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};
