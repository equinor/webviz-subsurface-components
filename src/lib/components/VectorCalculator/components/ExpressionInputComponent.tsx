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
import { ExpressionInputTextField } from "./ExpressionInputTextField";
import { VariablesTable } from "./VariablesTable";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";

import { isVariableVectorMapValid } from "../utils/VectorCalculatorHelperFunctions";
import {
    parseExpression,
    retrieveVariablesFromValidExpression,
    parseExpressionName,
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
    const [isValidName, setIsValidName] = React.useState(true);
    const [isValidExpression, setIsValidExpression] = React.useState(true); // TODO: Set correct initial value (external parsing?)
    const [isValidVariableVectorMap, setIsValidVariableVectorMap] =
        React.useState(
            isVariableVectorMapValid(
                activeExpression.variableVectorMap,
                ":",
                props.vectors
            )
        );
    const [editableExpression, setEditableExpression] =
        React.useState<ExpressionType>(activeExpression);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>([]);

    Icon.add({ clear });
    Icon.add({ save });
    Icon.add({ sync });

    React.useEffect(() => {
        if (
            props.externalParseData !== undefined &&
            editableExpression.id === props.externalParseData.id
        ) {
            // NOTE: expression is not written as this overwrites inputfield,
            // but this implies that expression str and isValid state can be
            // inconsistent on slow network flow.
            const newEditabledExpression = cloneDeep(editableExpression);

            setIsValidExpression(props.externalParseData.isValid);

            // Update variable vector map when valid expression
            if (props.externalParseData.isValid) {
                const newVariableVectorMap: VariableVectorMapType[] = [];
                for (const variable of props.externalParseData.variables) {
                    const cachedElm: VariableVectorMapType | undefined =
                        cachedVariableVectorMap.find(
                            (cachedElm) => cachedElm.variableName === variable
                        );
                    if (cachedElm === undefined) {
                        newVariableVectorMap.push({
                            variableName: variable,
                            vectorName: [],
                        });
                    } else {
                        newVariableVectorMap.push(cachedElm);
                    }
                }
                newEditabledExpression.variableVectorMap = newVariableVectorMap;
            }

            setEditableExpression(newEditabledExpression);
            setIsValidVariableVectorMap(
                isVariableVectorMapValid(
                    newEditabledExpression.variableVectorMap,
                    ":",
                    props.vectors
                )
            );
        }
    }, [props.externalParseData]);

    React.useEffect(() => {
        const activeExpressionClone = cloneDeep(activeExpression);
        const variableVectorMapClone = cloneDeep(
            activeExpression.variableVectorMap
        );
        setEditableExpression(activeExpressionClone);
        setCachedVariableVectorMap(variableVectorMapClone);

        setIsValidName(parseExpressionName(activeExpressionClone.name));
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
            setIsValidExpression(
                parseExpression(activeExpressionClone.expression)
            );
        }
    }, [activeExpression]);

    const handleSaveClick = (): void => {
        const isValid =
            isValidName && isValidExpression && isValidVariableVectorMap;
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
    };

    const onNameChange = (newName: string): void => {
        setEditableExpression({ ...editableExpression, name: newName });
    };
    const onValidNameChange = (isValid: boolean): void => {
        setIsValidName(isValid);
    };

    const onExpressionChange = (newExpression: string): void => {
        // Handle parsing externally
        if (externalParsing) {
            const updatedExpression = {
                ...editableExpression,
                expression: newExpression,
            };
            setEditableExpression(updatedExpression);
            props.onExternalExpressionParsing(updatedExpression);
        } else {
            const updatedExpression = {
                ...editableExpression,
                expression: newExpression,
            };

            // TODO: Now the function returns editableExpression map from expression string character
            // Replace with same logic as for external parsing: Provide list of variables in expression
            // E.g.: Currently log(x+y) gives issue as log is a func
            const newMap =
                getVariableVectorMapFromExpression(updatedExpression);
            updatedExpression.variableVectorMap = newMap;

            setIsValidVariableVectorMap(
                isVariableVectorMapValid(newMap, ":", props.vectors)
            );
            setIsValidExpression(parseExpression(updatedExpression.expression));
            setEditableExpression(updatedExpression);
        }
    };

    const onVariableVectorMapChange = (
        newVariableVectorMap: VariableVectorMapType[]
    ): void => {
        const newCachedMap =
            getUpdatedCachedVariableVectorMap(newVariableVectorMap);
        setCachedVariableVectorMap(newCachedMap);

        setIsValidVariableVectorMap(
            isVariableVectorMapValid(newVariableVectorMap, ":", props.vectors)
        );

        const newEditableExpression: ExpressionType = {
            ...editableExpression,
            variableVectorMap: newVariableVectorMap,
        };

        // Handle parsing externally
        if (externalParsing) {
            props.onExpressionChange(newEditableExpression);
        } else {
            setEditableExpression(newEditableExpression);
        }
    };

    const getUpdatedCachedVariableVectorMap = useCallback(
        (newMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap: VariableVectorMapType[] = [];
            for (const elm of newMap) {
                const cachedElm: VariableVectorMapType | undefined =
                    cachedVariableVectorMap.find(
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
            const map: VariableVectorMapType[] = [];
            for (const variable of variables) {
                const existingMap: VariableVectorMapType | undefined =
                    cachedVariableVectorMap.find(
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
            retrieveVariablesFromValidExpression,
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
                    isValid={isValidExpression}
                    disabled={disabled}
                    onExpressionChange={onExpressionChange}
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
