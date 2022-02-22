import React from "react";
import {
    Paper,
    Table,
    TableContainer,
    TableRow,
    TableBody,
    TableCell,
} from "@material-ui/core";
import { TreeDataNode } from "@webviz/core-components";
import cloneDeep from "lodash/cloneDeep";

import { ExpressionStatus, StoreActions, useStore } from "./ExpressionsStore";
import { VariableVectorMapType } from "../utils/VectorCalculatorTypes";
import { isVariableVectorMapValid } from "../utils/VectorCalculatorHelperFunctions";
import VectorSelector from "../../VectorSelector";

import { getExpressionParseData } from "../utils/ExpressionParser";
import { areVariableVectorMapsEqual } from "../utils/VectorCalculatorHelperFunctions";


import "!style-loader!css-loader!../VectorCalculator.css";

interface VariablesTableProps {
    // variableVectorMap: VariableVectorMapType[];
    vectorData: TreeDataNode[];
    disabled?: boolean;
    // onMapChange: (variableVectorMap: VariableVectorMapType[]) => void;
}

type VectorSelectorParentProps = {
    selectedTags: string[];
    selectedNodes: string[];
    selectedIds: string[];
};

export const VariablesTable: React.FC<VariablesTableProps> = (
    props: VariablesTableProps
) => {
    const { vectorData } = props;
    const store = useStore();
    const [variableVectorMap, setVariableVectorMap] = React.useState<
        VariableVectorMapType[]
    >(store.state.editableExpression.variableVectorMap);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>(store.state.editableExpression.variableVectorMap);
    const disabled = props.disabled || false;

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
        (expression: string): VariableVectorMapType[] => {
            if (expression.length === 0) {
                return [];
            }

            const parseData = getExpressionParseData(expression);
            if (!parseData.isValid) {
                return cloneDeep(variableVectorMap);
            }
            return getVariableVectorMapFromVariables(parseData.variables);
        },
        [
            variableVectorMap,
            getExpressionParseData,
            getVariableVectorMapFromVariables,
        ]
    );

    React.useEffect(() => {
        const newVariableVectorMap = cloneDeep(
            store.state.activeExpression.variableVectorMap
        );
        if(!areVariableVectorMapsEqual(variableVectorMap, newVariableVectorMap)) {
            setVariableVectorMap(newVariableVectorMap);
            setCachedVariableVectorMap(newVariableVectorMap);
        }
    }, [store.state.activeExpression.variableVectorMap]);

    const updatedCachedVariableVectorMap = React.useCallback(
        (variableVectorMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap = cloneDeep(
                cachedVariableVectorMap
            );
            for (const elm of variableVectorMap) {
                // Find cachedElm reference object
                let cachedElm = newCachedVariableVectorMap.find(
                    (cachedElm) => cachedElm.variableName === elm.variableName
                );
                if (!cachedElm) {
                    newCachedVariableVectorMap.push(elm);
                } else {
                    // Update cachedElm reference 
                    cachedElm.vectorName = elm.vectorName;
                }
            }
            return newCachedVariableVectorMap;
        },
        [cachedVariableVectorMap]
    );

    React.useEffect(() => {
        const newVariableVectorMap = cloneDeep(
            store.state.editableExpression.variableVectorMap
        );
        
        // Update map when expression string is reset
        if(areVariableVectorMapsEqual(store.state.activeExpression.variableVectorMap, newVariableVectorMap)){
            setVariableVectorMap(newVariableVectorMap);
            return;
        }

        // Update cache during editing
        if(!areVariableVectorMapsEqual(variableVectorMap, newVariableVectorMap)) {
            setVariableVectorMap(newVariableVectorMap);
            setCachedVariableVectorMap(
                updatedCachedVariableVectorMap(newVariableVectorMap)
            );
        }
    }, [store.state.editableExpression.variableVectorMap]);

    React.useEffect(() => {
        if (store.state.externalParsing) {
            return;
        }
        if (store.state.editableExpressionStatus !== ExpressionStatus.Valid) {
            return;
        }

        const newVariableVectorMap = makeVariableVectorMapFromExpression(
            store.state.editableExpression.expression
        );
        const mapStatus = isVariableVectorMapValid(
            newVariableVectorMap,
            ":",
            vectorData
        );
        store.dispatch({
            type: StoreActions.SetVariableVectorMap,
            payload: {
                variableVectorMap: newVariableVectorMap,
                status: mapStatus,
            },
        });
    }, [
        store.state.editableExpression.expression,
        store.state.editableExpressionStatus,
    ]);

    const updateProps = React.useCallback(
        (
            vectorSelectorProps: VectorSelectorParentProps,
            index: number
        ): void => {
            const newVariableVectorMap = cloneDeep(variableVectorMap);
            if (vectorSelectorProps.selectedTags.length < 1) {
                newVariableVectorMap[index].vectorName = [];
            } else {
                newVariableVectorMap[index].vectorName[0] =
                    vectorSelectorProps.selectedTags[0];
            }

            const mapStatus = isVariableVectorMapValid(
                newVariableVectorMap,
                ":",
                vectorData
            );
            store.dispatch({
                type: StoreActions.SetVariableVectorMap,
                payload: {
                    variableVectorMap: newVariableVectorMap,
                    status: mapStatus,
                },
            });
        },
        [variableVectorMap]
    );

    return (
        <TableContainer component={Paper} className="VariablesTableContainer">
            {disabled && <div className="DisableOverlay" />}
            <Table>
                <TableBody>
                    {variableVectorMap.map((row, index) => {
                        return (
                            <TableRow
                                tabIndex={-1}
                                key={"row_" + row.variableName}
                            >
                                <TableCell align="left" key={row.variableName}>
                                    {row.variableName}
                                </TableCell>
                                <TableCell key={`cell_${row.variableName}`}>
                                    <VectorSelector
                                        id={
                                            "vector_selector_" +
                                            row.variableName
                                        }
                                        key={
                                            "vector_selector_" +
                                            row.variableName
                                        }
                                        delimiter=":"
                                        label=""
                                        selectedTags={row.vectorName}
                                        setProps={(props) =>
                                            updateProps(props, index)
                                        }
                                        numMetaNodes={0}
                                        maxNumSelectedNodes={1}
                                        numSecondsUntilSuggestionsAreShown={0}
                                        placeholder="Add new vector..."
                                        data={vectorData}
                                        caseInsensitiveMatching={true}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
